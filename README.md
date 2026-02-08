# Todo AI Chatbot

A cloud-native todo application with an integrated AI chatbot powered by Cohere, featuring authentication, task management, and intelligent assistance.

## Features

### Core Functionality
- ✅ **User Authentication**: Secure sign-up and sign-in with Better Auth
- ✅ **Task Management**: Create, read, update, and delete tasks
- ✅ **AI Chatbot**: Intelligent task assistance powered by Cohere AI
- ✅ **Real-time Updates**: Instant task synchronization
- ✅ **Responsive Design**: Works on desktop and mobile devices

### Technical Features
- 🚀 **Cloud-Native Architecture**: Kubernetes-ready with Helm charts
- 🐳 **Containerized**: Docker multi-stage builds for optimal image size
- 🤖 **AI-Powered DevOps**: Integration with Gordon, kubectl-ai, and kagent
- 📊 **Production-Ready**: Health checks, resource limits, and monitoring
- 🔒 **Secure**: Non-root containers, secrets management, environment isolation

## Architecture

### Technology Stack

**Frontend**:
- Next.js 16 (React framework)
- TypeScript
- Tailwind CSS
- Better Auth (authentication)

**Backend**:
- FastAPI (Python web framework)
- PostgreSQL (database)
- Cohere API (AI chatbot)
- Uvicorn (ASGI server)

**Infrastructure**:
- Docker (containerization)
- Kubernetes (orchestration)
- Helm (package management)
- Minikube (local development)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         Ingress                              │
│                      (todo.local)                            │
└────────────────┬────────────────────────────────────────────┘
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐  ┌──────────────┐
│   Frontend   │  │   Backend    │
│   Service    │  │   Service    │
│  (Port 3000) │  │  (Port 8000) │
└──────┬───────┘  └──────┬───────┘
       │                 │
       ▼                 ▼
┌──────────────┐  ┌──────────────┐
│   Frontend   │  │   Backend    │
│     Pod      │  │     Pod      │
│  (Next.js)   │  │  (FastAPI)   │
└──────────────┘  └──────┬───────┘
                         │
                         ▼
                  ┌──────────────┐
                  │  PostgreSQL  │
                  │  (External)  │
                  └──────────────┘
```

## Prerequisites

### System Requirements
- **CPU**: 4 cores minimum (6+ recommended)
- **Memory**: 8GB RAM minimum (12GB+ recommended)
- **Disk**: 20GB free space
- **OS**: Linux, macOS, or Windows 10/11

### Required Software

**For Local Development**:
- Node.js 20+
- Python 3.11+
- PostgreSQL 14+
- npm or yarn

**For Kubernetes Deployment**:
- Docker 20.10+ (Docker Desktop 4.53+ Beta for Gordon AI)
- Minikube 1.30+
- kubectl 1.27+
- Helm 3.12+

**Optional AI DevOps Tools**:
- Gordon (Docker AI) - Built into Docker Desktop 4.53+ Beta
- kubectl-ai - https://github.com/sozercan/kubectl-ai
- kagent - https://github.com/kubeshop/kagent

### Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/todo_db

# Authentication
BETTER_AUTH_SECRET=your-secret-key-here

# AI Integration
COHERE_API_KEY=your-cohere-api-key-here

# Frontend (optional)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Installation

### Option 1: Local Development

#### 1. Clone Repository
```bash
git clone <repository-url>
cd phase04
```

#### 2. Setup Database
```bash
# Create PostgreSQL database
createdb todo_db

# Run migrations (if applicable)
# psql -d todo_db -f migrations/schema.sql
```

#### 3. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

#### 4. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

#### 5. Access Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Option 2: Kubernetes Deployment

Deploy the application to a local Kubernetes cluster using Minikube.

#### Quick Start

```bash
# 1. Setup Minikube
./infra/k8s/minikube/setup.sh

# 2. Build Docker images
./infra/scripts/build-images.sh

# 3. Load images into Minikube
./infra/scripts/load-images.sh

# 4. Deploy with Helm
export BETTER_AUTH_SECRET="your-secret-here"
export COHERE_API_KEY="your-api-key-here"
export DATABASE_URL="postgresql://user:pass@host:5432/dbname"

./infra/scripts/deploy.sh

