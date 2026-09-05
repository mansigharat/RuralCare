"""
Seed script - 15 realistic rural healthcare facilities across 3 districts in Maharashtra:
  • Pune (rural talukas)
  • Nashik (rural talukas)
  • Ahmednagar

Run from inside the backend/ directory:
    python seed.py
"""

import os
import sys
import uuid
from datetime import datetime, timezone, timedelta

# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

# pyrefly: ignore [missing-import]
from sqlalchemy.orm import Session
from database.connection import engine, Base
from models import user, facility, service, doctor, medicine, report  # noqa: F401 — registers models
from models.user import User, UserRole
from models.facility import Facility, FacilityStatus
from models.service import Service
from models.doctor import Doctor
from models.medicine import Medicine
from models.report import Report, ReportStatus
from services.auth_service import hash_password

# ── Helper ────────────────────────────────────────────────────────────────────

def uid():
    return uuid.uuid4()


now = datetime.now(timezone.utc)

# ── Facility seed data ────────────────────────────────────────────────────────

FACILITIES = [
    # ── Pune district ─────────────────────────────────────────────────────────
    {
        "name": "Primary Health Centre Khed",
        "type": "PHC",
        "address": "Near Gram Panchayat, Khed Village, Khed Taluka",
        "village": "Khed",
        "district": "Pune",
        "state": "Maharashtra",
        "latitude": 18.5165,
        "longitude": 73.8978,
        "phone": "020-27450011",
        "status": FacilityStatus.fresh,
        "last_verified": now - timedelta(days=10),
        "services": ["OPD", "Maternity", "Immunisation"],
        "doctors": [
            {"name": "Dr. Priya Kulkarni", "specialization": "General Medicine", "available_days": "Mon-Sat", "available_hours": "9:00 AM - 2:00 PM"},
            {"name": "Dr. Ramesh Shinde", "specialization": "Gynaecology", "available_days": "Mon, Wed, Fri", "available_hours": "10:00 AM - 1:00 PM"},
        ],
        "medicines": [
            {"name": "Paracetamol", "in_stock": True},
            {"name": "ORS Sachets", "in_stock": True},
            {"name": "Amoxicillin", "in_stock": True},
            {"name": "Iron-Folic Acid Tablets", "in_stock": False},
        ],
    },
    {
        "name": "Community Health Centre Shirur",
        "type": "CHC",
        "address": "Shirur Road, Shirur, Pune",
        "village": "Shirur",
        "district": "Pune",
        "state": "Maharashtra",
        "latitude": 18.8266,
        "longitude": 74.3763,
        "phone": "02138-222301",
        "status": FacilityStatus.needs_verification,
        "last_verified": now - timedelta(days=95),
        "services": ["OPD", "Surgery", "Blood Bank", "X-Ray"],
        "doctors": [
            {"name": "Dr. Sanjay Patil", "specialization": "Surgery", "available_days": "Mon-Fri", "available_hours": "8:00 AM - 3:00 PM"},
            {"name": "Dr. Anita More", "specialization": "Paediatrics", "available_days": "Tue, Thu, Sat", "available_hours": "9:00 AM - 12:00 PM"},
            {"name": "Dr. Vijay Deshmukh", "specialization": "Radiology", "available_days": "Mon, Wed, Fri", "available_hours": "10:00 AM - 2:00 PM"},
        ],
        "medicines": [
            {"name": "Metformin", "in_stock": True},
            {"name": "Amlodipine", "in_stock": True},
            {"name": "Azithromycin", "in_stock": False},
            {"name": "Ibuprofen", "in_stock": True},
            {"name": "Vitamin D3", "in_stock": False},
        ],
    },
    {
        "name": "Rural Hospital Baramati",
        "type": "Hospital",
        "address": "Hospital Road, Baramati, Pune",
        "village": "Baramati",
        "district": "Pune",
        "state": "Maharashtra",
        "latitude": 18.1516,
        "longitude": 74.5825,
        "phone": "02112-222155",
        "status": FacilityStatus.fresh,
        "last_verified": now - timedelta(days=5),
        "services": ["OPD", "ICU", "Maternity", "Pathology Lab"],
        "doctors": [
            {"name": "Dr. Neha Jadhav", "specialization": "Internal Medicine", "available_days": "Mon-Sat", "available_hours": "8:00 AM - 4:00 PM"},
            {"name": "Dr. Arun Bhosale", "specialization": "Orthopaedics", "available_days": "Mon, Wed, Fri", "available_hours": "9:00 AM - 1:00 PM"},
        ],
        "medicines": [
            {"name": "Paracetamol", "in_stock": True},
            {"name": "Atorvastatin", "in_stock": True},
            {"name": "Omeprazole", "in_stock": True},
            {"name": "Cetirizine", "in_stock": True},
        ],
    },
    {
        "name": "PHC Velhe",
        "type": "PHC",
        "address": "Main Road, Velhe Village",
        "village": "Velhe",
        "district": "Pune",
        "state": "Maharashtra",
        "latitude": 18.2628,
        "longitude": 73.6538,
        "phone": "020-24500512",
        "status": FacilityStatus.outdated,
        "last_verified": now - timedelta(days=200),
        "services": ["OPD", "Immunisation"],
        "doctors": [
            {"name": "Dr. Santosh Ghule", "specialization": "General Medicine", "available_days": "Mon, Wed, Fri", "available_hours": "10:00 AM - 1:00 PM"},
        ],
        "medicines": [
            {"name": "Paracetamol", "in_stock": True},
            {"name": "ORS Sachets", "in_stock": False},
            {"name": "Chloroquine", "in_stock": False},
        ],
    },
    {
        "name": "Dispensary Daund",
        "type": "Dispensary",
        "address": "Pune-Solapur Highway, Daund",
        "village": "Daund",
        "district": "Pune",
        "state": "Maharashtra",
        "latitude": 18.4603,
        "longitude": 74.5822,
        "phone": "02117-262100",
        "status": FacilityStatus.fresh,
        "last_verified": now - timedelta(days=20),
        "services": ["OPD", "First Aid"],
        "doctors": [
            {"name": "Dr. Meena Sawant", "specialization": "General Practice", "available_days": "Mon-Fri", "available_hours": "9:00 AM - 1:00 PM"},
        ],
        "medicines": [
            {"name": "Dolo-650", "in_stock": True},
            {"name": "Metronidazole", "in_stock": True},
            {"name": "Antacid Syrup", "in_stock": True},
            {"name": "Salbutamol Inhaler", "in_stock": False},
        ],
    },
    # ── Nashik district ───────────────────────────────────────────────────────
    {
        "name": "Primary Health Centre Igatpuri",
        "type": "PHC",
        "address": "Igatpuri Village, Nashik District",
        "village": "Igatpuri",
        "district": "Nashik",
        "state": "Maharashtra",
        "latitude": 19.7002,
        "longitude": 73.5648,
        "phone": "0253-2510201",
        "status": FacilityStatus.fresh,
        "last_verified": now - timedelta(days=15),
        "services": ["OPD", "Immunisation", "Maternity"],
        "doctors": [
            {"name": "Dr. Kavita Wagh", "specialization": "General Medicine", "available_days": "Mon-Sat", "available_hours": "9:00 AM - 2:00 PM"},
            {"name": "Dr. Suresh Rane", "specialization": "Gynaecology", "available_days": "Tue, Thu", "available_hours": "10:00 AM - 12:00 PM"},
        ],
        "medicines": [
            {"name": "Paracetamol", "in_stock": True},
            {"name": "ORS Sachets", "in_stock": True},
            {"name": "Cetirizine", "in_stock": True},
            {"name": "Iron Tablets", "in_stock": True},
        ],
    },
    {
        "name": "CHC Trimbakeshwar",
        "type": "CHC",
        "address": "Trimbakeshwar Road, Nashik",
        "village": "Trimbakeshwar",
        "district": "Nashik",
        "state": "Maharashtra",
        "latitude": 19.9356,
        "longitude": 73.5292,
        "phone": "0253-2510408",
        "status": FacilityStatus.needs_verification,
        "last_verified": now - timedelta(days=110),
        "services": ["OPD", "Eye Care", "Dental", "Pathology Lab"],
        "doctors": [
            {"name": "Dr. Anil Kamble", "specialization": "Ophthalmology", "available_days": "Mon, Wed, Fri", "available_hours": "9:00 AM - 1:00 PM"},
            {"name": "Dr. Pooja Nikam", "specialization": "Dentistry", "available_days": "Tue, Thu", "available_hours": "10:00 AM - 2:00 PM"},
            {"name": "Dr. Manoj Pawar", "specialization": "General Medicine", "available_days": "Mon-Sat", "available_hours": "8:00 AM - 3:00 PM"},
        ],
        "medicines": [
            {"name": "Albendazole", "in_stock": True},
            {"name": "Vitamin A Capsules", "in_stock": False},
            {"name": "Ciprofloxacin", "in_stock": True},
            {"name": "Ranitidine", "in_stock": True},
        ],
    },
    {
        "name": "Rural Hospital Nandgaon",
        "type": "Hospital",
        "address": "Hospital Chowk, Nandgaon, Nashik",
        "village": "Nandgaon",
        "district": "Nashik",
        "state": "Maharashtra",
        "latitude": 20.3222,
        "longitude": 74.6580,
        "phone": "02551-230150",
        "status": FacilityStatus.fresh,
        "last_verified": now - timedelta(days=3),
        "services": ["OPD", "Surgery", "Maternity", "X-Ray", "Blood Bank"],
        "doctors": [
            {"name": "Dr. Sachin Gaikwad", "specialization": "Surgery", "available_days": "Mon-Fri", "available_hours": "8:00 AM - 4:00 PM"},
            {"name": "Dr. Lata Ahire", "specialization": "Obstetrics & Gynaecology", "available_days": "Mon-Sat", "available_hours": "9:00 AM - 2:00 PM"},
        ],
        "medicines": [
            {"name": "Paracetamol", "in_stock": True},
            {"name": "Diclofenac", "in_stock": True},
            {"name": "Metronidazole", "in_stock": True},
            {"name": "Hydrocortisone Cream", "in_stock": False},
            {"name": "Insulin (Regular)", "in_stock": True},
        ],
    },
    {
        "name": "PHC Peint",
        "type": "PHC",
        "address": "Peint Village, Surgana Taluka, Nashik",
        "village": "Peint",
        "district": "Nashik",
        "state": "Maharashtra",
        "latitude": 20.2689,
        "longitude": 73.6264,
        "phone": "02557-242001",
        "status": FacilityStatus.outdated,
        "last_verified": now - timedelta(days=300),
        "services": ["OPD", "Immunisation"],
        "doctors": [
            {"name": "Dr. Dinesh Bari", "specialization": "General Practice", "available_days": "Mon, Wed, Fri", "available_hours": "9:00 AM - 12:00 PM"},
        ],
        "medicines": [
            {"name": "ORS Sachets", "in_stock": True},
            {"name": "Paracetamol", "in_stock": False},
            {"name": "Chloroquine", "in_stock": False},
        ],
    },
    {
        "name": "Dispensary Sinnar",
        "type": "Dispensary",
        "address": "Sinnar Town, Nashik District",
        "village": "Sinnar",
        "district": "Nashik",
        "state": "Maharashtra",
        "latitude": 19.8482,
        "longitude": 74.0009,
        "phone": "02551-220200",
        "status": FacilityStatus.fresh,
        "last_verified": now - timedelta(days=30),
        "services": ["OPD", "First Aid", "Family Planning"],
        "doctors": [
            {"name": "Dr. Rekha Borse", "specialization": "General Medicine", "available_days": "Mon-Sat", "available_hours": "9:00 AM - 1:00 PM"},
        ],
        "medicines": [
            {"name": "Paracetamol", "in_stock": True},
            {"name": "Iron-Folic Acid Tablets", "in_stock": True},
            {"name": "Oral Contraceptive Pills", "in_stock": True},
            {"name": "Cough Syrup", "in_stock": False},
        ],
    },
    # ── Ahmednagar district ───────────────────────────────────────────────────
    {
        "name": "Primary Health Centre Sangamner",
        "type": "PHC",
        "address": "Sangamner Village, Ahmednagar",
        "village": "Sangamner",
        "district": "Ahmednagar",
        "state": "Maharashtra",
        "latitude": 19.5762,
        "longitude": 74.2115,
        "phone": "02425-222101",
        "status": FacilityStatus.fresh,
        "last_verified": now - timedelta(days=12),
        "services": ["OPD", "Immunisation", "Maternity"],
        "doctors": [
            {"name": "Dr. Sunil Thombare", "specialization": "General Medicine", "available_days": "Mon-Sat", "available_hours": "9:00 AM - 2:00 PM"},
            {"name": "Dr. Shalini Kulkarni", "specialization": "Gynaecology", "available_days": "Wed, Sat", "available_hours": "10:00 AM - 1:00 PM"},
        ],
        "medicines": [
            {"name": "Paracetamol", "in_stock": True},
            {"name": "Amoxicillin", "in_stock": True},
            {"name": "ORS Sachets", "in_stock": True},
            {"name": "Vitamin B Complex", "in_stock": True},
        ],
    },
    {
        "name": "CHC Kopargaon",
        "type": "CHC",
        "address": "Kopargaon, Ahmednagar District",
        "village": "Kopargaon",
        "district": "Ahmednagar",
        "state": "Maharashtra",
        "latitude": 19.8838,
        "longitude": 74.4771,
        "phone": "02423-222212",
        "status": FacilityStatus.needs_verification,
        "last_verified": now - timedelta(days=80),
        "services": ["OPD", "Surgery", "Pathology Lab", "Physiotherapy"],
        "doctors": [
            {"name": "Dr. Prakash Deshpande", "specialization": "Surgery", "available_days": "Mon-Fri", "available_hours": "8:00 AM - 2:00 PM"},
            {"name": "Dr. Archana Misal", "specialization": "Physiotherapy", "available_days": "Mon, Wed, Fri", "available_hours": "9:00 AM - 12:00 PM"},
            {"name": "Dr. Nitin Jadhav", "specialization": "Pathology", "available_days": "Mon-Sat", "available_hours": "8:00 AM - 12:00 PM"},
        ],
        "medicines": [
            {"name": "Metformin", "in_stock": True},
            {"name": "Amlodipine", "in_stock": True},
            {"name": "Aspirin", "in_stock": True},
            {"name": "Pantoprazole", "in_stock": False},
        ],
    },
    {
        "name": "Rural Hospital Shrirampur",
        "type": "Hospital",
        "address": "Shrirampur, Ahmednagar",
        "village": "Shrirampur",
        "district": "Ahmednagar",
        "state": "Maharashtra",
        "latitude": 19.6230,
        "longitude": 74.6581,
        "phone": "02422-222300",
        "status": FacilityStatus.fresh,
        "last_verified": now - timedelta(days=7),
        "services": ["OPD", "ICU", "Blood Bank", "X-Ray", "Maternity"],
        "doctors": [
            {"name": "Dr. Ganesh Shinde", "specialization": "Internal Medicine", "available_days": "Mon-Sat", "available_hours": "8:00 AM - 5:00 PM"},
            {"name": "Dr. Vrushali Kale", "specialization": "Paediatrics", "available_days": "Mon-Fri", "available_hours": "9:00 AM - 1:00 PM"},
        ],
        "medicines": [
            {"name": "Paracetamol", "in_stock": True},
            {"name": "Atorvastatin", "in_stock": True},
            {"name": "Clopidogrel", "in_stock": True},
            {"name": "Furosemide", "in_stock": False},
            {"name": "Salbutamol Inhaler", "in_stock": True},
        ],
    },
    {
        "name": "PHC Akole",
        "type": "PHC",
        "address": "Akole Village, Akole Taluka, Ahmednagar",
        "village": "Akole",
        "district": "Ahmednagar",
        "state": "Maharashtra",
        "latitude": 19.5587,
        "longitude": 73.9876,
        "phone": "02426-222401",
        "status": FacilityStatus.outdated,
        "last_verified": now - timedelta(days=250),
        "services": ["OPD", "Immunisation"],
        "doctors": [
            {"name": "Dr. Bharat Nikalje", "specialization": "General Practice", "available_days": "Mon, Wed, Fri", "available_hours": "9:00 AM - 12:00 PM"},
        ],
        "medicines": [
            {"name": "Paracetamol", "in_stock": True},
            {"name": "ORS Sachets", "in_stock": True},
            {"name": "Ferrous Sulphate", "in_stock": False},
        ],
    },
    {
        "name": "Dispensary Rahata",
        "type": "Dispensary",
        "address": "Rahata, Ahmednagar District",
        "village": "Rahata",
        "district": "Ahmednagar",
        "state": "Maharashtra",
        "latitude": 19.7124,
        "longitude": 74.4819,
        "phone": "02422-260010",
        "status": FacilityStatus.fresh,
        "last_verified": now - timedelta(days=45),
        "services": ["OPD", "First Aid", "Immunisation"],
        "doctors": [
            {"name": "Dr. Priti Ghate", "specialization": "General Medicine", "available_days": "Mon-Sat", "available_hours": "9:00 AM - 1:00 PM"},
        ],
        "medicines": [
            {"name": "Paracetamol", "in_stock": True},
            {"name": "Doxycycline", "in_stock": True},
            {"name": "Antiseptic Solution", "in_stock": True},
            {"name": "Prednisolone", "in_stock": False},
        ],
    },
]

