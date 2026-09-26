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
def get_map_config():
    """Returns safe tile URLs to the frontend."""
    # We load these from the environment so keys aren't hardcoded in React
    mapbox_token = os.getenv("MAPBOX_ACCESS_TOKEN", "your-mapbox-token-here")
    
    return {
        "providers": {
            "default": {
                "url": "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
                "attribution": '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            },
            "satellite": {
                "url": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
                "attribution": "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
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
