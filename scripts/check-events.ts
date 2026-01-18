// Check what event types are in the database
import { db } from '../db';
import { satsangEvents } from '../db/schema';
import { sql } from 'drizzle-orm';

async function checkEvents() {
  console.log('🔍 Checking event types in database...\n');

  try {
    // Get all distinct event types
    const types = await db.execute(sql`
      SELECT DISTINCT event_type, COUNT(*) as count 
      FROM satsang_events 
      GROUP BY event_type
    `);

    console.log('📊 Event Types Found:');
    console.log('─────────────────────────────────────');
    types.rows.forEach((row: any) => {
      console.log(`   ${row.event_type}: ${row.count} events`);
    });
    console.log('─────────────────────────────────────\n');

    // Get sample events
    const allEvents = await db.select().from(satsangEvents).limit(5);
    
    console.log('📋 Sample Events:');
    console.log('─────────────────────────────────────');
    allEvents.forEach((event) => {
      console.log(`   Type: "${event.eventType}" | Name: ${event.eventName}`);
    });
    console.log('─────────────────────────────────────\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }

  process.exit(0);
}

checkEvents();
