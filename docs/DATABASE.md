# 🗄️ Database Schema Documentation

## Overview

The database consists of 4 main tables with relationships to manage sadhaks, places, events, and registrations.

## Entity Relationship Diagram

```
┌─────────────┐         ┌──────────────┐
│   places    │────────<│   sadhaks    │
└─────────────┘         └──────────────┘
                               │
                               │
                               ▼
                        ┌──────────────────┐
                        │  registrations   │
                        └──────────────────┘
                               │
                               │
                               ▼
                        ┌──────────────────┐
                        │ satsang_events   │
                        └──────────────────┘
```

## Tables

### 1. places (स्थान)

Stores information about different locations.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| name | VARCHAR(100) | NOT NULL | Place name (e.g., पठानकोट) |
| contact_person | VARCHAR(100) | | Contact person name |
| address | TEXT | | Full address |
| phone | VARCHAR(20) | | Phone number |
| email | VARCHAR(100) | | Email address |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- Primary key on `id`

**Example:**
```sql
INSERT INTO places (name, contact_person, phone, email) 
VALUES ('पठानकोट', 'डॉ. राजन मनी', '9872035936', 'shreeramsharnampathankot@gmail.com');
```

---

### 2. sadhaks (साधक)

Stores information about individual sadhaks.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| place_id | INTEGER | FOREIGN KEY → places(id) | Reference to place |
| serial_number | INTEGER | | Serial number within place |
| name | VARCHAR(100) | NOT NULL | Sadhak name |
| age | INTEGER | | Age in years |
| last_haridwar_year | INTEGER | | Last visit year to Haridwar |
| other_location | VARCHAR(100) | | Other location visited |
| dikshit_year | INTEGER | | Year of diksha |
| dikshit_by | VARCHAR(200) | DEFAULT 'डॉ. श्री विश्वामित्र जी महाराज' | Diksha guru name |
| is_first_entry | BOOLEAN | DEFAULT FALSE | First time visitor flag |
| relationship | VARCHAR(50) | | Relationship (पति/पत्नी/etc) |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- Primary key on `id`
- Index on `place_id` for faster joins

**Constraints:**
- `place_id` references `places(id)` with CASCADE delete
- If `is_first_entry` is FALSE, `last_haridwar_year` should be provided

**Example:**
```sql
INSERT INTO sadhaks (place_id, name, age, last_haridwar_year, dikshit_year, is_first_entry) 
VALUES (1, 'श्रीमती तमन्ना', 48, 2025, 1995, FALSE);
```

---

### 3. satsang_events (सत्संग कार्यक्रम)

Stores information about satsang events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| event_name | VARCHAR(200) | NOT NULL | Event name |
| start_date | DATE | NOT NULL | Event start date |
| end_date | DATE | NOT NULL | Event end date |
| location | VARCHAR(100) | NOT NULL | Event location |
| organizer_name | VARCHAR(100) | | Organizer name |
| organizer_address | TEXT | | Organizer address |
| organizer_phone | VARCHAR(20) | | Organizer phone |
| organizer_email | VARCHAR(100) | | Organizer email |
| created_at | TIMESTAMP | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Constraints:**
- `end_date` must be >= `start_date`

**Example:**
```sql
INSERT INTO satsang_events (event_name, start_date, end_date, location) 
VALUES ('साधना सत्संग 2026', '2026-03-29', '2026-04-03', 'हरिद्वार');
```

---

### 4. registrations (पंजीकरण)

Links sadhaks to events (many-to-many relationship).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique identifier |
| event_id | INTEGER | FOREIGN KEY → satsang_events(id) | Reference to event |
| sadhak_id | INTEGER | FOREIGN KEY → sadhaks(id) | Reference to sadhak |
| registration_date | TIMESTAMP | DEFAULT NOW() | Registration timestamp |
| status | VARCHAR(20) | DEFAULT 'pending' | Status (pending/approved/rejected) |

**Indexes:**
- Primary key on `id`
- Index on `event_id` for faster event queries
- Index on `sadhak_id` for faster sadhak queries
- Unique constraint on `(event_id, sadhak_id)` to prevent duplicate registrations

**Constraints:**
- `event_id` references `satsang_events(id)` with CASCADE delete
- `sadhak_id` references `sadhaks(id)` with CASCADE delete
- Unique combination of `event_id` and `sadhak_id`

