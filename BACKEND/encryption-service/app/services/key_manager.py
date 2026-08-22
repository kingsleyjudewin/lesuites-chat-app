import base64
import hashlib
import hmac

from app.core.config import settings


def _hkdf_sha256(ikm: bytes, salt: bytes, info: bytes, length: int = 32) -> bytes:
    prk = hmac.new(salt, ikm, hashlib.sha256).digest()
    okm = b""
    t = b""
    counter = 1
    while len(okm) < length:
        t = hmac.new(prk, t + info + bytes([counter]), hashlib.sha256).digest()
        okm += t
        counter += 1
    return okm[:length]


class KeyManager:
    """Envelope encryption without an external KMS: every message key is an HKDF-derived
    sub-key of the master KEK, keyed by version. Rotation = bump active_key_version; old
    messages stay decryptable because their version's sub-key is always re-derivable from
    the same KEK. No per-message DEKs are stored. See docs/SECURITY.md for the real-KMS
    upgrade path (randomly generated DEKs, individually wrapped and persisted)."""

    def __init__(self):
        self._master_key = base64.b64decode(settings.master_key_b64)
        self._cache: dict[str, bytes] = {}

    def get_data_key(self, key_version: str) -> bytes:
