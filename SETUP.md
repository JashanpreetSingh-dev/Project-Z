# Development Setup Guide

## Project Structure

```
Project Z/
├── backend/              # FastAPI Python backend
│   ├── app/              # Application code
│   ├── tests/            # Test suite
│   ├── data/             # Sample data
│   └── requirements.txt  # Python dependencies
├── frontend/             # Next.js dashboard (coming in Phase 5)
├── .github/workflows/    # CI/CD
├── README.md             # Project vision
├── ROADMAP.md            # Development phases
└── SETUP.md              # This file
```

## Prerequisites

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **MongoDB** - Local install or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier)
- **Git** - [Download](https://git-scm.com/)

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
pip install -r requirements.txt

# Create .env file
cp env.example .env
# Edit .env with your API keys

# Run the server
uvicorn app.main:app --reload
```

## Configuration

Edit `backend/.env` file with your settings:

```env
# Required for Phase 1
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=voice_receptionist

# Required for Phase 2
OPENAI_API_KEY=sk-your-key-here

# Required for Phase 3 (later)
DEEPGRAM_API_KEY=your-key-here

# Required for Phase 4 (later)
TWILIO_ACCOUNT_SID=your-sid
TWILIO_AUTH_TOKEN=your-token
TWILIO_PHONE_NUMBER=+1234567890
```

## MongoDB Setup

### Option 1: Local MongoDB

```bash
# Install MongoDB Community Edition
# https://www.mongodb.com/docs/manual/installation/

# Start MongoDB
mongod
```

### Option 2: MongoDB Atlas (Recommended for beginners)

1. Create free account at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Create a free cluster
3. Get connection string
4. Update `MONGODB_URL` in `.env`

```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/
```

## Running the Application

```bash
# From backend directory
cd backend

# Development server with auto-reload
uvicorn app.main:app --reload

# Production
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Open http://localhost:8000/docs for interactive API documentation.

## Development Commands

All commands should be run from the `backend/` directory:

```bash
# Run tests
pytest

# Run tests with coverage
pytest --cov=app

# Lint code
ruff check .

# Format code
ruff format .

# Type check
pyright
```

## Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app entry point
│   ├── config.py            # Settings management
│   ├── database.py          # MongoDB connection
│   ├── models/              # Beanie document models
│   │   ├── shop.py
│   │   ├── work_order.py
│   │   └── call_log.py
│   ├── routers/             # API endpoints
│   │   ├── health.py
│   │   ├── shops.py
│   │   └── work_orders.py
│   └── services/            # Business logic (Phase 2+)
├── tests/                   # Test suite
├── data/                    # Sample data
├── requirements.txt         # Python dependencies
└── env.example              # Environment template
```

## Troubleshooting

### "MongoDB connection failed"

- Ensure MongoDB is running
- Check `MONGODB_URL` in `.env`
- For Atlas, ensure IP is whitelisted

### "Module not found" errors

- Ensure virtual environment is activated
- Ensure you're in the `backend/` directory
- Run `pip install -r requirements.txt`
