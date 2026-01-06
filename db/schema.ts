import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  boolean,
  timestamp,
  date,
  index,
  unique,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Places Table
export const places = pgTable('places', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  contactPerson: varchar('contact_person', { length: 100 }),
  address: text('address'),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Sadhaks Table
export const sadhaks = pgTable(
  'sadhaks',
  {
    id: serial('id').primaryKey(),
    placeId: integer('place_id')
      .notNull()
      .references(() => places.id, { onDelete: 'cascade' }),
    serialNumber: integer('serial_number'),
    name: varchar('name', { length: 100 }).notNull(),
    age: integer('age'),
    lastHaridwarYear: integer('last_haridwar_year'),
    otherLocation: varchar('other_location', { length: 100 }),
    dikshitYear: integer('dikshit_year'),
    dikshitBy: varchar('dikshit_by', { length: 200 })
      .default('डॉ. श्री विश्वामित्र जी महाराज')
      .notNull(),
    isFirstEntry: boolean('is_first_entry').default(false).notNull(),
    relationship: varchar('relationship', { length: 50 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    placeIdIdx: index('sadhaks_place_id_idx').on(table.placeId),
  })
);

// Satsang Events Table
export const satsangEvents = pgTable('satsang_events', {
  id: serial('id').primaryKey(),
  eventName: varchar('event_name', { length: 200 }).notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  location: varchar('location', { length: 100 }).notNull(),
  organizerName: varchar('organizer_name', { length: 100 }),
  organizerAddress: text('organizer_address'),
  organizerPhone: varchar('organizer_phone', { length: 20 }),
  organizerEmail: varchar('organizer_email', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Registrations Table
export const registrations = pgTable(
  'registrations',
  {
    id: serial('id').primaryKey(),
    eventId: integer('event_id')
      .notNull()
      .references(() => satsangEvents.id, { onDelete: 'cascade' }),
    sadhakId: integer('sadhak_id')
      .notNull()
      .references(() => sadhaks.id, { onDelete: 'cascade' }),
    registrationDate: timestamp('registration_date').defaultNow().notNull(),
    status: varchar('status', { length: 20 }).default('pending').notNull(),
  },
  (table) => ({
    eventIdIdx: index('registrations_event_id_idx').on(table.eventId),
    sadhakIdIdx: index('registrations_sadhak_id_idx').on(table.sadhakId),
    uniqueEventSadhak: unique('unique_event_sadhak').on(table.eventId, table.sadhakId),
  })
);

// Relations
export const placesRelations = relations(places, ({ many }) => ({
  sadhaks: many(sadhaks),
}));

export const sadhaksRelations = relations(sadhaks, ({ one, many }) => ({
  place: one(places, {
    fields: [sadhaks.placeId],
    references: [places.id],
  }),
  registrations: many(registrations),
}));

export const satsangEventsRelations = relations(satsangEvents, ({ many }) => ({
  registrations: many(registrations),
}));

export const registrationsRelations = relations(registrations, ({ one }) => ({
  event: one(satsangEvents, {
    fields: [registrations.eventId],
    references: [satsangEvents.id],
  }),
  sadhak: one(sadhaks, {
    fields: [registrations.sadhakId],
    references: [sadhaks.id],
  }),
}));

// Types
export type Place = typeof places.$inferSelect;
export type NewPlace = typeof places.$inferInsert;

export type Sadhak = typeof sadhaks.$inferSelect;
export type NewSadhak = typeof sadhaks.$inferInsert;

export type SatsangEvent = typeof satsangEvents.$inferSelect;
export type NewSatsangEvent = typeof satsangEvents.$inferInsert;

export type Registration = typeof registrations.$inferSelect;
export type NewRegistration = typeof registrations.$inferInsert;