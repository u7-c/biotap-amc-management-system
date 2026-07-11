import os

routers = {
    'products': 'Product',
    'amcs': 'AMC',
    'leads': 'Lead'
}

for filename, model in routers.items():
    path = f"c:\\Users\\Hp\\OneDrive\\Documents\\biotap data analysis dashboard\\backend\\routers\\{filename}.py"
    with open(path, 'a') as f:
        f.write(f"""
@router.put("/{{{filename[:-1]}_id}}", response_model=schemas.{model})
def update_{filename[:-1]}({filename[:-1]}_id: int, {filename[:-1]}: schemas.{model}Create, db: Session = Depends(get_db)):
    db_{filename[:-1]} = db.query(models.{model}).filter(models.{model}.id == {filename[:-1]}_id).first()
    if not db_{filename[:-1]}:
        raise HTTPException(status_code=404, detail="{model} not found")
    
    for key, value in {filename[:-1]}.model_dump().items():
        setattr(db_{filename[:-1]}, key, value)
        
    db.commit()
    db.refresh(db_{filename[:-1]})
    return db_{filename[:-1]}

@router.delete("/{{{filename[:-1]}_id}}", status_code=204)
def delete_{filename[:-1]}({filename[:-1]}_id: int, db: Session = Depends(get_db)):
    db_{filename[:-1]} = db.query(models.{model}).filter(models.{model}.id == {filename[:-1]}_id).first()
    if not db_{filename[:-1]}:
        raise HTTPException(status_code=404, detail="{model} not found")
        
    db.delete(db_{filename[:-1]})
    db.commit()
    return None
""")
print("Patched all routers")
