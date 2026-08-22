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

    if abs(time.time() * 1000 - timestamp) > settings.signature_window_seconds * 1000:
        raise HTTPException(status_code=401, detail="Request expired")

    # Must sign the raw body bytes exactly as received — reserializing the parsed model would
    # produce a different byte string than what the Node client signed, breaking verification.
