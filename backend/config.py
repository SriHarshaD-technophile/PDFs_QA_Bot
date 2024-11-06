"""
config.py
----------
Configuration file for setting up application-specific configurations,
such as API keys, environment variables, and other constants.
"""

import os

class Config:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pdfs.db")
