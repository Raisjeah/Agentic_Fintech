from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import analysis, status, history

app = FastAPI(title="Agentic AI Trading Research Desk")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analysis.router, prefix="/api")
app.include_router(status.router)
app.include_router(history.router, prefix="/api")

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.get("/api/settings/status")
def settings_status():
    import os
    from dotenv import load_dotenv
    load_dotenv()
    return {
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY")),
        "fred_configured": bool(os.getenv("FRED_API_KEY"))
    }
