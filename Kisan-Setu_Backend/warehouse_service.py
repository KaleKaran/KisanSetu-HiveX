"""Seed dimensions, log facts, expose warehouse JSON for the frontend."""
from __future__ import annotations

from datetime import datetime
from typing import Any, Optional

from flask import Flask, Request, current_app

from extensions import db
from models import (
    DimCrop,
    DimFarmer,
    DimFertilizer,
    DimGrowthStage,
    DimPanchayat,
    DimSector,
    DimSoil,
    DimTime,
    FactRecommendation,
    TelemetryEvent,
)

CROP_ROWS = [
    ("crop_wheat", "Wheat"),
    ("crop_rice", "Rice"),
    ("crop_maize", "Maize"),
    ("crop_cotton", "Cotton"),
    ("crop_potato", "Potato"),
    ("crop_sugarcane", "Sugarcane"),
    ("crop_tomato", "Tomato"),
]

SOIL_ROWS = [
    ("soil_clay", "Clay"),
    ("soil_sandy", "Sandy"),
    ("soil_loamy", "Loamy"),
    ("soil_silt", "Silt"),
]

STAGE_ROWS = [
    ("stage_sowing", "Sowing"),
    ("stage_vegetative", "Vegetative"),
    ("stage_flowering", "Flowering"),
    ("stage_harvest", "Harvest"),
]

SEASON_ROWS = ["Kharif", "Rabi", "Zaid"]
IRRIGATION_ROWS = ["Canal", "Sprinkler", "Drip", "Rainfed"]
REGION_ROWS = ["North", "South", "East", "West", "Central"]

LABEL_TO_CROP = {b: a for a, b in CROP_ROWS}
LABEL_TO_SOIL = {b: a for a, b in SOIL_ROWS}
LABEL_TO_STAGE = {b: a for a, b in STAGE_ROWS}


def _time_parts(ts: datetime) -> tuple[int, int, int, int, int]:
    return (
        ts.year,
        ts.month,
        ts.day,
        ts.hour,
        int(ts.strftime("%Y%m%d")),
    )


def seed_reference_dimensions() -> None:
    if DimCrop.query.first() is None:
        for code, label in CROP_ROWS:
            db.session.add(DimCrop(code=code, label_en=label))
    if DimSoil.query.first() is None:
        for code, label in SOIL_ROWS:
            db.session.add(DimSoil(code=code, label_en=label))
    if DimGrowthStage.query.first() is None:
        for code, label in STAGE_ROWS:
            db.session.add(DimGrowthStage(code=code, label_en=label))
    db.session.commit()


def seed_location_snowflake() -> tuple[DimPanchayat, DimSector]:
    gp = DimPanchayat.query.filter_by(code="GP-DEFAULT").first()
    if not gp:
        gp = DimPanchayat(code="GP-DEFAULT", name="Default Gram Panchayat")
        db.session.add(gp)
        db.session.flush()
    sec = DimSector.query.filter_by(panchayat_id=gp.id, label="Sector 1 - North").first()
    if not sec:
        sec = DimSector(panchayat_id=gp.id, label="Sector 1 - North")
        db.session.add(sec)
        db.session.flush()
    db.session.commit()
    return gp, sec


