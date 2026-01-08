# 🚀 Complete Setup Guide - साधना सत्संग Portal

**श्री राम जय राम जय जय राम** 🙏

---

## ✅ **What's New in Latest Update**

### **1. Next.js 15.1.3 with Turbopack** ⚡
- Latest stable version
- Faster development builds
- Improved performance

### **2. Phone Number Field** 📞
- Added to sadhak form
- Shows in sadhaks list
- Stored in database

### **3. Event Type System** 🎯
- **साधना सत्संग** - Regular Sadhna events
- **खुले सत्संग** - Open satsang events
- Separate filtering and management

### **4. 4-Step Registration Flow** 📝
```
Step 1: Choose Type (साधना/खुला)
   ↓
Step 2: Select Satsang
   ↓
Step 3: Select Place
   ↓
Step 4: Add Sadhaks
```

---

## 🔧 **Complete Setup Instructions**

### **Step 1: Pull Latest Code**

```bash
cd sadhana-satsang-portal
git pull origin main
```

### **Step 2: Clean Install**

```bash
# Windows
rmdir /s /q node_modules
del package-lock.json

# Mac/Linux
rm -rf node_modules package-lock.json

# Clean npm cache
npm cache clean --force

# Install with legacy peer deps
npm install --legacy-peer-deps
```

### **Step 3: Update Database Schema**

```bash
# Connect to PostgreSQL
psql -U postgres

# Connect to database
\c satsang_db

# Add event_type column
ALTER TABLE satsang_events ADD COLUMN IF NOT EXISTS event_type VARCHAR(50) NOT NULL DEFAULT 'साधना';

# Add phone column to sadhaks
ALTER TABLE sadhaks ADD COLUMN IF NOT EXISTS phone VARCHAR(50);

# Add event_id column to sadhaks (if not exists)
ALTER TABLE sadhaks ADD COLUMN IF NOT EXISTS event_id INTEGER REFERENCES satsang_events(id) ON DELETE SET NULL;

# Create index
CREATE INDEX IF NOT EXISTS sadhaks_event_id_idx ON sadhaks(event_id);

# Verify changes
\d satsang_events
\d sadhaks

# Exit
\q
```

### **Step 4: Seed Sadhna Satsang Data**

```bash
# Connect to database
psql -U postgres -d satsang_db

# Run the seed file
\i db/migrations/add_event_type_and_seed.sql

# Or manually insert:
INSERT INTO satsang_events (event_type, event_name, start_date, end_date, location, is_active) VALUES
('साधना', 'इन्दौर', '2026-01-02', '2026-01-05', 'इन्दौर', true),
('साधना', 'हाँसी', '2026-02-06', '2026-02-09', 'हाँसी', true),
('साधना', 'हरिद्वार', '2026-03-13', '2026-03-16', 'हरिद्वार', true),
('साधना', 'हरिद्वार', '2026-03-29', '2026-04-03', 'हरिद्वार', true),
('साधना', 'हरिद्वार (केवल ब्राह्मकुमारी के साधकों के लिए)', '2026-04-09', '2026-04-12', 'हरिद्वार', true),
('साधना', 'हरिद्वार (केवल ब्राह्मकुमारी के साधकों के लिए)', '2026-04-14', '2026-04-17', 'हरिद्वार', true),
('साधना', 'हरिद्वार', '2026-06-30', '2026-07-03', 'हरिद्वार', true),
('साधना', 'हरिद्वार', '2026-07-24', '2026-07-29', 'हरिद्वार', true),
('साधना', 'हरिद्वार', '2026-09-30', '2026-10-03', 'हरिद्वार', true),
('साधना', 'हरिद्वार (रामायणी)', '2026-10-11', '2026-10-20', 'हरिद्वार', true),
('साधना', 'हरिद्वार', '2026-11-11', '2026-11-14', 'हरिद्वार', true),
('साधना', 'कपूरथला (फाजिलपुर)', '2026-11-20', '2026-11-23', 'कपूरथला', true);

# Add some Khule Satsang examples
INSERT INTO satsang_events (event_type, event_name, start_date, end_date, location, is_active) VALUES
('खुला', 'पठानकोट खुला सत्संग', '2026-01-15', '2026-01-15', 'पठानकोट', true),
('खुला', 'जम्मू खुला सत्संग', '2026-02-20', '2026-02-20', 'जम्मू', true),
('खुला', 'अमृतसर खुला सत्संग', '2026-03-10', '2026-03-10', 'अमृतसर', true);

# Verify
SELECT event_type, event_name, location FROM satsang_events ORDER BY start_date;

\q
```

### **Step 5: Start Development Server**

```bash
# Start with Turbopack
npm run dev

# Server will start on http://localhost:3000
```

---

## 🎯 **Testing the New Features**

### **Test 1: Event Type Selection**

1. Go to `http://localhost:3000/registration`
2. You should see two cards:
   - 🕉️ **साधना सत्संग**
   - 🙏 **खुले सत्संग**
