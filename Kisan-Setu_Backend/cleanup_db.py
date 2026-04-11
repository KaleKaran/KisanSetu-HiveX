from app import app
from extensions import db
from models import FarmerRegistration

with app.app_context():
    print("Zeroing out legacy defaults from existing records...")
    FarmerRegistration.query.update({
        FarmerRegistration.ph: 0,
        FarmerRegistration.moisture: 0,
        FarmerRegistration.temp: 0,
        FarmerRegistration.humidity: 0,
        FarmerRegistration.rainfall: 0,
        FarmerRegistration.nitrogen: 0,
        FarmerRegistration.phosphorus: 0,
        FarmerRegistration.potassium: 0
    })
    db.session.commit()
    print("Database cleaned. Only live synced data will now show values > 0.")
