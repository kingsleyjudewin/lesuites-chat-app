from pydantic import BaseModel


class EncryptRequest(BaseModel):
    plaintext: str


class EncryptResponse(BaseModel):
    ciphertext: str
    keyVersion: str


class DecryptRequest(BaseModel):
    ciphertext: str
    keyVersion: str


class DecryptResponse(BaseModel):
    plaintext: str


class EncryptBatchRequest(BaseModel):
    plaintexts: list[str]


class EncryptBatchResponse(BaseModel):
    items: list[EncryptResponse]


class DecryptItem(BaseModel):
    ciphertext: str
    keyVersion: str


class DecryptBatchRequest(BaseModel):
    items: list[DecryptItem]


class DecryptBatchResponse(BaseModel):
    items: list[DecryptResponse]