def seed_demo_facts(app_mode: str, count: int = 12) -> None:
    gp, sec = seed_location_snowflake()
    farmer = DimFarmer.query.filter_by(external_id="F-DEMO-001").first()
    if not farmer:
        farmer = DimFarmer(external_id="F-DEMO-001", display_name="Demo Farmer", sector_id=sec.id)
        db.session.add(farmer)
        db.session.flush()

    crops = DimCrop.query.all()
    soils = DimSoil.query.all()
    stages = DimGrowthStage.query.all()
    ferts = []
    for name in ("Urea", "DAP", "MOP", "NPK"):
        f = DimFertilizer.query.filter_by(name=name).first()
        if not f:
            f = DimFertilizer(name=name)
            db.session.add(f)
            db.session.flush()
        ferts.append(f)

    db.session.commit()

    import random

    rng = random.Random(42)
    base = datetime(2026, 1, 1, 8, 0, 0)
    for i in range(count):
        ts = base.replace(day=1 + (i % 28), hour=8 + (i % 8))
        y, m, d, h, dk = _time_parts(ts)
        tdim = DimTime(event_ts=ts, date_key=dk, year=y, month=m, day_of_month=d, hour=h)
        db.session.add(tdim)
        db.session.flush()
        cr = rng.choice(crops)
        sl = rng.choice(soils)
        st = rng.choice(stages)
        fr = rng.choice(ferts)
        fact = FactRecommendation(
            time_id=tdim.id,
            crop_id=cr.id,
            soil_id=sl.id,
            stage_id=st.id,
            fertilizer_id=fr.id,
            farmer_id=farmer.id,
            soil_ph=round(5.5 + rng.random() * 2.5, 2),
            soil_moisture=round(20 + rng.random() * 50, 2),
            nitrogen=round(30 + rng.random() * 100, 2),
            phosphorus=round(15 + rng.random() * 50, 2),
            potassium=round(20 + rng.random() * 80, 2),
            temperature=round(22 + rng.random() * 12, 2),
            humidity=round(40 + rng.random() * 40, 2),
            rainfall=round(600 + rng.random() * 1800, 2),
            ph_status="Normal",
            nitrogen_status="Medium",
            phosphorus_status="Medium",
            potassium_status="Medium",
            moisture_status="Optimal",
            app_mode_at_write=app_mode,
        )
        db.session.add(fact)
    db.session.commit()


def init_warehouse_db(app: Flask) -> None:
    with app.app_context():
        db.create_all()
        seed_reference_dimensions()
        seed_location_snowflake()
        if FactRecommendation.query.first() is None:
            seed_demo_facts("simulation")


def get_data_mode(req: Request) -> str:
    h = (req.headers.get("X-Data-Mode") or "").strip().lower()
    if h in ("simulation", "live"):
        return h
    return (current_app.config.get("APP_MODE") or "simulation").lower()


def get_or_create_fertilizer(name: str) -> DimFertilizer:
    row = DimFertilizer.query.filter_by(name=name).first()
    if row:
        return row
    row = DimFertilizer(name=name)
    db.session.add(row)
    db.session.flush()
    return row


def resolve_crop(soil_type_label: str, crop_type_label: str, growth_stage_label: str) -> tuple[DimCrop, DimSoil, DimGrowthStage]:
    ck = LABEL_TO_CROP.get(crop_type_label)
    sk = LABEL_TO_SOIL.get(soil_type_label)
    gk = LABEL_TO_STAGE.get(growth_stage_label)
    if not ck or not sk or not gk:
        raise ValueError("Unknown crop/soil/stage label for dimension lookup")
    crop = DimCrop.query.filter_by(code=ck).first()
    soil = DimSoil.query.filter_by(code=sk).first()
    stage = DimGrowthStage.query.filter_by(code=gk).first()
    if not crop or not soil or not stage:
        raise ValueError("Dimension row missing")
    return crop, soil, stage


def get_or_create_farmer_hierarchy(
    panchayat_code: Optional[str],
    panchayat_name: Optional[str],
    sector_label: Optional[str],
    farmer_external_id: Optional[str],
    farmer_name: Optional[str],
) -> Optional[int]:
    if not sector_label and not farmer_external_id:
        return None
    code = panchayat_code or "GP-DEFAULT"
    pname = panchayat_name or "Gram Panchayat"
    gp = DimPanchayat.query.filter_by(code=code).first()
    if not gp:
        gp = DimPanchayat(code=code, name=pname)
        db.session.add(gp)
        db.session.flush()
    slabel = sector_label or "Sector 1"
    sec = DimSector.query.filter_by(panchayat_id=gp.id, label=slabel).first()
    if not sec:
        sec = DimSector(panchayat_id=gp.id, label=slabel)
        db.session.add(sec)
        db.session.flush()
    if not farmer_external_id:
        return None
    fr = DimFarmer.query.filter_by(external_id=farmer_external_id).first()
    if not fr:
        fr = DimFarmer(
            external_id=farmer_external_id,
            display_name=farmer_name or farmer_external_id,
            sector_id=sec.id,
        )
        db.session.add(fr)
        db.session.flush()
    return fr.id


