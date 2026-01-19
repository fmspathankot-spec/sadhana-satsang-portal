# PDF Header Changes

## Changes needed in `app/api/export/pdf/route.ts`:

### 1. Add event type variable (after line 56):
```typescript
// Determine event type text
const eventTypeText = event.eventType === 'sadhana' ? 'साधना' : 'खुला';
```

### 2. Update header h2 (line 209):
**OLD:**
```html
<h2>पठानकोट से साधना सत्संग में सम्मिलित होने के इच्छुक साधकों की सूची</h2>
```

**NEW:**
```html
<h2>पठानकोट से ${eventTypeText} सत्संग में सम्मिलित होने के इच्छुक साधकों की सूची</h2>
```

### 3. Update event details (line 218):
**OLD:**
```html
<td>साधना सत्संग दिनांक ${startDate} से ${endDate}</td>
```

**NEW:**
```html
<td>${eventTypeText} सत्संग दिनांक ${startDate} से ${endDate}</td>
```

### 4. Update footer CSS (line 187-192):
**OLD:**
```css
.footer {
  text-align: center;
  font-size: 15pt;
  font-weight: bold;
  margin-top: 30px;
}
```

**NEW:**
```css
.footer {
  text-align: right;
  font-size: 15pt;
  font-weight: bold;
  margin-top: 30px;
  padding-right: 20px;
}
```

## Summary:
- ✅ Event type (साधना/खुला) will show dynamically
- ✅ धन्यवाद will be right-aligned
