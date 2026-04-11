from functools import wraps
import os
import secrets

import joblib
import pandas as pd
from flask import Flask, g, jsonify, request
from flask_cors import CORS

from auth_service import (
    hash_password,
    issue_token,
    registration_dict,
    user_from_request,
    user_public,
    verify_password,
)
from config import Config
from extensions import db
from models import FarmerRegistration, User
from warehouse_service import get_data_mode, init_warehouse_db, log_recommendation_event, warehouse_snapshot

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "Kisan-Setu_Model_and_Encoders")

app = Flask(__name__)
app.config.from_object(Config)
app.config["SQLALCHEMY_DATABASE_URI"] = Config.init_db_uri()
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = Config.sqlalchemy_engine_options()
db.init_app(app)
CORS(app, allow_headers=["Content-Type", "Authorization", "X-Data-Mode"])

init_warehouse_db(app)

try:
    model = joblib.load(os.path.join(MODEL_DIR, "fertilizer_model_final_V2.pkl"))
    soil_encoder = joblib.load(os.path.join(MODEL_DIR, "soil_encoder.pkl"))
    crop_encoder = joblib.load(os.path.join(MODEL_DIR, "crop_encoder.pkl"))
    stage_encoder = joblib.load(os.path.join(MODEL_DIR, "stage_encoder.pkl"))
    fert_encoder = joblib.load(os.path.join(MODEL_DIR, "fert_encoder.pkl"))
    thresholds = joblib.load(os.path.join(MODEL_DIR, "nutrient_thresholds.pkl"))
    feature_columns = joblib.load(os.path.join(MODEL_DIR, "feature_columns.pkl"))
    print("Model and Encoders loaded successfully.")
except Exception as e:
    print(f"Error loading models: {e}")
    model = None


def soil_ph_status(ph):
    if ph < 6.0:
        return "Acidic Soil"
    elif 6.0 <= ph <= 8.5:
        return "Normal / Optimal Soil"
    elif 8.5 < ph <= 9.0:
        return "Tending to Alkaline"
    else:
        return "Alkaline Soil"


def nutrient_status(value, low, high):
    if value < low:
        return "Low"
    elif value <= high:
        return "Medium"
    else:
        return "High"


fertilizer_dosage = {
    "Urea": "50-60 kg/acre (apply in 3 split doses: at sowing, tiltering, and panicle initiation phases).",
    "DAP": "40-50 kg/acre (apply as a basal dose during soil preparation).",
    "MOP": "20-25 kg/acre (apply at sowing for root strength and drought resistance).",
    "SSP": "80-100 kg/acre (ideal for phosphorus-deficient soil with lower nitrogen requirement).",
    "Ammonium Sulfate": "40 kg/acre (nitrogen source with sulfur, good for crops like oilseeds).",
    "NPK 19-19-19": "2-3 kg/acre via foliar spray (complete nutrient water-soluble).",
    "NPK 12-32-16": "50 kg/acre (balanced NPK for root and fruit development).",
    "NPK 10-26-26": "60 kg/acre (high potassium and phosphorus for tuber/fruit crops).",
    "Magnesium Sulphate": "10-15 kg/acre (essential for chlorophyll synthesis and leaf health).",
    "Ferrous Sulphate": "5-8 kg/acre (to correct iron deficiency/chlorosis in young leaves).",
    "Zinc Sulphate": "10-12 kg/acre (critical for hormone production and overall growth).",
    "Borax": "5 kg/acre (improves flower retention and fruit quality).",
    "Potassium Nitrate": "1-2 kg/acre (foliar application during fruit development stage)."
}

advisory_note = "Final dosage should follow agronomist specialist. Use as per the guide in the Fertilizer Recommendation Manual."


def require_auth(f):
    @wraps(f)
    def wrapped(*args, **kwargs):
        u = user_from_request(request)
        if not u:
            return jsonify({"error": "Unauthorized"}), 401
        g.user = u
        return f(*args, **kwargs)

    return wrapped


def require_roles(*roles):
    def deco(f):
        @wraps(f)
        def wrapped(*args, **kwargs):
            u = user_from_request(request)
            if not u:
                return jsonify({"error": "Unauthorized"}), 401
            if u.role not in roles:
                return jsonify({"error": "Forbidden"}), 403
            g.user = u
            return f(*args, **kwargs)

        return wrapped

    return deco


