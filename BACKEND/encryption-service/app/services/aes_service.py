import base64
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.services.key_manager import key_manager

NONCE_SIZE = 12


def encrypt(plaintext: str, key_version: str | None = None) -> tuple[str, str]:
    version = key_version or key_manager.active_key_version
    key = key_manager.get_data_key(version)
    aesgcm = AESGCM(key)
