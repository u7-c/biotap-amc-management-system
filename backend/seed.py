import random
from datetime import date, timedelta
from sqlalchemy.orm import Session
from database import engine, get_db, Base
import models
import auth

CLIENTS = [
    ("Apex Hospitals", "ops@apexhospitals.com", "9876543201", "Bengaluru"),
    ("Metro Diagnostics", "it@metrodiagnostics.com", "9876543202", "Pune"),
    ("Greenfield Labs", "support@greenfieldlabs.com", "9876543203", "Hyderabad"),
    ("Northstar Clinics", "admin@northstarclinics.com", "9876543204", "Delhi"),
    ("CarePoint Pharma", "infra@carepointpharma.com", "9876543205", "Mumbai"),
    ("BlueRay Imaging", "service@bluerayimaging.com", "9876543206", "Chennai"),
    ("HealthAxis Group", "contact@healthaxis.com", "9876543207", "Ahmedabad"),
    ("Prime Wellness", "hello@primewellness.com", "9876543208", "Kolkata"),
    ("Lifeline Research", "facilities@lifelineresearch.com", "9876543209", "Jaipur"),
    ("Vista Medcare", "purchase@vistamedcare.com", "9876543210", "Surat"),
    ("Zenith BioTech", "ops@zenithbiotech.com", "9876543211", "Noida"),
    ("Cedar Medical", "care@cedarmedical.com", "9876543212", "Indore"),
]

PRODUCTS = [
    ("BioTap Analyzer Pro", "Diagnostics", 245000, "Automated biomarker analyzer with AMC coverage"),
    ("Cold Chain Monitor", "IoT", 48000, "Temperature and humidity tracking device"),
    ("Clinic Data Hub", "Software", 96000, "Annual analytics and reporting subscription"),
    ("Lab UPS 5KVA", "Hardware", 78000, "Power backup for diagnostic equipment"),
    ("Sample Barcode Kit", "Accessories", 18500, "Scanner and label printer bundle"),
    ("Remote Support Pack", "Service", 36000, "Priority remote support for clinics"),
    ("BioTap Mini", "Diagnostics", 125000, "Compact analyzer for satellite labs"),
    ("Sterile Cabinet S2", "Hardware", 89000, "Controlled storage cabinet"),
]
LEADS = [
    ("Orion Health", "buy@orionhealth.com", "9000011111", "New", "Interested in analyzer demo"),
    ("Lotus Labs", "lab@lotuslabs.com", "9000011112", "Contacted", "Needs product comparison"),
    ("Medico Plus", "admin@medicoplus.com", "9000011113", "Converted", "Converted to AMC client"),
    ("Quantum Care", "it@quantumcare.com", "9000011114", "Lost", "Budget postponed"),
    ("Unity Clinics", "info@unityclinics.com", "9000011115", "New", "Requested price list"),
    ("Silverline Diagnostics", "ops@silverline.com", "9000011116", "Contacted", "Follow up next week"),
]

def seed_db():
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    db = next(get_db())
    
    print("Seeding database...")

    admin = db.query(models.User).filter(models.User.email == "admin").first()
    if not admin:
        db.add(models.User(email="admin", hashed_password=auth.get_password_hash("1234"), is_active=True))
    else:
        admin.hashed_password = auth.get_password_hash("1234")
        admin.is_active = True
    db.commit()

    clients = []
    for name, email, phone, address in CLIENTS:
        c = db.query(models.Client).filter(models.Client.email == email).first()
        if not c:
            c = models.Client(name=name, email=email, phone=phone, address=address)
            db.add(c)
        clients.append(c)
    db.commit()

    products = []
    for name, category, price, description in PRODUCTS:
        p = db.query(models.Product).filter(models.Product.name == name).first()
        if not p:
            p = models.Product(name=name, category=category, price=price, description=description)
            db.add(p)
        products.append(p)
    db.commit()

    today = date.today()
    statuses = ["Active", "Expired", "Renewed", "Pending"]
    for index, client in enumerate(clients):
        for p in random.sample(products, random.randint(2, 4)):
            cp = db.query(models.ClientProduct).filter(
                models.ClientProduct.client_id == client.id,
                models.ClientProduct.product_id == p.id,
            ).first()
            if not cp:
                cp = models.ClientProduct(
                    client_id=client.id,
                    product_id=p.id,
                    purchase_date=today - timedelta(days=random.randint(30, 720)),
                )
                db.add(cp)
                db.commit()
                db.refresh(cp)

            existing_amc = db.query(models.AMC).filter(models.AMC.client_product_id == cp.id).first()
            if existing_amc:
                continue

            status = statuses[(index + p.id) % len(statuses)]
            start = cp.purchase_date
            if status == "Expired":
                end = today - timedelta(days=random.randint(5, 120))
            elif status == "Pending":
                end = today + timedelta(days=random.randint(15, 60))
            else:
                end = start + timedelta(days=365)

            db.add(models.AMC(
                client_id=client.id,
                client_product_id=cp.id,
                start_date=start,
                end_date=end,
                amount=round((p.price or 0) * random.uniform(0.12, 0.22), 2),
                status=status,
            ))

    for name, email, phone, status, notes in LEADS:
        lead = db.query(models.Lead).filter(models.Lead.email == email).first()
        if not lead:
            db.add(models.Lead(name=name, email=email, phone=phone, status=status, notes=notes))

    db.commit()
    print("Database seeded successfully.")

if __name__ == "__main__":
    seed_db()
