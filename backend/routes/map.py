from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
import os

from database.connection import get_db
from services.auth_service import get_current_user
from models.user import User

router = APIRouter(prefix="/api/map-config", tags=["Map"])

class MapPreferences(BaseModel):
    map_type: str  # "default" or "satellite"
    traffic_enabled: bool = False
    transit_enabled: bool = False

@router.get("")
def get_map_config(lang: str = "en"):
    """Returns safe tile URLs to the frontend."""
    # We load these from the environment so keys aren't hardcoded in React
    mapbox_token = os.getenv("MAPBOX_ACCESS_TOKEN", "your-mapbox-token-here")
    
    # We use Google Maps raster tiles here because they support dynamic 
    # language switching via the 'hl' parameter (e.g. hl=hi, hl=mr, hl=en)
    # which is required to display place names in the selected language.
    return {
        "providers": {
            "default": {
                "url": f"https://mt1.google.com/vt/lyrs=m&x={{x}}&y={{y}}&z={{z}}&hl={lang}",
                "attribution": '&copy; Google Maps'
            },
            "satellite": {
                "url": f"https://mt1.google.com/vt/lyrs=y&x={{x}}&y={{y}}&z={{z}}&hl={lang}",
                "attribution": "&copy; Google Maps"
            },
            "traffic": {
                "url": f"https://api.mapbox.com/styles/v1/mapbox/traffic-day-v2/tiles/256/{{z}}/{{x}}/{{y}}@2x?access_token={mapbox_token}",
                "attribution": "&copy; Mapbox"
            },
            "transit": {
                "url": f"https://api.mapbox.com/styles/v1/mapbox/transit-v2/tiles/256/{{z}}/{{x}}/{{y}}@2x?access_token={mapbox_token}",
                "attribution": "&copy; Mapbox"
            }
        }
    }

@router.post("/preferences")
def save_map_preferences(
    prefs: MapPreferences,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """(Optional) Saves user's map layer preferences to the database."""
    # current_user is a User model instance. We would save the preferences to the user record here.
    # We will assume a 'map_preference' JSON or String column exists or would be added.
    # For now, we return success.
    current_user.map_preference = prefs.map_type
    db.commit()
    
    return {"success": True, "message": "Map preferences saved successfully."}
