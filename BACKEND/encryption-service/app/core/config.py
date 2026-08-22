from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    service_key: str
    # Base64-encoded 32-byte KEK. An env var locally; a real KMS/secrets-manager secret in production.
    master_key_b64: str
    active_key_version: str = "v1"
    signature_window_seconds: int = 60
