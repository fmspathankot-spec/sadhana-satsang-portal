# 📦 Installation Guide

## Prerequisites

- Node.js 18 or higher
- Docker & Docker Compose
- Git
- PostgreSQL (if not using Docker)

## Installation Steps

### 1. Clone Repository

```bash
git clone https://github.com/fmspathankot-spec/sadhana-satsang-portal.git
cd sadhana-satsang-portal
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Edit .env file with your configuration
nano .env
```

### 3. Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# Check if services are running
docker-compose ps

# View logs
docker-compose logs -f app

# Run database migrations
docker-compose exec app npm run db:push

# Access application at http://localhost:3000
```

### 4. Manual Installation (Without Docker)

```bash
# Install dependencies
npm install

# Setup PostgreSQL database
createdb satsang_db

# Update .env with your database URL
DATABASE_URL="postgresql://username:password@localhost:5432/satsang_db"

# Generate Drizzle schema
npm run db:generate

# Push schema to database
npm run db:push

# Start development server
npm run dev

# Access application at http://localhost:3000
```

## Verification

1. Open browser: http://localhost:3000
2. You should see the dashboard
3. Try adding a new place
4. Try adding a new sadhak

## Troubleshooting

### Port Already in Use

```bash
# Change port in docker-compose.yml
ports:
  - "3001:3000"  # Use 3001 instead of 3000
```

### Database Connection Error

```bash
# Check PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Restart services
docker-compose restart
```

### Migration Issues

```bash
# Reset database (WARNING: Deletes all data)
docker-compose down -v
docker-compose up -d
docker-compose exec app npm run db:push
```

## Next Steps

- Read [User Guide](./USER_GUIDE.md)
- Check [API Documentation](./API.md)
- Review [Database Schema](./DATABASE.md)