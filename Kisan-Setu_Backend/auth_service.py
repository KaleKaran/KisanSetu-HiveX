"""Password hashing and bearer token sessions."""
from __future__ import annotations

import secrets
from datetime import datetime, timedelta
from typing import Optional

from flask import Request
from werkzeug.security import check_password_hash, generate_password_hash

from extensions import db
from models import FarmerRegistration, SessionToken, User

TOKEN_DAYS = 30


def hash_password(raw: str) -> str:
    return generate_password_hash(raw)


def verify_password(user: User, raw: str) -> bool:
    return check_password_hash(user.password_hash, raw)


def issue_token(user: User) -> str:
    SessionToken.query.filter_by(user_id=user.id).delete()
    raw = secrets.token_urlsafe(32)
    exp = datetime.utcnow() + timedelta(days=TOKEN_DAYS)
    db.session.add(SessionToken(token=raw, user_id=user.id, expires_at=exp))
    db.session.commit()
    return raw


def validate_token(raw: Optional[str]) -> Optional[User]:
    if not raw:
        return None
    st = SessionToken.query.filter_by(token=raw.strip()).first()
    if not st or st.expires_at < datetime.utcnow():
        return None
    return st.user


def user_from_request(req: Request) -> Optional[User]:
    auth = req.headers.get("Authorization", "")
    if not auth.startswith("Bearer "):
        return None
    return validate_token(auth[7:].strip())


def user_public(u: User) -> dict:
    return {
        "id": u.id,
        "username": u.username,
        "role": u.role,
        "display_name": u.display_name,
        "panchayat_code": u.panchayat_code,
    }


def registration_dict(r: FarmerRegistration) -> dict:
    return {
        "id": r.external_ref or f"REG-{r.id}",
        "db_id": r.id,
        "name": r.name,
        "sector": r.sector or "",
        "area": r.area_text or "",
        "sensors": {
            "n": r.nitrogen,
            "p": r.phosphorus,
            "k": r.potassium,
            "ph": r.ph,
            "moisture": r.moisture,
            "temp": r.temp,
            "humidity": r.humidity,
            "rainfall": r.rainfall,
        },
    }
