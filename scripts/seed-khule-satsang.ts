import { db } from '../db';
import { satsangEvents } from '../db/schema';
import { sql } from 'drizzle-orm';

async function seedKhuleSatsang() {
  console.log('🌱 Seeding Khule Satsang 2026 data...');

  try {
    const khuleSatsangData = [
      // 1. Jhabua
      { eventName: 'खुले सत्संग - झाबुआ', eventType: 'khule_satsang', location: 'झाबुआ', startDate: '2026-01-11', endDate: '2026-01-13' },
      
      // 2. Pune
      { eventName: 'खुले सत्संग - पुणे', eventType: 'khule_satsang', location: 'पुणे', startDate: '2026-01-17', endDate: '2026-01-17' },
      
      // 3. Pilibanga
      { eventName: 'खुले सत्संग - पीलीबंगा', eventType: 'khule_satsang', location: 'पीलीबंगा', startDate: '2026-01-18', endDate: '2026-01-19' },
      
      // 4. Banmor
      { eventName: 'खुले सत्संग - बानमोर', eventType: 'khule_satsang', location: 'बानमोर', startDate: '2026-01-22', endDate: '2026-01-22' },
      
      // 5. Bikaner
      { eventName: 'खुले सत्संग - बीकानेर', eventType: 'khule_satsang', location: 'बीकानेर', startDate: '2026-01-31', endDate: '2026-02-01' },
      
      // 6. Mumbai
      { eventName: 'खुले सत्संग - मुम्बई', eventType: 'khule_satsang', location: 'मुम्बई', startDate: '2026-02-14', endDate: '2026-02-15' },
      
      // 7. Bilaspur
      { eventName: 'खुले सत्संग - बिलासपुर', eventType: 'khule_satsang', location: 'बिलासपुर', startDate: '2026-02-20', endDate: '2026-02-22' },
      
      // 8. Batala
      { eventName: 'खुले सत्संग - बटाला', eventType: 'khule_satsang', location: 'बटाला', startDate: '2026-02-28', endDate: '2026-02-28' },
      
      // 9. Amarpatan
      { eventName: 'खुले सत्संग - अमरपाटन', eventType: 'khule_satsang', location: 'अमरपाटन', startDate: '2026-03-01', endDate: '2026-03-01' },
      
      // 10. Delhi (Holi)
      { eventName: 'खुले सत्संग - दिल्ली (होली)', eventType: 'khule_satsang', location: 'दिल्ली', startDate: '2026-03-02', endDate: '2026-03-04' },
      
      // 11. Ratangarh
      { eventName: 'खुले सत्संग - रतनगढ़', eventType: 'khule_satsang', location: 'रतनगढ़', startDate: '2026-03-07', endDate: '2026-03-08' },
      
      // 12. Jhabua (Moun Sadhana)
      { eventName: 'खुले सत्संग - झाबुआ (मौन साधना)', eventType: 'khule_satsang', location: 'झाबुआ', startDate: '2026-03-18', endDate: '2026-03-27' },
      
      // 13. Kapurthala (Fajalpur)
      { eventName: 'खुले सत्संग - कपूरथला (फाजलपुर)', eventType: 'khule_satsang', location: 'कपूरथला', startDate: '2026-03-21', endDate: '2026-03-22' },
      
      // 14. Narot Mehra
      { eventName: 'खुले सत्संग - नरोट मेहरा', eventType: 'khule_satsang', location: 'नरोट मेहरा', startDate: '2026-03-26', endDate: '2026-03-26' },
      
      // 15. Hisar
      { eventName: 'खुले सत्संग - हिसार', eventType: 'khule_satsang', location: 'हिसार', startDate: '2026-04-04', endDate: '2026-04-05' },
      
      // 16. Bhareri
      { eventName: 'खुले सत्संग - भरेड़ी', eventType: 'khule_satsang', location: 'भरेड़ी', startDate: '2026-04-19', endDate: '2026-04-19' },
      
      // 17. Mandi
      { eventName: 'खुले सत्संग - मंडी', eventType: 'khule_satsang', location: 'मंडी', startDate: '2026-04-26', endDate: '2026-04-26' },
      
      // 18. Shanaga
      { eventName: 'खुले सत्संग - शनागा', eventType: 'khule_satsang', location: 'शनागा', startDate: '2026-05-04', endDate: '2026-05-05' },
      
      // 19. Kendaghat
      { eventName: 'खुले सत्संग - केंडाघाट', eventType: 'khule_satsang', location: 'केंडाघाट', startDate: '2026-05-10', endDate: '2026-05-10' },
      
      // 20. Nepal
      { eventName: 'खुले सत्संग - नेपाल', eventType: 'khule_satsang', location: 'नेपाल', startDate: '2026-05-21', endDate: '2026-05-23' },
      
      // 21. Selsarvan (America)
      { eventName: 'खुले सत्संग - सेलसर्वन (अमेरिका)', eventType: 'khule_satsang', location: 'सेलसर्वन', startDate: '2026-05-28', endDate: '2026-05-31' },
      
      // 22. Manali
      { eventName: 'खुले सत्संग - मनाली', eventType: 'khule_satsang', location: 'मनाली', startDate: '2026-06-14', endDate: '2026-06-16' },
      
      // 23. Lote
      { eventName: 'खुले सत्संग - लोट', eventType: 'khule_satsang', location: 'लोट', startDate: '2026-06-23', endDate: '2026-06-24' },
      
      // 24. Rohatk
      { eventName: 'खुले सत्संग - रोहतक', eventType: 'khule_satsang', location: 'रोहतक', startDate: '2026-08-15', endDate: '2026-08-16' },
      
      // 25. Rewari
      { eventName: 'खुले सत्संग - रेवाड़ी', eventType: 'khule_satsang', location: 'रेवाड़ी', startDate: '2026-09-05', endDate: '2026-09-06' },
      
      // 26. Jallandhar
      { eventName: 'खुले सत्संग - जालंधर', eventType: 'khule_satsang', location: 'जालंधर', startDate: '2026-09-13', endDate: '2026-09-13' },
      
      // 27. Hiranagar
      { eventName: 'खुले सत्संग - हीरानगर', eventType: 'khule_satsang', location: 'हीरानगर', startDate: '2026-09-15', endDate: '2026-09-15' },
      
      // 28. Jammu
      { eventName: 'खुले सत्संग - जम्मू', eventType: 'khule_satsang', location: 'जम्मू', startDate: '2026-09-18', endDate: '2026-09-20' },
      
      // 29. Gurdaspur
      { eventName: 'खुले सत्संग - गुरदासपुर', eventType: 'khule_satsang', location: 'गुरदासपुर', startDate: '2026-09-25', endDate: '2026-09-27' },
      
      // 30. Hoshiarpur
      { eventName: 'खुले सत्संग - होशियारपुर', eventType: 'khule_satsang', location: 'होशियारपुर', startDate: '2026-10-04', endDate: '2026-10-04' },
      
      // 31. Sujanpur
      { eventName: 'खुले सत्संग - सुजानपुर', eventType: 'khule_satsang', location: 'सुजानपुर', startDate: '2026-10-23', endDate: '2026-10-25' },
      
      // 32. Pathankot
      { eventName: 'खुले सत्संग - पठानकोट', eventType: 'khule_satsang', location: 'पठानकोट', startDate: '2026-10-31', endDate: '2026-11-01' },
      
      // 33. Kathua
      { eventName: 'खुले सत्संग - कठुआ', eventType: 'khule_satsang', location: 'कठुआ', startDate: '2026-11-07', endDate: '2026-11-07' },
      
      // 34. Amritsar
      { eventName: 'खुले सत्संग - अमृतसर', eventType: 'khule_satsang', location: 'अमृतसर', startDate: '2026-11-15', endDate: '2026-11-15' },
      
      // 35. Melbourne (Australia)
      { eventName: 'खुले सत्संग - मेलबोर्न (आस्ट्रेलिया)', eventType: 'khule_satsang', location: 'मेलबोर्न', startDate: '2026-11-27', endDate: '2026-11-29' },
      
      // 36. Jwali
      { eventName: 'खुले सत्संग - ज्वाली', eventType: 'khule_satsang', location: 'ज्वाली', startDate: '2026-11-29', endDate: '2026-12-01' },
      
      // 37. Alampur
      { eventName: 'खुले सत्संग - आलमपुर', eventType: 'khule_satsang', location: 'आलमपुर', startDate: '2026-12-03', endDate: '2026-12-04' },
      
      // 38. Gwalior
      { eventName: 'खुले सत्संग - ग्वालियर', eventType: 'khule_satsang', location: 'ग्वालियर', startDate: '2026-12-05', endDate: '2026-12-06' },
      
      // 39. Surat
      { eventName: 'खुले सत्संग - सूरत', eventType: 'khule_satsang', location: 'सूरत', startDate: '2026-12-19', endDate: '2026-12-20' },
      
      // 40. Bhiwani
      { eventName: 'खुले सत्संग - भिवानी', eventType: 'khule_satsang', location: 'भिवानी', startDate: '2026-12-26', endDate: '2026-12-27' },
    ];

    // Insert all events
    for (const event of khuleSatsangData) {
      await db.insert(satsangEvents).values({
        eventName: event.eventName,
        eventType: event.eventType,
        location: event.location,
        startDate: new Date(event.startDate),
        endDate: new Date(event.endDate),
      });
      console.log(`✅ Added: ${event.eventName}`);
    }

    console.log('\n✅ Successfully seeded all 40 Khule Satsang events!');
    
    // Verify
    const count = await db.execute(sql`SELECT COUNT(*) as count FROM satsang_events WHERE event_type = 'khule_satsang'`);
    console.log(`\n📊 Total Khule Satsang events in database: ${count.rows[0].count}`);
    
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    throw error;
  }
}

// Run the seed function
seedKhuleSatsang()
  .then(() => {
    console.log('\n🎉 Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });