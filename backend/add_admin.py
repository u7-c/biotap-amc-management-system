from sqlalchemy.orm import Session
from database import engine, get_db, Base
import models
import auth

def add_admin():
    db = next(get_db())
    admin_email = "admin"
    existing = db.query(models.User).filter(models.User.email == admin_email).first()
    
    if existing:
        existing.hashed_password = auth.get_password_hash("1234")
        existing.is_active = True
        db.commit()
        print("Admin user updated: admin / 1234")
        return
        
    admin = models.User(
        email=admin_email,
        hashed_password=auth.get_password_hash("1234")
    )
    db.add(admin)
    db.commit()
    print("Admin user created: admin / 1234")

if __name__ == "__main__":
    add_admin()
