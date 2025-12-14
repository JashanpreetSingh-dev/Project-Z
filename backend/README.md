# Voice Receptionist - Backend

FastAPI backend for the Voice Receptionist AI system.

## Quick Start

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv .venv

# Activate (Windows)
.\.venv\Scripts\Activate.ps1

# Activate (Linux/Mac)
source .venv/bin/activate

# Install dependencies
pip install -e ".[dev]"

# Copy env file and edit with your keys
cp env.example .env

# Run server
uvicorn app.main:app --reload
```

## API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Structure

```
backend/
├── app/
│   ├── main.py          # FastAPI entry point
│   ├── config.py        # Settings
│   ├── database.py      # MongoDB connection
│   ├── models/          # Beanie ODM models
│   ├── routers/         # API endpoints
│   └── services/        # Business logic
├── tests/               # Pytest test suite
└── data/                # Sample CSV data
```

## Commands

```bash
# Run server
uvicorn app.main:app --reload

# Run tests
pytest

# Lint
ruff check .

# Format
ruff format .

# Type check
pyright
```

See [SETUP.md](../SETUP.md) in the project root for detailed setup instructions.
