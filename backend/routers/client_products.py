from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
import schemas
from database import get_db

router = APIRouter(
    prefix="/client-products",
    tags=["client-products"],
)

@router.post("/", response_model=schemas.ClientProduct)
def create_client_product(ownership: schemas.ClientProductCreate, db: Session = Depends(get_db)):
    client = db.query(models.Client).filter(models.Client.id == ownership.client_id).first()
    product = db.query(models.Product).filter(models.Product.id == ownership.product_id).first()
    if not client or not product:
        raise HTTPException(status_code=404, detail="Client or product not found")

    existing = db.query(models.ClientProduct).filter(
        models.ClientProduct.client_id == ownership.client_id,
        models.ClientProduct.product_id == ownership.product_id,
    ).first()
    if existing:
        return existing

    db_ownership = models.ClientProduct(**ownership.model_dump())
    db.add(db_ownership)
    db.commit()
    db.refresh(db_ownership)
    return db_ownership

@router.get("/", response_model=List[schemas.ClientProduct])
def read_client_products(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return db.query(models.ClientProduct).offset(skip).limit(limit).all()

@router.put("/{ownership_id}", response_model=schemas.ClientProduct)
def update_client_product(ownership_id: int, ownership: schemas.ClientProductCreate, db: Session = Depends(get_db)):
    db_ownership = db.query(models.ClientProduct).filter(models.ClientProduct.id == ownership_id).first()
    if not db_ownership:
        raise HTTPException(status_code=404, detail="Ownership record not found")

    for key, value in ownership.model_dump().items():
        setattr(db_ownership, key, value)

    db.commit()
    db.refresh(db_ownership)
    return db_ownership

@router.delete("/{ownership_id}", status_code=204)
def delete_client_product(ownership_id: int, db: Session = Depends(get_db)):
    db_ownership = db.query(models.ClientProduct).filter(models.ClientProduct.id == ownership_id).first()
    if not db_ownership:
        raise HTTPException(status_code=404, detail="Ownership record not found")

    db.delete(db_ownership)
    db.commit()
    return None
