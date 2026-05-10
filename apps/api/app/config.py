from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    groq_api_key: str = ""
    groq_model: str = "llama-3.3-70b-versatile"
    mongodb_uri: str = "mongodb://localhost:27017"
    mongodb_db: str = "voyage"
    cors_origins: str = "http://localhost:5173"

    jwt_secret: str = "dev-only-change-me"
    jwt_alg: str = "HS256"
    jwt_ttl_days: int = 30
    cookie_name: str = "voyage_auth"
    cookie_secure: bool = False
    cookie_domain: str | None = None
    cookie_samesite: str = "lax"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