def log_recommendation_event(
    app_mode: str,
    *,
    soil_type_label: str,
    crop_type_label: str,
    growth_stage_label: str,
    fertilizer_name: str,
    measures: dict[str, float],
    statuses: dict[str, str],
    panchayat_code: Optional[str] = None,
    panchayat_name: Optional[str] = None,
    sector_label: Optional[str] = None,
    farmer_external_id: Optional[str] = None,
    farmer_name: Optional[str] = None,
    extra_params: Optional[dict] = None,
) -> Optional[int]:
    try:
        p = extra_params or {}
        crop, soil, stage = resolve_crop(soil_type_label, crop_type_label, growth_stage_label)
        fert = get_or_create_fertilizer(fertilizer_name)
        farmer_id = get_or_create_farmer_hierarchy(
            panchayat_code,
            panchayat_name,
            sector_label,
            farmer_external_id,
            farmer_name,
        )
        now = datetime.utcnow()
        y, m, d, h, dk = _time_parts(now)
        tdim = DimTime(event_ts=now, date_key=dk, year=y, month=m, day_of_month=d, hour=h)
        db.session.add(tdim)
        db.session.flush()
        fact = FactRecommendation(
            time_id=tdim.id,
            crop_id=crop.id,
            soil_id=soil.id,
            stage_id=stage.id,
            fertilizer_id=fert.id,
            farmer_id=farmer_id,
            soil_ph=measures["soil_ph"],
            soil_moisture=measures["soil_moisture"],
            nitrogen=measures["nitrogen"],
            phosphorus=measures["phosphorus"],
            potassium=measures["potassium"],
            temperature=measures["temperature"],
            humidity=measures["humidity"],
            rainfall=measures["rainfall"],
            ph_status=statuses.get("ph_status"),
            nitrogen_status=statuses.get("nitrogen_status"),
            phosphorus_status=statuses.get("phosphorus_status"),
            potassium_status=statuses.get("potassium_status"),
            moisture_status=statuses.get("moisture_status"),
            organic_carbon=p.get("organic_carbon"),
            electrical_conductivity=p.get("electrical_conductivity"),
            season=p.get("season"),
            irrigation_type=p.get("irrigation_type"),
            previous_crop=p.get("previous_crop"),
            region=p.get("region"),
            fertilizer_used_last_season=p.get("fertilizer_used_last_season"),
            yield_last_season=p.get("yield_last_season"),
            app_mode_at_write=app_mode,
        )
        db.session.add(fact)
        db.session.flush()
        db.session.add(TelemetryEvent(
            event_type="recommendation",
            app_mode=app_mode,
            message=f"Created fact {fact.id}",
            fact_id=fact.id
        ))
        db.session.commit()
        return fact.id
    except Exception:
        db.session.rollback()
        return None


def warehouse_snapshot(data_mode: str = "simulation") -> dict[str, Any]:
    dm = (data_mode or "simulation").lower()
    fq = FactRecommendation.query
    if dm == "live":
        fq = fq.filter(FactRecommendation.app_mode_at_write == "live")
    facts_raw = fq.order_by(FactRecommendation.id.desc()).limit(100).all()
    
    return {
        "dimensions": {
            "crops": [{"id": c.id, "code": c.code, "label": c.label_en} for c in DimCrop.query.all()],
            "soils": [{"id": s.id, "code": s.code, "label": s.label_en} for s in DimSoil.query.all()],
        },
        "facts": [
            {
                "id": r.id,
                "measures": {"n": r.nitrogen, "p": r.phosphorus, "k": r.potassium, "ph": r.soil_ph},
                "predicted": r.fertilizer.name if r.fertilizer else "Unknown",
                "app_mode": r.app_mode_at_write
            } for r in facts_raw
        ]
    }
