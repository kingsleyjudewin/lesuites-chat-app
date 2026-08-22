import base64
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.services.key_manager import key_manager

