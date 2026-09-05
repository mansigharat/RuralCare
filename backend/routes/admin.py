from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from database.connection import get_db
from models.facility import Facility, FacilityStatus
from models.report import Report, ReportStatus
from models.user import User
from schemas.report import ReportUpdate, ReportOut
from services.auth_service import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin only. Returns high-level KPI counts for the dashboard."""
    total_facilities = db.query(Facility).count()
    verified_count = db.query(Facility).filter(Facility.status == FacilityStatus.fresh).count()
    needs_verification_count = (
        db.query(Facility).filter(Facility.status == FacilityStatus.needs_verification).count()
    )
    pending_reports_count = db.query(Report).filter(Report.status == ReportStatus.pending).count()
    total_users = db.query(User).count()

    return {
        "total_facilities": total_facilities,
        "verified_count": verified_count,
        "needs_verification_count": needs_verification_count,
        "pending_reports_count": pending_reports_count,
        "total_users": total_users,
    }


@router.put("/reports/{report_id}", response_model=ReportOut)
def admin_update_report(
    report_id: uuid.UUID,
    body: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin only. Alias for PUT /reports/{id} — verify or reject a report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    report.status = body.status
    if body.admin_note is not None:
        report.admin_note = body.admin_note

    db.commit()
    db.refresh(report)
    return report
