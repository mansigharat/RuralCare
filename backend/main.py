import os
# pyrefly: ignore [missing-import]
from dotenv import load_dotenv

load_dotenv()

# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware

from database.connection import Base, engine

# Import all models so Alembic / create_all can see them
from models import user, facility, service, doctor, medicine, report  # noqa: F401

from routes import auth, facilities, doctors, medicines, reports, admin, ai

# ── App init ──────────────────────────────────────────────────────────────────

app = FastAPI(
    title="RuralCare API",
    description="Healthcare facility finder for rural India — SIH Hackathon",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],          # Tighten in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Auto-create tables (dev convenience; use Alembic in production) ───────────

Base.metadata.create_all(bind=engine)

# ── Routers ───────────────────────────────────────────────────────────────────

app.include_router(auth.router)
app.include_router(facilities.router)
app.include_router(doctors.router)
app.include_router(medicines.router)
app.include_router(reports.router)
app.include_router(admin.router)
app.include_router(ai.router)


# ── Health check ──────────────────────────────────────────────────────────────

@app.get("/", tags=["Health"])
def root():
    return {"status": "ok", "message": "RuralCare API is running"}


# ── Dev server ────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