# 5. Access application
# Add to /etc/hosts: 127.0.0.1 todo.local
# Open browser: http://todo.local
```

#### Detailed Kubernetes Setup

For comprehensive Kubernetes deployment instructions, see:
- **Quick Start Guide**: `specs/001-k8s-deployment/quickstart.md`
- **Infrastructure README**: `infra/README.md`
- **Minikube Setup**: `docs/deployment/MINIKUBE_SETUP.md`
- **AI Tools Guide**: `docs/deployment/AI_TOOLS_GUIDE.md`
- **Troubleshooting**: `docs/deployment/TROUBLESHOOTING.md`

#### Kubernetes Architecture

The Kubernetes deployment includes:

**Deployments**:
- Frontend (Next.js) - 1 replica, 256Mi/200m resources
- Backend (FastAPI) - 1 replica, 512Mi/300m resources

**Services**:
- Frontend ClusterIP service (port 3000)
- Backend ClusterIP service (port 8000)

**Ingress**:
- Host-based routing for `todo.local`
- Path-based routing: `/` → frontend, `/api` → backend

**Configuration**:
- Secrets for sensitive data (auth secret, API keys, database URL)
- ConfigMap for environment configuration

**Features**:
- Rolling updates with zero downtime
- Readiness and liveness probes
- Resource requests and limits
- Horizontal scaling support
- Self-healing with automatic pod restart

#### AI-Powered DevOps Workflow

This project showcases AI-powered DevOps tools:

**Phase 1: Containerization with Gordon**
```bash
# Generate optimized Dockerfiles with AI
docker ai "Create production Dockerfile for Next.js 16 with standalone output"
docker ai "Create production Dockerfile for FastAPI with uvicorn"
```

**Phase 2: Deployment with kubectl-ai**
```bash
# Deploy using natural language
kubectl-ai "Create deployment for frontend with 1 replica and readiness probe"
kubectl-ai "Scale backend to 3 replicas"
```

**Phase 3: Monitoring with kagent**
```bash
# Analyze cluster health with AI
kagent "Check cluster health"
kagent "Analyze resource usage and suggest optimizations"
```

See `docs/deployment/AI_TOOLS_GUIDE.md` for complete workflows.

#### Kubernetes Management Commands

```bash
# Check deployment status
kubectl get all -l app.kubernetes.io/instance=todo-app

# View logs
kubectl logs -l app.kubernetes.io/component=backend -f

# Check resource usage
kubectl top pods -l app.kubernetes.io/instance=todo-app

# Scale deployment
kubectl scale deployment todo-app-backend --replicas=3

# Update deployment
helm upgrade todo-app ./infra/helm/todo-app

# Uninstall
helm uninstall todo-app
```

## Usage

### Creating Tasks

1. Sign up or sign in to your account
2. Click "Add Task" or use the input field
3. Enter task description
4. Press Enter or click Submit

### Using AI Chatbot

1. Click the chat icon or open the chatbot panel
2. Ask questions about your tasks:
   - "What tasks do I have today?"
   - "Help me prioritize my tasks"
   - "Suggest a task for learning Python"
3. The AI will provide intelligent responses based on your task list

### Managing Tasks

- **Edit**: Click on a task to edit its description
- **Complete**: Check the checkbox to mark as complete
- **Delete**: Click the delete icon to remove a task
- **Filter**: Use filters to view all, active, or completed tasks

## Development

### Project Structure

```
phase04/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # Next.js app directory
│   │   ├── components/      # React components
│   │   └── lib/             # Utilities and helpers
│   ├── public/              # Static assets
│   ├── package.json
│   └── next.config.js
│
├── backend/                  # FastAPI backend application
│   ├── main.py              # Application entry point
│   ├── requirements.txt     # Python dependencies
│   └── ...
│
├── infra/                    # Infrastructure as Code
│   ├── docker/              # Dockerfiles
│   │   ├── frontend/
│   │   └── backend/
│   ├── helm/                # Helm charts
│   │   └── todo-app/
│   ├── k8s/                 # Kubernetes configs
│   │   └── minikube/
│   └── scripts/             # Automation scripts
│
├── docs/                     # Documentation
│   └── deployment/          # Deployment guides
│
├── specs/                    # Feature specifications
│   └── 001-k8s-deployment/
│
└── README.md                # This file
```

### Running Tests

**Frontend**:
```bash
cd frontend
npm test
npm run test:e2e
```

**Backend**:
```bash
cd backend
pytest
pytest --cov
```

### Code Quality

**Frontend**:
```bash
npm run lint
npm run type-check
npm run format
```

**Backend**:
```bash
black .
flake8
mypy .
```

### Building for Production

**Docker Images**:
```bash
# Build both images
./infra/scripts/build-images.sh

# Or build individually
docker build -t todo-frontend:latest -f infra/docker/frontend/Dockerfile frontend/
docker build -t todo-backend:latest -f infra/docker/backend/Dockerfile backend/
```

**Helm Chart**:
```bash
# Lint chart
helm lint ./infra/helm/todo-app

