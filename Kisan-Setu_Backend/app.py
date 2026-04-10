from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import pandas as pd
import os

app = Flask(__name__)
CORS(app)

# Load context-safe paths
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_DIR = os.path.join(BASE_DIR, "Kisan-Setu_Model_and_Encoders")

# Load model and encoders
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

def soil_ph_status(ph):
    if ph < 6.0: return "Acidic Soil"
    elif 6.0 <= ph <= 8.5: return "Normal / Optimal Soil"
    elif 8.5 < ph <= 9.0: return "Tending to Alkaline"
    else: return "Alkaline Soil"

def nutrient_status(value, low, high):
    if value < low: return "Low"
    elif value <= high: return "Medium"
    else: return "High"

fertilizer_dosage = {
    "Urea": "100–200 kg/ha",
    "DAP": "80–150 kg/ha",
    "MOP": "60–120 kg/ha",
    "SSP": "150–250 kg/ha",
    "NPK": "100–200 kg/ha",
    "Compost": "2–5 tons/ha",
    "Zinc Sulphate": "20–25 kg/ha"
}

advisory_note = "Final dosage should follow agronomist specialist. Use as per the guide in the Fertilizer Recommendation Manual."

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        
        # Extract inputs
        soil_type = data.get('soil_type')
        soil_ph = float(data.get('soil_ph'))
        soil_moisture = float(data.get('soil_moisture'))
        nitrogen = float(data.get('nitrogen'))
        phosphorus = float(data.get('phosphorus'))
        potassium = float(data.get('potassium'))
        temperature = float(data.get('temperature'))
        humidity = float(data.get('humidity'))
        rainfall = float(data.get('rainfall'))
        crop_type = data.get('crop_type')
        growth_stage = data.get('growth_stage')

        # Encode categorical values
        soil_type_enc = soil_encoder.transform([soil_type])[0]
        crop_type_enc = crop_encoder.transform([crop_type])[0]
        growth_stage_enc = stage_encoder.transform([growth_stage])[0]

        # Prepare dataframe
        input_df = pd.DataFrame([{
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
            "Crop_Growth_Stage": growth_stage_enc
        }])

        # Ensure correct column order
        input_df = input_df[feature_columns]

        # Predict
        prediction = model.predict(input_df)[0]
        fertilizer = fert_encoder.inverse_transform([prediction])[0]

        # Status determination
        res = {
            "predicted_fertilizer": fertilizer,
            "recommended_dosage": fertilizer_dosage.get(fertilizer, "Consult agronomist"),
            "advisory": advisory_note,
            "ph_status": soil_ph_status(soil_ph),
            "nitrogen_status": nutrient_status(nitrogen, thresholds["N_low"], thresholds["N_high"]),
            "phosphorus_status": nutrient_status(phosphorus, thresholds["P_low"], thresholds["P_high"]),
            "potassium_status": nutrient_status(potassium, thresholds["K_low"], thresholds["K_high"]),
            "moisture_status": "Low" if soil_moisture < 20 else "Optimal" if soil_moisture <= 50 else "High"
        }

        return jsonify(res)

    except Exception as e:
        return jsonify({"error": str(e)}), 400

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)
