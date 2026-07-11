from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
import pandas as pd
import io
import models
from database import get_db

router = APIRouter(
    prefix="/upload",
    tags=["upload"],
)

@router.post("/csv")
async def upload_csv(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed")
    
    try:
        contents = await file.read()
        df = pd.read_csv(io.StringIO(contents.decode('utf-8')))
        
        # We expect standard columns: name, email, phone, address for Clients
        # For a full system, this would be more complex and handle all entities.
        # Here we demonstrate sorting and importing clients from CSV.
        
        imported = 0
        for _, row in df.iterrows():
            if 'email' not in row:
                continue
            
            # Check if client exists
            existing = db.query(models.Client).filter(models.Client.email == row['email']).first()
            if not existing:
                client = models.Client(
                    name=row.get('name', 'Unknown'),
                    email=row['email'],
                    phone=row.get('phone', ''),
                    address=row.get('address', '')
                )
                db.add(client)
                imported += 1
                
        db.commit()
        return {"message": f"Successfully imported {imported} clients from CSV."}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