# Package chart
helm package ./infra/helm/todo-app

# Test rendering
helm template todo-app ./infra/helm/todo-app
```

## Deployment Environments

### Local Development
- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- Database: localhost:5432

### Kubernetes (Minikube)
- Application: http://todo.local
- Frontend: http://todo.local/
- Backend API: http://todo.local/api

### Production Considerations

For production deployment, consider:

**Scalability**:
- Increase replica counts (3+ for high availability)
- Configure Horizontal Pod Autoscaler (HPA)
- Use cluster autoscaling

**Security**:
- Enable network policies
- Configure RBAC with least privilege
- Use secrets management (Vault, Sealed Secrets)
- Enable audit logging
- Use private container registry

**Monitoring**:
- Deploy Prometheus and Grafana
- Configure alerting rules
- Implement distributed tracing
- Set up log aggregation (ELK, Loki)

**Backup**:
- Implement database backups
- Use persistent volume snapshots
- Document recovery procedures

See `infra/README.md` for detailed production considerations.

## Troubleshooting

### Common Issues

**Issue: Cannot connect to database**
```bash
# Check DATABASE_URL format
echo $DATABASE_URL
# Should be: postgresql://username:password@host:port/database

# Test connection
psql $DATABASE_URL
```

**Issue: Cohere API errors**
```bash
# Verify API key
echo $COHERE_API_KEY

# Test API key
curl -X POST https://api.cohere.ai/v1/generate \
  -H "Authorization: Bearer $COHERE_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"prompt":"test","max_tokens":10}'
```

**Issue: Kubernetes pods not starting**
```bash
# Check pod status
kubectl get pods -l app.kubernetes.io/instance=todo-app

# View pod logs
kubectl logs <pod-name>

# Describe pod for events
kubectl describe pod <pod-name>
```

For comprehensive troubleshooting, see:
- `docs/deployment/TROUBLESHOOTING.md` - Complete debugging guide
- `docs/deployment/AI_TOOLS_GUIDE.md` - AI-powered troubleshooting

## Documentation

### Deployment Documentation
- **Quick Start**: `specs/001-k8s-deployment/quickstart.md`
- **Infrastructure Guide**: `infra/README.md`
- **Minikube Setup**: `docs/deployment/MINIKUBE_SETUP.md`
- **AI Tools Guide**: `docs/deployment/AI_TOOLS_GUIDE.md`
- **Troubleshooting**: `docs/deployment/TROUBLESHOOTING.md`

### Specification Documents
- **Feature Spec**: `specs/001-k8s-deployment/spec.md`
- **Implementation Plan**: `specs/001-k8s-deployment/plan.md`
- **Task List**: `specs/001-k8s-deployment/tasks.md`

## Contributing

### Development Workflow

1. Create a feature branch
2. Make changes
3. Run tests and linting
4. Commit with descriptive messages
5. Push and create pull request

### Commit Message Format

```
<type>: <description>

[optional body]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

## License

[Specify your license here]

## Support

For issues and questions:
- Review documentation in `docs/` directory
- Check troubleshooting guide
- Review AI tools guide for AI-powered debugging

## Acknowledgments

- **Next.js** - React framework
- **FastAPI** - Python web framework
- **Cohere** - AI language model
- **Better Auth** - Authentication library
- **Kubernetes** - Container orchestration
- **Helm** - Kubernetes package manager
- **Minikube** - Local Kubernetes cluster

## Project Status

### Phase III: Core Application ✅
- User authentication
- Task management
- AI chatbot integration
- Responsive UI

### Phase IV: Kubernetes Deployment ✅
- Docker containerization
- Helm chart deployment
- Minikube local cluster
- AI-powered DevOps tools
- Production-ready infrastructure
- Comprehensive documentation

## Quick Reference

### Start Local Development
```bash
# Backend
cd backend && uvicorn main:app --reload

# Frontend
cd frontend && npm run dev
```

### Start Kubernetes Deployment
```bash
# Setup and deploy
./infra/k8s/minikube/setup.sh
./infra/scripts/build-images.sh
./infra/scripts/load-images.sh
./infra/scripts/deploy.sh

# Access at http://todo.local
```

### Useful Commands
```bash
# Kubernetes status
kubectl get all -l app.kubernetes.io/instance=todo-app

# View logs
kubectl logs -l app.kubernetes.io/component=backend -f

# Resource usage
kubectl top pods -l app.kubernetes.io/instance=todo-app

# Restart deployment
kubectl rollout restart deployment todo-app-backend
```

---

**Built with ❤️ using AI-powered DevOps tools**