**Example:**
```sql
INSERT INTO registrations (event_id, sadhak_id, status) 
VALUES (1, 1, 'approved');
```

---

## Relationships

### One-to-Many

1. **places → sadhaks**
   - One place can have many sadhaks
   - Each sadhak belongs to one place
   - Cascade delete: Deleting a place deletes all its sadhaks

2. **sadhaks → registrations**
   - One sadhak can register for many events
   - Each registration belongs to one sadhak
   - Cascade delete: Deleting a sadhak deletes all their registrations

3. **satsang_events → registrations**
   - One event can have many registrations
   - Each registration belongs to one event
   - Cascade delete: Deleting an event deletes all its registrations

---

## Common Queries

### Get all sadhaks with their place information

```sql
SELECT 
  s.id,
  s.name,
  s.age,
  s.last_haridwar_year,
  s.is_first_entry,
  p.name as place_name
FROM sadhaks s
LEFT JOIN places p ON s.place_id = p.id
ORDER BY p.name, s.serial_number;
```

### Get sadhaks registered for a specific event

```sql
SELECT 
  s.name,
  s.age,
  p.name as place_name,
  r.status,
  r.registration_date
FROM sadhaks s
INNER JOIN registrations r ON s.id = r.sadhak_id
INNER JOIN places p ON s.place_id = p.id
WHERE r.event_id = 1
ORDER BY p.name, s.name;
```

### Count sadhaks by place

```sql
SELECT 
  p.name as place_name,
  COUNT(s.id) as sadhak_count
FROM places p
LEFT JOIN sadhaks s ON p.id = s.place_id
GROUP BY p.id, p.name
ORDER BY sadhak_count DESC;
```

### Get event statistics

```sql
SELECT 
  e.event_name,
  e.start_date,
  e.end_date,
  COUNT(r.id) as total_registrations,
  COUNT(CASE WHEN r.status = 'approved' THEN 1 END) as approved_count,
  COUNT(CASE WHEN r.status = 'pending' THEN 1 END) as pending_count
FROM satsang_events e
LEFT JOIN registrations r ON e.id = r.event_id
GROUP BY e.id, e.event_name, e.start_date, e.end_date;
```

---

## Data Validation Rules

### places
- `name`: Required, 2-100 characters
- `phone`: Optional, 10-15 digits
- `email`: Optional, valid email format

### sadhaks
- `name`: Required, 2-100 characters
- `age`: Optional, 1-120
- `place_id`: Required, must exist in places table
- `last_haridwar_year`: Required if `is_first_entry` is FALSE
- `dikshit_year`: Optional, 1950-current year

### satsang_events
- `event_name`: Required, 5-200 characters
- `start_date`: Required
- `end_date`: Required, must be >= start_date
- `location`: Required, 2-100 characters

### registrations
- `event_id`: Required, must exist in satsang_events table
- `sadhak_id`: Required, must exist in sadhaks table
- `status`: Must be one of: pending, approved, rejected
- Unique combination of event_id and sadhak_id

---

## Backup & Restore

### Backup Database

```bash
# Using Docker
docker-compose exec postgres pg_dump -U postgres satsang_db > backup.sql

# Using pg_dump directly
pg_dump -U postgres -d satsang_db > backup.sql
```

### Restore Database

```bash
# Using Docker
docker-compose exec -T postgres psql -U postgres satsang_db < backup.sql

# Using psql directly
psql -U postgres -d satsang_db < backup.sql
```

---

## Performance Optimization

### Indexes

Current indexes:
- `sadhaks_place_id_idx` on sadhaks(place_id)
- `registrations_event_id_idx` on registrations(event_id)
- `registrations_sadhak_id_idx` on registrations(sadhak_id)

### Query Optimization Tips

1. Always use indexes for foreign key lookups
2. Use `EXPLAIN ANALYZE` to check query performance
3. Avoid `SELECT *` in production queries
4. Use pagination for large result sets
5. Create composite indexes for frequently used WHERE clauses

---

## Migration History

Migrations are stored in `db/migrations/` directory.

To generate new migration:
```bash
npm run db:generate
```

To apply migrations:
```bash
npm run db:push
```

---

**श्री राम जय राम जय जय राम** 🙏