3. Click on **साधना सत्संग**
4. You should see 12 Sadhna events listed

### **Test 2: Complete Registration Flow**

```
Step 1: Click "साधना सत्संग"
   ↓
Step 2: Select "हरिद्वार (29 मार्च से 3 अप्रैल)"
   ↓
Step 3: Select "पठानकोट"
   ↓
Step 4: Fill form with phone number
   - नाम: श्रीमती तमन्ना
   - फोन: 9876543210
   - उम्र: 48
   ↓
Submit: साधक जोड़ें
   ↓
Success: Green toast appears
   ↓
Verify: Sadhak appears in right side list with phone number
```

### **Test 3: Phone Number Display**

1. Go to `/sadhaks` page
2. Find the sadhak you just added
3. Phone number should be visible in the table
4. Click edit icon
5. Phone number should be pre-filled in edit form

---

## 📊 **Database Verification**

```bash
# Connect to database
psql -U postgres -d satsang_db

# Check event types
SELECT event_type, COUNT(*) FROM satsang_events GROUP BY event_type;

# Should show:
# event_type | count
# -----------+-------
# साधना      |    12
# खुला       |     3

# Check sadhaks with phone
SELECT name, phone, age FROM sadhaks WHERE phone IS NOT NULL;

# Check sadhaks linked to events
SELECT s.name, e.event_name, e.event_type, p.name as place_name
FROM sadhaks s
JOIN satsang_events e ON s.event_id = e.id
JOIN places p ON s.place_id = p.id;

\q
```

---

## 🆘 **Troubleshooting**

### **Issue 1: Column already exists error**

```bash
# If you get "column already exists" error, it's okay!
# The IF NOT EXISTS clause prevents errors
# Just continue with next steps
```

### **Issue 2: Events not showing**

```bash
# Check if events are in database
psql -U postgres -d satsang_db -c "SELECT COUNT(*) FROM satsang_events WHERE is_active = true;"

# If count is 0, run the seed script again
```

### **Issue 3: Phone field not showing**

```bash
# Verify column exists
psql -U postgres -d satsang_db -c "\d sadhaks" | grep phone

# If not found, add it:
psql -U postgres -d satsang_db -c "ALTER TABLE sadhaks ADD COLUMN phone VARCHAR(50);"
```

### **Issue 4: npm install fails**

```bash
# Use legacy peer deps flag
npm install --legacy-peer-deps

# If still fails, try:
npm install --force
```

---

## 📱 **UI Screenshots**

### **Step 1: Event Type Selection**
```
┌─────────────────────────────────────────┐
│  🕉️ साधना सत्संग    🙏 खुले सत्संग    │
│  नियमित साधना        खुले सत्संग       │
│  सत्संग कार्यक्रम    कार्यक्रम         │
│  चुनें →             चुनें →            │
└─────────────────────────────────────────┘
```

### **Step 2: Satsang Selection**
```
चयनित प्रकार: 🕉️ साधना सत्संग

┌──────────────────┐ ┌──────────────────┐
│ इन्दौर           │ │ हाँसी            │
│ 📅 2-5 जनवरी     │ │ 📅 6-9 फरवरी     │
│ 📍 इन्दौर        │ │ 📍 हाँसी         │
└──────────────────┘ └──────────────────┘
```

### **Step 3: Place Selection**
```
चयनित सत्संग: हरिद्वार (29 मार्च से 3 अप्रैल)

┌──────────┐ ┌──────────┐ ┌──────────┐
│ पठानकोट  │ │ हरियाल   │ │ जम्मू    │
└──────────┘ └──────────┘ └──────────┘
```

### **Step 4: Sadhak Form**
```
प्रकार: 🕉️ साधना सत्संग
सत्संग: हरिद्वार (29 मार्च से 3 अप्रैल)
स्थान: पठानकोट

[Form Fields]
क्रमांक: 1
नाम: श्रीमती तमन्ना *
फोन: 9876543210
संबंध: पत्नी
उम्र: 48
...

[साधक जोड़ें]
```

---

## ✅ **Verification Checklist**

- [ ] Git pull successful
- [ ] npm install completed
- [ ] Database columns added
- [ ] Sadhna events seeded (12 events)
- [ ] Khule events seeded (3 events)
- [ ] Dev server started
- [ ] Step 1: Event type selection works
- [ ] Step 2: Satsang list shows
- [ ] Step 3: Place selection works
- [ ] Step 4: Form has phone field
- [ ] Sadhak submission successful
- [ ] Phone number shows in list
- [ ] Edit modal has phone field
- [ ] /sadhaks page shows phone

---

## 🎉 **Success!**

If all tests pass, your system is ready! 

**Next Steps:**
1. Add more places if needed
2. Add more Khule Satsang events
3. Start registering sadhaks
4. Generate reports (coming soon)

---

**श्री राम जय राम जय जय राम** 🙏