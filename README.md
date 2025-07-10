# 🧠 OWS Workflow Snapshot & Visualization Tool

This project provides a full-stack solution to **extract, store, and visualize** Oracle Workflow (OWS) data — including feeds, match processes, and end states — for internal use at Barclays.

It enables teams to view the latest snapshot of OWS workflows across multiple feeds and match pipelines, making audit, validation, and reporting easier.

## 📋 Table of Contents

- [Features](#-features)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [Troubleshooting](#-troubleshooting)
- [License](#-license)

## ✨ Features

- **Session-authenticated login** using bcrypt encryption
- **Weekly Oracle data snapshot** → stored in SQLite/PostgreSQL
- **Interactive React dashboard** with filtering by project/feed/workflow
- **Weekly Excel delivery** via automated email (optional)
- **RESTful API** for programmatic access
- **Responsive UI** built with React, TypeScript, and Tailwind CSS
- **Audit logging** of workflow state changes
- **Role-based access control** (coming soon)

## 📁 Project Structure

```
ows-workflow-tool/
├── backend/
│   ├── ows_ingest/          # Oracle data ingestion module
│   │   ├── __init__.py
│   │   ├── models.py        # Database models
│   │   ├── oracle_client.py # Oracle connection handler
│   │   └── snapshot.py      # Snapshot generation logic
│   ├── ows_api/             # REST API endpoints
│   │   ├── __init__.py
│   │   ├── views.py         # API views
│   │   ├── serializers.py   # Data serializers
│   │   └── urls.py          # API routing
│   ├── users/               # User authentication
│   │   ├── __init__.py
│   │   ├── models.py        # User models
│   │   ├── views.py         # Auth views
│   │   └── urls.py          # Auth routing
│   ├── core/                # Django project settings
│   │   ├── __init__.py
│   │   ├── settings.py      # Main settings
│   │   ├── urls.py          # Main URL config
│   │   └── wsgi.py          # WSGI configuration
│   ├── manage.py            # Django management script
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variables template
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── App.tsx          # Main application component
│   ├── public/              # Static assets
│   ├── package.json         # Node.js dependencies
│   └── tsconfig.json        # TypeScript configuration
├── docs/                    # Documentation
├── scripts/                 # Deployment and utility scripts
├── .gitignore
├── README.md
└── docker-compose.yml       # Docker configuration (optional)
```

## 🔧 Prerequisites

- **Python 3.8+** (recommended: 3.9+)
- **Node.js 16+** and **npm**
- **Oracle Instant Client** (or use oracledb >= 2.0 in thin mode)
- **Git**
- **SQLite** (default) or **PostgreSQL** (production)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/barclays/ows-workflow-tool.git
cd ows-workflow-tool
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Install development dependencies
npm install --save-dev
```

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Oracle Database Configuration
ORACLE_USER=your_oracle_username
ORACLE_PASSWORD=your_oracle_password
ORACLE_DSN=your_oracle_host:1521/your_service_name
ORACLE_POOL_MIN=2
ORACLE_POOL_MAX=10

# Django Configuration
DJANGO_SECRET_KEY=your_super_secret_key_here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Database Configuration (SQLite default)
DATABASE_URL=sqlite:///db.sqlite3
# For PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/ows_db

# Email Configuration (for automated reports)
EMAIL_HOST=smtp.barclays.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@barclays.com
EMAIL_HOST_PASSWORD=your_email_password
DEFAULT_FROM_EMAIL=ows-notify@barclays.com

# Logging
LOG_LEVEL=INFO
LOG_FILE=logs/ows.log

# Redis (optional, for caching)
REDIS_URL=redis://localhost:6379/0
```

### 2. Database Migration

```bash
cd backend

# Run database migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser
```

### 3. Oracle Client Setup

#### Option A: Oracle Instant Client (Recommended)
1. Download Oracle Instant Client from Oracle website
2. Extract and set environment variables:
   ```bash
   export LD_LIBRARY_PATH=/path/to/instantclient:$LD_LIBRARY_PATH
   export ORACLE_HOME=/path/to/instantclient
   ```

#### Option B: Thin Mode (No Client Required)
Update your `.env` file:
```env
ORACLE_CLIENT_MODE=thin
```

## 🎯 Usage

### Development Mode

#### Start Backend Server
```bash
cd backend
source venv/bin/activate
python manage.py runserver
```
Backend will be available at `http://localhost:8000`

#### Start Frontend Development Server
```bash
cd frontend
npm run dev
```
Frontend will be available at `http://localhost:3000`

### Generate Snapshot Manually

```bash
cd backend
python manage.py generate_snapshot
```

### Send Email Report

```bash
cd backend
python manage.py send_snapshot_email
```

## 🕒 Scheduled Tasks

### Weekly Snapshot Generation

Add to crontab (`crontab -e`):
```bash
# Generate snapshot every Sunday at 2 AM
0 2 * * 0 /path/to/venv/bin/python /path/to/manage.py generate_snapshot >> /path/to/logs/snapshot.log 2>&1
```

### Weekly Email Reports

```bash
# Send email report every Sunday at 3 AM
0 3 * * 0 /path/to/venv/bin/python /path/to/manage.py send_snapshot_email >> /path/to/logs/email.log 2>&1
```

## 📡 API Documentation

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/login/` | User login (session auth) |
| POST | `/api/users/logout/` | User logout |
| GET | `/api/users/check-session/` | Check current session |
| GET | `/api/users/profile/` | Get user profile |

### Workflow Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ows/latest-snapshot/` | Get latest snapshot JSON |
| GET | `/api/ows/snapshots/` | List all snapshots |
| GET | `/api/ows/snapshot/<id>/` | View specific snapshot |
| POST | `/api/ows/generate-snapshot/` | Trigger snapshot generation |
| GET | `/api/ows/feeds/` | List available feeds |
| GET | `/api/ows/projects/` | List available projects |

### Request/Response Examples

#### Login Request
```bash
curl -X POST http://localhost:8000/api/users/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "your_username", "password": "your_password"}'
```

#### Get Latest Snapshot
```bash
curl -X GET http://localhost:8000/api/ows/latest-snapshot/ \
  -H "Content-Type: application/json" \
  --cookie "sessionid=your_session_id"
```

### Response Format

All API responses follow this format:
```json
{
  "success": true,
  "data": {
    // Response data
  },
  "message": "Success message",
  "timestamp": "2024-01-20T10:30:00Z"
}
```

## 🐳 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up --build

# For production
docker-compose -f docker-compose.prod.yml up -d
```

### Traditional Deployment

1. **Backend (Django)**:
   ```bash
   # Install production dependencies
   pip install gunicorn psycopg2-binary

   # Collect static files
   python manage.py collectstatic

   # Run with Gunicorn
   gunicorn core.wsgi:application --bind 0.0.0.0:8000
   ```

2. **Frontend (React)**:
   ```bash
   # Build for production
   npm run build

   # Serve with nginx or Apache
   ```

3. **Database**: Use PostgreSQL for production
4. **Web Server**: Configure nginx as reverse proxy
5. **Process Management**: Use supervisor or systemd

## 🛠 Development

### Code Style

```bash
# Python (Black + flake8)
black .
flake8 .

# JavaScript/TypeScript (Prettier + ESLint)
npm run lint
npm run format
```

### Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm test
```

### Pre-commit Hooks

```bash
# Install pre-commit
pip install pre-commit
pre-commit install
```

## 🔍 Troubleshooting

### Common Issues

#### Oracle Connection Issues
```bash
# Check Oracle client installation
python -c "import oracledb; print('Oracle client OK')"

# Test connection
python manage.py shell
>>> from ows_ingest.oracle_client import test_connection
>>> test_connection()
```

#### CORS Issues
- Ensure `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Use `withCredentials: true` in frontend API calls
- Check that `django-cors-headers` is installed and configured

#### Session Authentication
- Verify CSRF tokens are properly handled
- Check cookie settings in Django settings
- Ensure frontend sends cookies with requests

### Logging

Check logs for debugging:
```bash
# Application logs
tail -f logs/ows.log

# Django logs
tail -f logs/django.log

# Cron job logs
tail -f logs/snapshot.log
```

## 📊 Performance Optimization

### Database Optimization
- Use database indexes on frequently queried fields
- Implement pagination for large datasets
- Consider using Redis for caching

### Frontend Optimization
- Implement lazy loading for components
- Use React.memo for expensive components
- Optimize bundle size with code splitting

## 🔒 Security Considerations

- **Database**: Use parameterized queries to prevent SQL injection
- **Authentication**: Implement proper session management
- **CORS**: Configure allowed origins restrictively
- **Environment Variables**: Never commit sensitive data to version control
- **Input Validation**: Validate all user inputs on both frontend and backend

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for all new frontend code
- Write tests for new features
- Update documentation for API changes
- Use meaningful commit messages

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [React Documentation](https://reactjs.org/docs/)
- [Oracle Database Documentation](https://docs.oracle.com/en/database/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 📞 Support

For internal support:
- **Email**: ows-team@barclays.com
- **Slack**: #ows-workflow-tool
- **Wiki**: [Internal Confluence Page]

## 📜 License

This project is proprietary software developed for Barclays internal use only.

---

## 🏷️ Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2024-01-20 | Initial release |
| 1.1.0 | 2024-02-15 | Added Excel export feature |
| 1.2.0 | 2024-03-10 | Enhanced dashboard filtering |

---

**Built with ❤️ by the Barclays OWS Team**

*Last Updated: January 2024*