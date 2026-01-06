# 🚀 Quick Start Guide

## श्री राम! 🙏

Welcome to Sadhana Satsang Portal! This guide will help you get started quickly.

## 🎯 What You'll Build

A complete web application for managing:
- साधकों की जानकारी (Sadhak Information)
- स्थान प्रबंधन (Place Management)
- सत्संग कार्यक्रम (Satsang Events)
- रिपोर्ट जनरेशन (Report Generation)

## ⚡ 5-Minute Setup

### Step 1: Clone & Install

```bash
# Clone the repository
git clone https://github.com/fmspathankot-spec/sadhana-satsang-portal.git
cd sadhana-satsang-portal

# Copy environment file
cp .env.example .env
```

### Step 2: Start with Docker

```bash
# Start all services (PostgreSQL + App)
docker-compose up -d

# Wait for services to start (30 seconds)
# Check status
docker-compose ps
```

### Step 3: Setup Database

```bash
# Run database migrations
docker-compose exec app npm run db:push

# (Optional) Open PgAdmin at http://localhost:5050
# Email: admin@satsang.com
# Password: admin123
```

### Step 4: Access Application

Open your browser: **http://localhost:3000**

You should see the dashboard! 🎉

## 📱 First Steps in the App

### 1. Add a Place (स्थान जोड़ें)

1. Click **स्थान** in sidebar
2. Click **नया स्थान जोड़ें**
3. Fill in:
   - Name: पठानकोट
   - Contact: डॉ. राजन मनी
   - Phone: 9872035936
4. Click **सहेजें**

### 2. Add a Sadhak (साधक जोड़ें)

1. Click **साधक** in sidebar
2. Click **नया साधक जोड़ें**
3. Fill in the form
4. Click **सहेजें**

### 3. Generate Report (रिपोर्ट बनाएं)

1. Click **रिपोर्ट** in sidebar
2. Select filters (optional)
3. Click **PDF डाउनलोड करें** or **Excel डाउनलोड करें**

## 🛠️ Development Mode

If you want to develop/modify the code:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## 📊 Database Management

### Using PgAdmin (GUI)

1. Open http://localhost:5050
2. Login with:
   - Email: admin@satsang.com
   - Password: admin123
3. Add server:
   - Host: postgres
   - Port: 5432
   - Username: postgres
   - Password: postgres
   - Database: satsang_db

### Using Drizzle Studio

```bash
npm run db:studio
```

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
# Stop the service using port 3000
lsof -i :3000
kill -9 <PID>

# Or change port in docker-compose.yml
```

### Database Connection Error

```bash
# Restart services
docker-compose restart

# Check logs
docker-compose logs postgres
```

### Reset Everything

```bash
# Stop and remove all data
docker-compose down -v

# Start fresh
docker-compose up -d
docker-compose exec app npm run db:push
```

## 📚 Next Steps

- Read [Full Documentation](./docs/INSTALLATION.md)
- Check [API Documentation](./docs/API.md)
- Review [Docker Guide](./docs/DOCKER.md)
- Explore [Database Schema](./docs/DATABASE.md)

## 💡 Tips

1. **Backup Data**: Use PgAdmin to export database regularly
2. **Environment Variables**: Never commit `.env` file
3. **Docker Logs**: Use `docker-compose logs -f` to debug
4. **Database Studio**: Use `npm run db:studio` for visual DB management

## 🆘 Need Help?

- Email: shreeramsharnampathankot@gmail.com
- Phone: 0186-2224242, 9872035936
- GitHub Issues: [Create an issue](https://github.com/fmspathankot-spec/sadhana-satsang-portal/issues)

---

**श्री राम जय राम जय जय राम** 🙏