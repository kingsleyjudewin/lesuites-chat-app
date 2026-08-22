import base64
import os

from cryptography.hazmat.primitives.ciphers.aead import AESGCM

from app.services.key_manager import key_manager

NONCE_SIZE = 12


def encrypt(plaintext: str, key_version: str | None = None) -> tuple[str, str]:
    version = key_version or key_manager.active_key_version
    key = key_manager.get_data_key(version)
    aesgcm = AESGCM(key)
    nonce = os.urandom(NONCE_SIZE)
    ct = aesgcm.encrypt(nonce, plaintext.encode("utf-8"), None)
    blob = base64.b64encode(nonce + ct).decode("ascii")
    return blob, version


def decrypt(blob: str, key_version: str) -> str:
    key = key_manager.get_data_key(key_version)
    raw = base64.b64decode(blob)
    nonce, ct = raw[:NONCE_SIZE], raw[NONCE_SIZE:]
    aesgcm = AESGCM(key)
    plaintext = aesgcm.decrypt(nonce, ct, None)
    return plaintext.decode("utf-8")
