"""Application configuration: default data mode + PostgreSQL-ready DATABASE_URL."""
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _default_sqlite_uri():
    """Single local file for auth, registrations, and warehouse (simulation vs live is per-request)."""
    return "sqlite:///" + os.path.join(BASE_DIR, "kisan_setu.db")


class Config:
    """Base config — PostgreSQL-ready via DATABASE_URL."""

    SECRET_KEY = os.environ.get("SECRET_KEY", "kisan-setu-dev-key-change-in-production")
    # Default when client does not send X-Data-Mode: simulation | live
    APP_MODE = os.environ.get("APP_MODE", "simulation").strip().lower()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,
        "pool_recycle": 280,
    }

    @staticmethod
    def sqlalchemy_engine_options() -> dict:
        return dict(Config.SQLALCHEMY_ENGINE_OPTIONS)

    @staticmethod
    def init_db_uri() -> str:
        """DATABASE_URL if set (e.g. PostgreSQL), else persistent SQLite."""
        url = os.environ.get("DATABASE_URL", "").strip()
        if url:
            if url.startswith("postgres://"):
                url = "postgresql+psycopg2://" + url[len("postgres://") :]
            elif url.startswith("postgresql://") and "+psycopg2" not in url:
                url = url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return url
        return _default_sqlite_uri()
