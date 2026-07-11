from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/amcs",
    tags=["amcs"],
)

@router.post("/", response_model=schemas.AMC)
def create_amc(amc: schemas.AMCCreate, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.id == amc.client_id).first()
    product = db.query(models.Product).filter(models.Product.id == amc.product_id).first()
    if not client or not product:
        raise HTTPException(status_code=404, detail="Client or product not found")

    cp = db.query(models.ClientProduct).filter(
        models.ClientProduct.client_id == amc.client_id,
        models.ClientProduct.product_id == amc.product_id
    ).first()
    
    if not cp:
        # Create it
        from datetime import date
        cp = models.ClientProduct(
            client_id=amc.client_id,
            product_id=amc.product_id,
            purchase_date=date.today()
        )
        db.add(cp)
        db.commit()
        db.refresh(cp)
        
    new_amc = models.AMC(
        client_id=amc.client_id,
        client_product_id=cp.id,
        start_date=amc.start_date,
        end_date=amc.end_date,
        amount=amc.amount,
        status=amc.status
    )
    db.add(new_amc)
    db.commit()
    db.refresh(new_amc)
    return new_amc

@router.get("/", response_model=List[schemas.AMC])
def read_amcs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.AMC).offset(skip).limit(limit).all()

@router.get("/{amc_id}", response_model=schemas.AMC)
def read_amc(amc_id: int, db: Session = Depends(get_db)):
    amc = db.query(models.AMC).filter(models.AMC.id == amc_id).first()
    if amc is None:
        raise HTTPException(status_code=404, detail="AMC not found")
    return amc

@router.put("/{amc_id}", response_model=schemas.AMC)
def update_amc(amc_id: int, amc: schemas.AMCCreate, db: Session = Depends(get_db)):
    db_amc = db.query(models.AMC).filter(models.AMC.id == amc_id).first()
    if not db_amc:
        raise HTTPException(status_code=404, detail="AMC not found")

    client = db.query(models.Client).filter(models.Client.id == amc.client_id).first()
    product = db.query(models.Product).filter(models.Product.id == amc.product_id).first()
    if not client or not product:
        raise HTTPException(status_code=404, detail="Client or product not found")

    cp = db.query(models.ClientProduct).filter(
        models.ClientProduct.client_id == amc.client_id,
        models.ClientProduct.product_id == amc.product_id
    ).first()
    if not cp:
        from datetime import date
        cp = models.ClientProduct(
            client_id=amc.client_id,
            product_id=amc.product_id,
            purchase_date=date.today()
        )
        db.add(cp)
        db.commit()
        db.refresh(cp)

    db_amc.client_id = amc.client_id
    db_amc.client_product_id = cp.id
    db_amc.start_date = amc.start_date
    db_amc.end_date = amc.end_date
    db_amc.amount = amc.amount
    db_amc.status = amc.status
        
    db.commit()
    db.refresh(db_amc)
    return db_amc

@router.delete("/{amc_id}", status_code=204)
def delete_amc(amc_id: int, db: Session = Depends(get_db)):
    db_amc = db.query(models.AMC).filter(models.AMC.id == amc_id).first()
    if not db_amc:
        raise HTTPException(status_code=404, detail="AMC not found")
        
    db.delete(db_amc)
    db.commit()
    return None
