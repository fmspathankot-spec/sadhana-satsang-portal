# 🙏 श्री राम शरणम् - साधना सत्संग प्रबंधन प्रणाली

साधना सत्संग के लिए साधकों का डिजिटल प्रबंधन प्रणाली। यह वेब एप्लिकेशन साधकों की जानकारी, स्थान प्रबंधन, सत्संग कार्यक्रम और रिपोर्ट जनरेशन के लिए बनाया गया है।

## ✨ Features

- 👥 **साधक प्रबंधन** - साधकों की पूरी जानकारी और रिकॉर्ड
- 📍 **स्थान प्रबंधन** - विभिन्न स्थानों का प्रबंधन
- 📅 **सत्संग कार्यक्रम** - आगामी सत्संग की योजना और पंजीकरण
- 📊 **रिपोर्ट जनरेशन** - PDF और Excel में रिपोर्ट डाउनलोड
- 🔍 **खोज और फ़िल्टर** - आसान खोज सुविधा
- 📱 **Responsive Design** - मोबाइल और डेस्कटॉप दोनों के लिए

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Validation**: Zod
- **Forms**: React Hook Form
- **UI Components**: Lucide Icons, Sonner (Toast)
- **Reports**: jsPDF, xlsx
- **Containerization**: Docker, Docker Compose

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose
- Git

## 🚀 Quick Start

### Option 1: Using Docker (Recommended)

```bash
# Clone repository
git clone https://github.com/fmspathankot-spec/sadhana-satsang-portal.git
cd sadhana-satsang-portal

# Copy environment file
cp .env.example .env

# Start with Docker Compose
docker-compose up -d

# Run migrations
docker-compose exec app npm run db:push

# Access application
# http://localhost:3000
```

### Option 2: Local Development

```bash
# Clone repository
git clone https://github.com/fmspathankot-spec/sadhana-satsang-portal.git
cd sadhana-satsang-portal

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run PostgreSQL (if not using Docker)
# Make sure PostgreSQL is running on localhost:5432

# Generate database schema
npm run db:generate

# Push schema to database
npm run db:push

# Start development server
npm run dev

# Access application
# http://localhost:3000
```

## 📁 Project Structure

```
sadhana-satsang-portal/
├── app/                      # Next.js App Router
│   ├── api/                  # API Routes
│   │   ├── places/          # Places endpoints
│   │   ├── sadhaks/         # Sadhaks endpoints
│   │   ├── events/          # Events endpoints
│   │   └── reports/         # Reports endpoints
│   ├── places/              # Places pages
│   ├── sadhaks/             # Sadhaks pages
│   ├── events/              # Events pages
│   ├── reports/             # Reports pages
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Dashboard
├── components/              # React components
│   ├── layout/             # Layout components
│   ├── forms/              # Form components
│   ├── tables/             # Table components
│   └── dashboard/          # Dashboard components
├── db/                      # Database
│   ├── schema.ts           # Drizzle schema
│   ├── index.ts            # DB connection
│   └── migrations/         # Migration files
├── lib/                     # Utilities
│   ├── validations/        # Zod schemas
│   └── utils.ts            # Helper functions
├── public/                  # Static files
├── docs/                    # Documentation
├── .env.example            # Environment template
├── docker-compose.yml      # Docker Compose config
├── Dockerfile              # Docker image config
├── drizzle.config.ts       # Drizzle configuration
├── package.json            # Dependencies
└── README.md               # This file
```

## 🗄️ Database Schema

### Tables

1. **places** - स्थानों की जानकारी
2. **sadhaks** - साधकों की जानकारी
3. **satsang_events** - सत्संग कार्यक्रम
4. **registrations** - साधकों का पंजीकरण

### Relationships

- One Place → Many Sadhaks
- One Sadhak → Many Registrations
- One Event → Many Registrations

## 🔧 Environment Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/satsang_db"

# App
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start dev server

# Database
npm run db:generate      # Generate migrations
npm run db:push          # Push schema to DB
npm run db:studio        # Open Drizzle Studio

# Production
npm run build            # Build for production
npm run start            # Start production server

# Docker
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # View logs
```

## 🐳 Docker Services

- **app** - Next.js application (Port 3000)
- **postgres** - PostgreSQL database (Port 5432)
- **pgadmin** - Database GUI (Port 5050)

## 📊 API Endpoints

### Sadhaks
- `GET /api/sadhaks` - Get all sadhaks
- `POST /api/sadhaks` - Create new sadhak
- `GET /api/sadhaks/:id` - Get sadhak by ID
- `PATCH /api/sadhaks/:id` - Update sadhak
- `DELETE /api/sadhaks/:id` - Delete sadhak

### Places
- `GET /api/places` - Get all places
- `POST /api/places` - Create new place
- `GET /api/places/:id` - Get place by ID
- `PATCH /api/places/:id` - Update place
- `DELETE /api/places/:id` - Delete place

### Events
- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `GET /api/events/:id` - Get event by ID
- `PATCH /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Reports
- `GET /api/reports` - Generate report data

## 🎨 UI Components

- **Dashboard** - Overview with stats
- **Sadhaks List** - Searchable table with filters
- **Sadhak Form** - Add/Edit sadhak
- **Places Grid** - Card-based place view
- **Reports** - PDF/Excel generation

## 🔐 Security

- Input validation with Zod
- SQL injection prevention with Drizzle ORM
- Environment variables for sensitive data
- CORS configuration

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
```

### Docker Production

```bash
# Build production image
docker build -t sadhana-satsang-portal .

# Run container
docker run -p 3000:3000 --env-file .env sadhana-satsang-portal
```

## 📖 Documentation

- [Installation Guide](./docs/INSTALLATION.md)
- [User Guide](./docs/USER_GUIDE.md)
- [API Documentation](./docs/API.md)
- [Database Schema](./docs/DATABASE.md)
- [Docker Guide](./docs/DOCKER.md)

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) file.

## 👨‍💻 Developer

**Dr. Rajan Maini**
- Email: shreeramsharnampathankot@gmail.com
- Phone: 0186-2224242, 9872035936
- Location: Kali Mata Mandir Road, Pathankot

## 🙏 Acknowledgments

- श्री राम शरणम् पठानकोट परिवार
- डॉ. श्री विश्वामित्र जी महाराज

---

**श्री राम जय राम जय जय राम** 🙏