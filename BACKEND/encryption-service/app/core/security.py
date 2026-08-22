import hashlib
import hmac
import time

from fastapi import Header, HTTPException, Request

from app.core.config import settings


async def verify_service_signature(request: Request, x_service_timestamp: str = Header(...), x_service_signature: str = Header(...)):
    try:
        timestamp = int(x_service_timestamp)
    except ValueError:
        raise HTTPException(status_code=401, detail="Invalid timestamp")
