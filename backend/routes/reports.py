from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import Optional, List
import uuid

from database.connection import get_db
from models.report import Report
from models.user import User
from schemas.report import ReportCreate, ReportUpdate, ReportOut
from services.auth_service import (
    get_current_user,
    require_staff_or_admin,
    require_admin,
)

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post("", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def submit_report(
    body: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Any authenticated user (citizen+). Submit an issue report about a facility."""
    report = Report(
        facility_id=body.facility_id,
        reported_by=current_user.id,
        issue=body.issue,
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


@router.get("", response_model=List[ReportOut])
def list_reports(
    report_status: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_staff_or_admin),
):
    """Staff/Admin only. List all reports, optionally filtered by status."""
    query = db.query(Report)
    if report_status:
        query = query.filter(Report.status == report_status)
    return query.order_by(Report.created_at.desc()).all()


@router.put("/{report_id}", response_model=ReportOut)
def update_report(
    report_id: uuid.UUID,
    body: ReportUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin only. Verify or reject a report."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    report.status = body.status
    if body.admin_note is not None:
        report.admin_note = body.admin_note

    db.commit()
    db.refresh(report)
    return report
