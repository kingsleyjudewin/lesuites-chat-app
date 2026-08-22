import hashlib
import hmac
import time

from fastapi import Header, HTTPException, Request

from app.core.config import settings
