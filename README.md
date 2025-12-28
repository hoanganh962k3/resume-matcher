# Resume Matcher

An AI-powered platform for resume optimization and ATS compatibility analysis. Built with FastAPI and Next.js.

## Overview

Resume Matcher helps optimize resumes by analyzing compatibility with job descriptions, extracting keywords, and providing improvement suggestions.

## How to Install

![Installation](assets/how_to_install_resumematcher.png)

### Prerequisites

Before you begin, make sure you have the following installed:

| Technology   | Version Required | Purpose |
|--------------|-----------------|---------|
| **Node.js**  | 18+ | Frontend development and build tools |
| **Python**   | 3.12+ | Backend API server |
| **uv**       | Latest | Fast Python package installer |
| **Ollama**   | 0.6.7+ | Local AI model serving (optional, defaults to OpenAI) |

**Installation links:**
- [Node.js](https://nodejs.org/) - Download LTS version
- [Python](https://www.python.org/downloads/) - v3.12 or higher
- [uv](https://github.com/astral-sh/uv) - Fast Python package installer
- [Ollama](https://ollama.com/download) - Only if using local AI models

### Quick Start (Automated Setup)

The easiest way to get started is using our automated setup scripts:

#### **Windows (PowerShell)**
```powershell
# Clone the repository
git clone https://github.com/srbhr/Resume-Matcher.git
cd Resume-Matcher

# Run automated setup (installs dependencies, configures environment)
.\setup.ps1

# Start the development server
.\setup.ps1 -StartDev
```

#### **Linux/macOS (Bash)**
```bash
# Clone the repository
git clone https://github.com/srbhr/Resume-Matcher.git
cd Resume-Matcher

# Make setup script executable
chmod +x setup.sh

# Run automated setup
./setup.sh

# Start the development server
./setup.sh --start-dev
```

The automated setup will:
- ✅ Verify/install prerequisites (Node.js, Python, uv)
- ✅ Install Ollama (if needed for local AI models)
- ✅ Create `.env` configuration files
- ✅ Install all frontend and backend dependencies
- ✅ Pull required AI models (gemma3:4b by default)

### Manual Setup (Step-by-Step)

If you prefer to set up manually or the automated script doesn't work:

#### **1. Clone the Repository**
```bash
git clone https://github.com/srbhr/Resume-Matcher.git
cd Resume-Matcher
```

#### **2. Install Dependencies**

**Install root dependencies:**
```bash
npm install
```

**Install frontend dependencies:**
```bash
cd apps/frontend
npm install
cd ../..
```

**Install backend dependencies:**
```bash
cd apps/backend
uv sync  # This creates a virtual environment and installs all Python packages
cd ../..
```

#### **3. Configure Environment Variables**

**Create root `.env` file:**
```bash
# Copy from example
cp .env.example .env

# Edit with your settings (optional, defaults work for local development)
```

**Create backend `.env` file:**
```bash
# Copy from sample
cp apps/backend/.env.sample apps/backend/.env

# Configure AI provider (defaults to OpenAI, change to Ollama for local models)
```

**Key environment variables:**
- `LLM_PROVIDER` - Set to `ollama` for local AI or `openai` for cloud
- `EMBEDDING_PROVIDER` - Set to `ollama` or `openai`
- `NEXT_PUBLIC_API_URL` - Frontend API endpoint (default: `http://localhost:8000`)
- `ASYNC_DATABASE_URL` - Database connection (default: `sqlite+aiosqlite:///./app.db`)

#### **4. Start Development Servers**

**Option A: Start both frontend and backend together:**
```bash
npm run dev
```

**Option B: Start separately:**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend  
npm run dev:frontend
```

#### **5. Access the Application**
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

### Technology Stack

The project is built using:

- **Backend:** FastAPI (Python 3.12+) with async/await patterns
- **Frontend:** Next.js 15+ with App Router and TypeScript
- **AI Models:** Ollama serving gemma3:4b locally (or OpenAI API)
- **Styling:** Tailwind CSS 4.0 with Radix UI components
- **Database:** SQLite with SQLAlchemy ORM
- **Document Processing:** MarkItDown for PDF/DOCX conversion

## Docker Setup (Alternative)

You can run the whole stack with Docker and docker-compose as an alternative to local installation.

### Development Mode (with hot reload):

```bash
# Start services with hot-reload for backend and frontend
docker compose -f docker-compose.dev.yml up --build
```

This mounts your local files into containers so changes are reflected immediately.

### Production Mode:

```bash
# Build and run in production mode
docker compose up --build -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

**Docker Notes:**
- Production compose sets `NEXT_PUBLIC_API_URL` to `http://backend:8000` for container communication
- Development compose mounts local files and runs dev servers
- No need to install Node.js, Python, or dependencies locally when using Docker

## Common Commands

### Development Commands

```bash
# Start development servers (both frontend and backend)
npm run dev

# Start only backend
npm run dev:backend

# Start only frontend  
npm run dev:frontend

# Build for production
npm run build

# Lint frontend code
npm run lint
```

### Database Commands

```bash
# Reset database (Windows PowerShell)
.\reset-database.ps1

# Reset database (Linux/macOS)
python apps/backend/reset_db.py
```

## Troubleshooting

### Common Issues

**1. Port already in use**
```bash
# If port 8000 or 3000 is already in use, kill the process:
# Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Linux/macOS:
lsof -ti:8000 | xargs kill -9
```

**2. Module not found errors**
```bash
# Reinstall dependencies
npm install
cd apps/backend && uv sync
```

**3. Ollama connection errors**
```bash
# Make sure Ollama is running
ollama serve

# Pull the required model
ollama pull gemma3:4b
```

**4. Python version issues**
```bash
# Check Python version (must be 3.12+)
python --version

# If using wrong version, update Python or use uv with specific version:
uv venv --python 3.12
```

**5. Database errors**
```bash
# Reset the database
.\reset-database.ps1  # Windows
python apps/backend/reset_db.py  # Linux/macOS
```

For more detailed setup and troubleshooting, see [SETUP.md](SETUP.md).

## License

Apache 2.0 License - see [LICENSE](LICENSE) file for details.
