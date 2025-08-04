from pydantic_settings import BaseSettings #loads env files into python objs

class Settings(BaseSettings):
    DB_URL: str
    DEBUG: bool
    
    class Config:
        env_file = ".env"
        
settings = Settings()