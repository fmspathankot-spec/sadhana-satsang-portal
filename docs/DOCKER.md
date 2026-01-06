# 🐳 Docker Guide

## Services

### 1. PostgreSQL Database
- **Image**: postgres:15-alpine
- **Port**: 5432
- **Volume**: postgres_data

### 2. Next.js Application
- **Port**: 3000
- **Depends on**: PostgreSQL

### 3. PgAdmin (Optional)
- **Port**: 5050
- **Credentials**: admin@satsang.com / admin123

## Commands

### Start Services
```bash
docker-compose up -d
```

### Stop Services
```bash
docker-compose down
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f postgres
```

### Restart Services
```bash
docker-compose restart
```

### Rebuild Images
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Execute Commands in Container
```bash
# Run migrations
docker-compose exec app npm run db:push

# Open shell
docker-compose exec app sh

# Database shell
docker-compose exec postgres psql -U postgres -d satsang_db
```

### Clean Up
```bash
# Stop and remove containers
docker-compose down

# Remove volumes (WARNING: Deletes data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Production Deployment

### Build Production Image
```bash
docker build -t sadhana-satsang-portal:latest .
```

### Run Production Container
```bash
docker run -d \
  --name satsang_app \
  -p 3000:3000 \
  --env-file .env \
  sadhana-satsang-portal:latest
```

### Docker Hub Push
```bash
# Tag image
docker tag sadhana-satsang-portal:latest username/sadhana-satsang-portal:latest

# Push to Docker Hub
docker push username/sadhana-satsang-portal:latest
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker-compose logs app

# Check if port is in use
lsof -i :3000

# Restart services
docker-compose restart
```

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check database logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -c "SELECT 1"
```

### Volume Issues
```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect sadhana-satsang-portal_postgres_data

# Remove volume (WARNING: Deletes data)
docker volume rm sadhana-satsang-portal_postgres_data
```