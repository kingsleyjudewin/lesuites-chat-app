from fastapi import FastAPI

from app.routers.crypto import router as crypto_router

app = FastAPI(title="LeSuits Encryption Service")

app.include_router(crypto_router)


@app.get("/health")
def health():
    return {"success": True, "status": "ok"}
