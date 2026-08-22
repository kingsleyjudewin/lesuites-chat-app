from fastapi import APIRouter, Depends

from app.core.security import verify_service_signature
from app.schemas.crypto import (
    DecryptBatchRequest,
    DecryptBatchResponse,
    DecryptRequest,
    DecryptResponse,
    EncryptBatchRequest,
    EncryptBatchResponse,
    EncryptRequest,
    EncryptResponse,
)
from app.services import aes_service

router = APIRouter(dependencies=[Depends(verify_service_signature)])


@router.post("/encrypt", response_model=EncryptResponse)
def encrypt(payload: EncryptRequest):
    ciphertext, key_version = aes_service.encrypt(payload.plaintext)
    return EncryptResponse(ciphertext=ciphertext, keyVersion=key_version)


@router.post("/decrypt", response_model=DecryptResponse)
def decrypt(payload: DecryptRequest):
    plaintext = aes_service.decrypt(payload.ciphertext, payload.keyVersion)
    return DecryptResponse(plaintext=plaintext)


@router.post("/encrypt/batch", response_model=EncryptBatchResponse)
def encrypt_batch(payload: EncryptBatchRequest):
    items = []
