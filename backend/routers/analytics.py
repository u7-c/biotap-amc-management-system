from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
import models
from database import get_db

router = APIRouter(
    prefix="/analytics",
    tags=["analytics"],
)

@router.get("/dashboard")
def get_dashboard_metrics(db: Session = Depends(get_db)):
    today = date.today()
    next_30 = today + timedelta(days=30)
    next_60 = today + timedelta(days=60)

    total_clients = db.query(models.Client).count()
    total_products = db.query(models.Product).count()
    total_leads = db.query(models.Lead).count()
    total_ownerships = db.query(models.ClientProduct).count()
    
    amc_status_counts = db.query(models.AMC.status, func.count(models.AMC.id)).group_by(models.AMC.status).all()
    amcs = {status: count for status, count in amc_status_counts}
    lead_status_counts = db.query(models.Lead.status, func.count(models.Lead.id)).group_by(models.Lead.status).all()
    leads = {status: count for status, count in lead_status_counts}
    
    active_revenue = db.query(func.sum(models.AMC.amount)).filter(models.AMC.status == "Active").scalar() or 0
    expired_revenue = db.query(func.sum(models.AMC.amount)).filter(models.AMC.status == "Expired").scalar() or 0
    pending_revenue = db.query(func.sum(models.AMC.amount)).filter(models.AMC.status == "Pending").scalar() or 0
    total_amc_value = db.query(func.sum(models.AMC.amount)).scalar() or 0

    expiring_30 = db.query(models.AMC).filter(
        models.AMC.status == "Active",
        models.AMC.end_date >= today,
        models.AMC.end_date <= next_30,
    ).count()
    expiring_60_value = db.query(func.sum(models.AMC.amount)).filter(
        models.AMC.status == "Active",
        models.AMC.end_date >= today,
        models.AMC.end_date <= next_60,
    ).scalar() or 0

    recent_leads = db.query(models.Lead).filter(
        models.Lead.created_at >= today - timedelta(days=30)
    ).count()
    conversion_rate = round((leads.get("Converted", 0) / total_leads) * 100, 1) if total_leads else 0

    monthly_rows = db.query(
        func.strftime("%Y-%m", models.AMC.start_date).label("month"),
        func.count(models.AMC.id),
        func.sum(models.AMC.amount),
    ).group_by("month").order_by("month").all()

    top_client_rows = (
        db.query(models.Client.name, func.count(models.AMC.id), func.sum(models.AMC.amount))
        .join(models.AMC, models.Client.id == models.AMC.client_id)
        .group_by(models.Client.id)
        .order_by(func.sum(models.AMC.amount).desc())
        .limit(5)
        .all()
    )

    top_product_rows = (
        db.query(models.Product.name, func.count(models.ClientProduct.id))
        .join(models.ClientProduct, models.Product.id == models.ClientProduct.product_id)
        .group_by(models.Product.id)
        .order_by(func.count(models.ClientProduct.id).desc())
        .limit(5)
        .all()
    )

    upcoming_rows = (
        db.query(models.AMC, models.Client, models.ClientProduct, models.Product)
        .join(models.Client, models.AMC.client_id == models.Client.id)
        .join(models.ClientProduct, models.AMC.client_product_id == models.ClientProduct.id)
        .join(models.Product, models.ClientProduct.product_id == models.Product.id)
        .filter(models.AMC.status == "Active", models.AMC.end_date >= today)
        .order_by(models.AMC.end_date)
        .limit(8)
        .all()
    )

    stale_lead_rows = (
        db.query(models.Lead)
        .filter(models.Lead.status.in_(["New", "Contacted"]))
        .order_by(models.Lead.created_at)
        .limit(6)
        .all()
    )
    
    return {
        "summary": {
            "total_clients": total_clients,
            "total_products": total_products,
            "total_ownerships": total_ownerships,
            "active_amcs": amcs.get("Active", 0),
            "expired_amcs": amcs.get("Expired", 0),
            "renewed_amcs": amcs.get("Renewed", 0),
            "pending_amcs": amcs.get("Pending", 0),
            "total_leads": total_leads,
            "converted_leads": leads.get("Converted", 0),
            "active_revenue": active_revenue,
            "expired_revenue": expired_revenue,
            "pending_revenue": pending_revenue,
            "total_amc_value": total_amc_value,
            "expiring_30": expiring_30,
            "expiring_60_value": expiring_60_value,
            "recent_leads": recent_leads,
            "conversion_rate": conversion_rate,
        },
        "amc_status": amcs,
        "lead_status": leads,
        "monthly_amc_value": [
            {"month": month or "Unknown", "count": count, "value": value or 0}
            for month, count, value in monthly_rows
        ],
        "top_clients": [
            {"name": name, "amcs": count, "value": value or 0}
            for name, count, value in top_client_rows
        ],
        "top_products": [
            {"name": name, "owners": owners}
            for name, owners in top_product_rows
        ],
        "upcoming_renewals": [
            {
                "id": amc.id,
                "client": client.name,
                "product": product.name,
                "end_date": amc.end_date,
                "amount": amc.amount,
                "days_left": (amc.end_date - today).days,
            }
            for amc, client, ownership, product in upcoming_rows
        ],
        "lead_followups": [
            {
                "id": lead.id,
                "name": lead.name,
                "status": lead.status,
                "phone": lead.phone,
                "created_at": lead.created_at,
                "notes": lead.notes,
            }
            for lead in stale_lead_rows
        ],
    }

@router.get("/reports/{report_type}")
def get_report(report_type: str, db: Session = Depends(get_db)):
    if report_type == "amcs":
        rows = (
            db.query(models.AMC, models.Client, models.ClientProduct, models.Product)
            .join(models.Client, models.AMC.client_id == models.Client.id)
            .join(models.ClientProduct, models.AMC.client_product_id == models.ClientProduct.id)
            .join(models.Product, models.ClientProduct.product_id == models.Product.id)
            .order_by(models.AMC.end_date)
            .all()
        )
        return [
            {
                "id": amc.id,
                "client": client.name,
                "product": product.name,
                "status": amc.status,
                "amount": amc.amount,
                "start_date": amc.start_date,
                "end_date": amc.end_date,
            }
            for amc, client, ownership, product in rows
        ]

    if report_type == "clients":
        return [
            {
                "id": client.id,
                "name": client.name,
                "email": client.email,
                "phone": client.phone,
                "address": client.address,
                "created_at": client.created_at,
            }
            for client in db.query(models.Client).order_by(models.Client.name).all()
        ]

    if report_type == "products":
        rows = (
            db.query(models.Product, func.count(models.ClientProduct.id).label("owners"))
            .outerjoin(models.ClientProduct, models.Product.id == models.ClientProduct.product_id)
            .group_by(models.Product.id)
            .order_by(models.Product.name)
            .all()
        )
        return [
            {
                "id": product.id,
                "name": product.name,
                "category": product.category,
                "price": product.price,
                "owners": owners,
            }
            for product, owners in rows
        ]

    return {"detail": "Use report_type amcs, clients, or products"}
