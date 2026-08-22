from pydantic import BaseModel


class EncryptRequest(BaseModel):
    plaintext: str


class EncryptResponse(BaseModel):
    ciphertext: str
    keyVersion: str