@app.route("/api/auth/register", methods=["POST"])
def api_register():
    data = request.json or {}
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""
    role = (data.get("role") or "").strip()
    display_name = (data.get("display_name") or username).strip()
    if len(username) < 3 or len(password) < 4:
        return jsonify({"error": "Username (3+) and password (4+) required"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already taken"}), 400

    if role == "gp_officer":
        pcode = (data.get("panchayat_code") or "").strip()
        if not pcode:
            return jsonify({"error": "panchayat_code is required for Gram Panchayat signup"}), 400
        u = User(
            username=username,
            password_hash=hash_password(password),
            role="gp_officer",
            display_name=display_name,
            panchayat_code=pcode,
        )
        db.session.add(u)
        db.session.commit()
        token = issue_token(u)
        return jsonify({"token": token, "user": user_public(u)}), 201

    if role == "farmer":
        u = User(
            username=username,
            password_hash=hash_password(password),
            role="farmer",
            display_name=display_name,
            panchayat_code=(data.get("panchayat_code") or "").strip() or None,
        )
        db.session.add(u)
        db.session.flush()
        fr = FarmerRegistration(
            user_id=u.id,
            gp_officer_id=None,
            panchayat_code=u.panchayat_code or "",
            external_ref=f"U-{u.id}",
            name=display_name,
            sector=data.get("sector") or "",
            area_text=data.get("area") or "",
        )
        db.session.add(fr)
        db.session.commit()
        token = issue_token(u)
        return jsonify({"token": token, "user": user_public(u)}), 201

    return jsonify({"error": "role must be farmer or gp_officer"}), 400


@app.route("/api/auth/login", methods=["POST"])
def api_login():
    data = request.json or {}
    username = (data.get("username") or "").strip().lower()
    password = data.get("password") or ""
    u = User.query.filter_by(username=username).first()
    if not u or not verify_password(u, password):
        return jsonify({"error": "Invalid username or password"}), 401
    token = issue_token(u)
    return jsonify({"token": token, "user": user_public(u)})


@app.route("/api/auth/me", methods=["GET"])
@require_auth
def api_me():
    return jsonify({"user": user_public(g.user)})


@app.route("/api/gp/registrations", methods=["GET"])
@require_roles("gp_officer")
def gp_list_registrations():
    rows = (
        FarmerRegistration.query.filter_by(gp_officer_id=g.user.id)
        .order_by(FarmerRegistration.created_at.desc())
        .all()
    )
    return jsonify({"farmers": [registration_dict(r) for r in rows]})


@app.route("/api/gp/registrations", methods=["POST"])
@require_roles("gp_officer")
def gp_create_registration():
    data = request.json or {}
    name = (data.get("name") or "").strip()
    if not name:
        return jsonify({"error": "name is required"}), 400
    ext = (data.get("external_ref") or "").strip() or f"GP-{g.user.id}-{secrets.token_hex(3).upper()}"
    if FarmerRegistration.query.filter_by(external_ref=ext).first():
        return jsonify({"error": "external_ref already used"}), 400

    def _f(key, default):
        try:
            return float(data.get(key, default) or 0)
        except (TypeError, ValueError):
            return float(default)

    r = FarmerRegistration(
        gp_officer_id=g.user.id,
        user_id=None,
        panchayat_code=g.user.panchayat_code or "",
        external_ref=ext,
        name=name,
        sector=(data.get("sector") or "").strip(),
        area_text=(data.get("area") or "").strip(),
        nitrogen=_f("n", 50),
        phosphorus=_f("p", 35),
        potassium=_f("k", 45),
        ph=_f("ph", 6.8),
        moisture=_f("moisture", 40),
        temp=_f("temp", 28),
        humidity=_f("humidity", 60),
        rainfall=_f("rainfall", 1200),
        notes=(data.get("notes") or "").strip()
    )
    db.session.add(r)
    db.session.commit()
    return jsonify(registration_dict(r)), 201


@app.route("/api/gp/registrations/<int:reg_id>", methods=["DELETE"])
@require_roles("gp_officer")
def gp_delete_registration(reg_id):
    r = FarmerRegistration.query.filter_by(id=reg_id, gp_officer_id=g.user.id).first()
    if not r:
        return jsonify({"error": "Registration not found"}), 404
    db.session.delete(r)
    db.session.commit()
    return jsonify({"success": True})


@app.route("/api/farmer/profile", methods=["GET"])
@require_roles("farmer")
def farmer_get_profile():
    r = FarmerRegistration.query.filter_by(user_id=g.user.id).first()
    if not r:
        return jsonify({"profile": None})
    return jsonify({"profile": registration_dict(r)})


@app.route("/api/mode", methods=["GET"])
def api_mode():
    uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    masked = uri.split("@")[-1] if "@" in uri else uri
    return jsonify(
        {
            "default_app_mode": app.config.get("APP_MODE", "simulation"),
            "data_mode_hint": "Send X-Data-Mode: simulation | live on API calls",
            "database_hint": masked,
            "orm": "SQLAlchemy",
            "postgres_ready": "postgresql" in uri.lower(),
        }
    )


@app.route("/api/warehouse", methods=["GET"])
def api_warehouse():
    mode = get_data_mode(request)
    snap = warehouse_snapshot(mode)
    snap["data_mode"] = mode
    snap["default_app_mode"] = app.config.get("APP_MODE", "simulation")
    return jsonify(snap)


@app.route("/predict", methods=["POST"])
def predict():
    try:
        if model is None:
            return jsonify({"error": "Model not loaded"}), 503

        data = request.json or {}
        mode = request.headers.get("X-Data-Mode", "simulation").lower()

        # Input gathering with strict type casting
        soil_type = data.get("soil_type")
        soil_ph = float(data.get("soil_ph") or 0.0)
        soil_moisture = float(data.get("soil_moisture") or 0.0)
        nitrogen = float(data.get("nitrogen") or 0.0)
        phosphorus = float(data.get("phosphorus") or 0.0)
        potassium = float(data.get("potassium") or 0.0)
        temperature = float(data.get("temperature") or 0.0)
        humidity = float(data.get("humidity") or 0.0)
        rainfall = float(data.get("rainfall") or 0.0)
        crop_type = data.get("crop_type")
        growth_stage = data.get("growth_stage")

        # STABILIZATION: Prevent output for 0-values in Live Mode
        if mode == "live":
            critical_sensors = [nitrogen, phosphorus, potassium, soil_moisture]
            if all(s == 0 for s in critical_sensors):
                return jsonify({
                    "error": "TELEMETRY_GAP",
                    "message": "IoT Database returns zero-values. Synthesis aborted to prevent incorrect recommendation."
                }), 400

        soil_type_enc = soil_encoder.transform([soil_type])[0]
        crop_type_enc = crop_encoder.transform([crop_type])[0]
        growth_stage_enc = stage_encoder.transform([growth_stage])[0]

        input_df = pd.DataFrame(
            [
                {
                    "Soil_Type": soil_type_enc,
                    "Soil_pH": soil_ph,
                    "Soil_Moisture": soil_moisture,
                    "Nitrogen_Level": nitrogen,
                    "Phosphorus_Level": phosphorus,
                    "Potassium_Level": potassium,
                    "Temperature": temperature,
                    "Humidity": humidity,
                    "Rainfall": rainfall,
                    "Crop_Type": crop_type_enc,
                    "Crop_Growth_Stage": growth_stage_enc,
                }
            ]
        )

        input_df = input_df[feature_columns]

        prediction = model.predict(input_df)[0]
        fertilizer = fert_encoder.inverse_transform([prediction])[0]

        ph_s = soil_ph_status(soil_ph)
        n_s = nutrient_status(nitrogen, thresholds["N_low"], thresholds["N_high"])
        p_s = nutrient_status(phosphorus, thresholds["P_low"], thresholds["P_high"])
        k_s = nutrient_status(potassium, thresholds["K_low"], thresholds["K_high"])
        m_s = "Low" if soil_moisture < 20 else "Optimal" if soil_moisture <= 50 else "High"

        res = {
            "predicted_fertilizer": fertilizer,
            "recommended_dosage": fertilizer_dosage.get(fertilizer, "Consult agronomist"),
            "advisory": advisory_note,
            "ph_status": ph_s,
            "nitrogen_status": n_s,
            "phosphorus_status": p_s,
            "potassium_status": k_s,
            "moisture_status": m_s,
        }

        mode = get_data_mode(request)
        if mode in ("simulation", "live"):
            log_recommendation_event(
                mode,
                soil_type_label=soil_type,
                crop_type_label=crop_type,
                growth_stage_label=growth_stage,
                fertilizer_name=str(fertilizer),
                measures={
                    "soil_ph": soil_ph,
                    "soil_moisture": soil_moisture,
                    "nitrogen": nitrogen,
                    "phosphorus": phosphorus,
                    "potassium": potassium,
                    "temperature": temperature,
                    "humidity": humidity,
                    "rainfall": rainfall,
                },
                statuses={
                    "ph_status": ph_s,
                    "nitrogen_status": n_s,
                    "phosphorus_status": p_s,
                    "potassium_status": k_s,
                    "moisture_status": m_s,
                },
                extra_params={},
                panchayat_code=data.get("panchayat_code"),
                panchayat_name=data.get("panchayat_name"),
                sector_label=data.get("sector"),
                farmer_external_id=data.get("farmer_id"),
                farmer_name=data.get("farmer_name"),
            )

        return jsonify(res)

    except Exception as e:
        return jsonify({"error": str(e)}), 400


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "healthy", "default_app_mode": app.config.get("APP_MODE", "simulation")}), 200


if __name__ == "__main__":
    app.run(debug=True, port=5001)
