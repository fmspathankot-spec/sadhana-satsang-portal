# Components Directory

This directory contains all React components organized by feature:

- `layout/` - Layout components (Sidebar, Header, Footer)
- `forms/` - Form components (SadhakForm, PlaceForm, EventForm)
- `tables/` - Table components (SadhaksTable, PlacesTable)
- `dashboard/` - Dashboard-specific components
- `ui/` - Reusable UI components (Button, Input, Card, etc.)

## Component Structure

Each component should follow this structure:

```typescript
'use client'; // If using client-side features

import { ComponentProps } from './types';

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  return (
    <div>
      {/* Component JSX */}
    </div>
  );
}
```

## Best Practices

1. Use TypeScript for all components
2. Extract reusable logic into custom hooks
3. Keep components small and focused
4. Use proper prop types
5. Add JSDoc comments for complex components