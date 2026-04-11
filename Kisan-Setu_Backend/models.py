"""Star schema + snowflake location hierarchy for analytics and PostgreSQL scaling."""
from datetime import datetime

from extensions import db


class DimPanchayat(db.Model):
    __tablename__ = "dim_panchayat"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(64), unique=True, nullable=False, index=True)
    name = db.Column(db.String(256), nullable=False)

    sectors = db.relationship("DimSector", back_populates="panchayat")


class DimSector(db.Model):
    """Snowflake: child of panchayat."""

    __tablename__ = "dim_sector"

    id = db.Column(db.Integer, primary_key=True)
    panchayat_id = db.Column(db.Integer, db.ForeignKey("dim_panchayat.id"), nullable=False, index=True)
    label = db.Column(db.String(256), nullable=False)

    panchayat = db.relationship("DimPanchayat", back_populates="sectors")
    farmers = db.relationship("DimFarmer", back_populates="sector")


class DimFarmer(db.Model):
    __tablename__ = "dim_farmer"

    id = db.Column(db.Integer, primary_key=True)
    external_id = db.Column(db.String(64), index=True)
    display_name = db.Column(db.String(256))
    sector_id = db.Column(db.Integer, db.ForeignKey("dim_sector.id"), nullable=True)

    sector = db.relationship("DimSector", back_populates="farmers")


class DimCrop(db.Model):
    __tablename__ = "dim_crop"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(64), unique=True, nullable=False)
    label_en = db.Column(db.String(128), nullable=False)


class DimSoil(db.Model):
    __tablename__ = "dim_soil"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(64), unique=True, nullable=False)
    label_en = db.Column(db.String(128), nullable=False)


class DimGrowthStage(db.Model):
    __tablename__ = "dim_growth_stage"

    id = db.Column(db.Integer, primary_key=True)
    code = db.Column(db.String(64), unique=True, nullable=False)
    label_en = db.Column(db.String(128), nullable=False)


class DimFertilizer(db.Model):
    __tablename__ = "dim_fertilizer"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), unique=True, nullable=False, index=True)


class DimTime(db.Model):
    __tablename__ = "dim_time"

    id = db.Column(db.Integer, primary_key=True)
    event_ts = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    date_key = db.Column(db.Integer, index=True)
    year = db.Column(db.SmallInteger)
    month = db.Column(db.SmallInteger)
    day_of_month = db.Column(db.SmallInteger)
    hour = db.Column(db.SmallInteger)


class FactRecommendation(db.Model):
    """Central fact: one row per prediction / recommendation event."""

    __tablename__ = "fact_recommendation"

    id = db.Column(db.Integer, primary_key=True)
    time_id = db.Column(db.Integer, db.ForeignKey("dim_time.id"), nullable=False, index=True)
    crop_id = db.Column(db.Integer, db.ForeignKey("dim_crop.id"), nullable=False, index=True)
    soil_id = db.Column(db.Integer, db.ForeignKey("dim_soil.id"), nullable=False, index=True)
    stage_id = db.Column(db.Integer, db.ForeignKey("dim_growth_stage.id"), nullable=False, index=True)
    fertilizer_id = db.Column(db.Integer, db.ForeignKey("dim_fertilizer.id"), nullable=False, index=True)
    farmer_id = db.Column(db.Integer, db.ForeignKey("dim_farmer.id"), nullable=True, index=True)

    soil_ph = db.Column(db.Float, nullable=False)
    soil_moisture = db.Column(db.Float, nullable=False)
    nitrogen = db.Column(db.Float, nullable=False)
    phosphorus = db.Column(db.Float, nullable=False)
    potassium = db.Column(db.Float, nullable=False)
    temperature = db.Column(db.Float, nullable=False)
    humidity = db.Column(db.Float, nullable=False)
    rainfall = db.Column(db.Float, nullable=False)

    ph_status = db.Column(db.String(96))
    nitrogen_status = db.Column(db.String(32))
    phosphorus_status = db.Column(db.String(32))
    potassium_status = db.Column(db.String(32))
    moisture_status = db.Column(db.String(32))

    app_mode_at_write = db.Column(db.String(16))

    time = db.relationship("DimTime")
    crop = db.relationship("DimCrop")
    soil = db.relationship("DimSoil")
    stage = db.relationship("DimGrowthStage")
    fertilizer = db.relationship("DimFertilizer")
    farmer = db.relationship("DimFarmer")


class TelemetryEvent(db.Model):
    """Structured audit trail."""

    __tablename__ = "telemetry_event"

    id = db.Column(db.Integer, primary_key=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False, index=True)
    event_type = db.Column(db.String(64), nullable=False, index=True)
    app_mode = db.Column(db.String(16))
    message = db.Column(db.String(512))
    fact_id = db.Column(db.Integer, db.ForeignKey("fact_recommendation.id"), nullable=True)

    fact = db.relationship("FactRecommendation")


class User(db.Model):
    __tablename__ = "app_user"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(32), nullable=False, index=True)
    display_name = db.Column(db.String(128))
    panchayat_code = db.Column(db.String(64), index=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sessions = db.relationship("SessionToken", back_populates="user", cascade="all, delete-orphan")
    registrations_created = db.relationship(
        "FarmerRegistration",
        foreign_keys="FarmerRegistration.gp_officer_id",
        back_populates="gp_officer",
    )


class SessionToken(db.Model):
    __tablename__ = "session_token"

    token = db.Column(db.String(96), primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("app_user.id"), nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)

    user = db.relationship("User", back_populates="sessions")


class FarmerRegistration(db.Model):
    __tablename__ = "farmer_registration"

    id = db.Column(db.Integer, primary_key=True)
    gp_officer_id = db.Column(db.Integer, db.ForeignKey("app_user.id"), nullable=True, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("app_user.id"), nullable=True, index=True)
    panchayat_code = db.Column(db.String(64), index=True)
    external_ref = db.Column(db.String(64), index=True)
    name = db.Column(db.String(256), nullable=False)
    sector = db.Column(db.String(256))
    area_text = db.Column(db.String(128))
    
    # Soil basics
    nitrogen = db.Column(db.Float, default=0)
    phosphorus = db.Column(db.Float, default=0)
    potassium = db.Column(db.Float, default=0)
    ph = db.Column(db.Float, default=0)
    moisture = db.Column(db.Float, default=0)
    
    # Environment
    temp = db.Column(db.Float, default=0)
    humidity = db.Column(db.Float, default=0)
    rainfall = db.Column(db.Float, default=0)
    
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    gp_officer = db.relationship("User", foreign_keys=[gp_officer_id], back_populates="registrations_created")
    farmer_user = db.relationship("User", foreign_keys=[user_id])