# ── Demo users ────────────────────────────────────────────────────────────────

USERS = [
    {"name": "Admin User", "phone": "9000000001", "password": "admin123", "role": UserRole.admin},
    {"name": "Staff Member", "phone": "9000000002", "password": "staff123", "role": UserRole.staff},
    {"name": "Citizen Demo", "phone": "9000000003", "password": "citizen123", "role": UserRole.citizen},
]


# ── Seed function ─────────────────────────────────────────────────────────────

def seed():
    Base.metadata.create_all(bind=engine)
    with Session(engine) as db:
        # Clear existing data (order matters for FK constraints)
        db.query(Report).delete()
        db.query(Medicine).delete()
        db.query(Doctor).delete()
        db.query(Service).delete()
        db.query(Facility).delete()
        db.query(User).delete()
        db.commit()

        # Seed users
        users_created = []
        for u in USERS:
            user_obj = User(
                id=uid(),
                name=u["name"],
                phone=u["phone"],
                hashed_password=hash_password(u["password"]),
                role=u["role"],
            )
            db.add(user_obj)
            users_created.append(user_obj)
        db.flush()

        # Seed facilities + related data
        facilities_created = []
        for f in FACILITIES:
            facility_obj = Facility(
                id=uid(),
                name=f["name"],
                type=f["type"],
                address=f["address"],
                village=f["village"],
                district=f["district"],
                state=f["state"],
                latitude=f["latitude"],
                longitude=f["longitude"],
                phone=f["phone"],
                status=f["status"],
                last_verified=f.get("last_verified"),
            )
            db.add(facility_obj)
            db.flush()

            for svc_name in f.get("services", []):
                db.add(Service(id=uid(), facility_id=facility_obj.id, name=svc_name))

            for doc in f.get("doctors", []):
                db.add(Doctor(
                    id=uid(),
                    facility_id=facility_obj.id,
                    name=doc["name"],
                    specialization=doc["specialization"],
                    available_days=doc.get("available_days"),
                    available_hours=doc.get("available_hours"),
                ))

            for med in f.get("medicines", []):
                db.add(Medicine(
                    id=uid(),
                    facility_id=facility_obj.id,
                    name=med["name"],
                    in_stock=med["in_stock"],
                ))

            facilities_created.append(facility_obj)

        # Seed a few demo reports
        citizen_user = users_created[2]
        demo_reports = [
            {"facility": facilities_created[3], "issue": "ORS Sachets out of stock for 2 weeks. Patients turning away.", "status": ReportStatus.pending},
            {"facility": facilities_created[8], "issue": "Doctor not available on listed days. Patients travelling 20 km for nothing.", "status": ReportStatus.verified},
            {"facility": facilities_created[1], "issue": "X-Ray machine broken since 3 months. No update from staff.", "status": ReportStatus.pending},
            {"facility": facilities_created[0], "issue": "Facility information appears outdated. New wing has been built.", "status": ReportStatus.rejected},
        ]
        for r in demo_reports:
            db.add(Report(
                id=uid(),
                facility_id=r["facility"].id,
                reported_by=citizen_user.id,
                issue=r["issue"],
                status=r["status"],
                admin_note="Reviewed by admin." if r["status"] != ReportStatus.pending else None,
            ))

        db.commit()

    print("[OK] Seeded successfully:")
    print(f"   - {len(USERS)} users  (admin/9000000001, staff/9000000002, citizen/9000000003)")
    print(f"   - {len(FACILITIES)} facilities across Pune, Nashik & Ahmednagar")
    print(f"   - {len(demo_reports)} demo reports")


if __name__ == "__main__":
    seed()
