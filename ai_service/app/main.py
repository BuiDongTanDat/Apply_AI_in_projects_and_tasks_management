from fastapi import FastAPI
from app.routers.ai_routes import router as ai_router

app = FastAPI(title="Tasks AI Service", version="1.0.0")
app.include_router(ai_router)

@app.get("/health")
def health():
    return {"status": "ok"}
