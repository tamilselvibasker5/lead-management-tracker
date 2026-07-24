import User from './models/User.js';
import Lead from './models/Lead.js';

export const seedDatabase = async () => {
  try {
    // Backfill any existing MongoDB documents missing the language property
    await User.updateMany(
      { $or: [{ language: { $exists: false } }, { language: null }, { language: '' }] },
      { $set: { language: 'English' } }
    );

    const employeesToUpsert = [
      {
        id: 'usr_001',
        name: 'Priya Sharma',
        email: 'admin@leadtracker.com',
        password: 'admin123',
        role: 'admin',
        phone: '+91 98765 43210',
        location: 'Mumbai, Maharashtra',
        language: 'English, Hindi, Marathi',
      },
      {
        id: 'usr_002',
        name: 'Employee Account',
        email: 'employee@leadtracker.com',
        password: 'emp123',
        role: 'employee',
        phone: '+91 98765 00000',
        location: 'Delhi, NCR',
        language: 'English, Hindi',
      },
      {
        id: 'usr_003',
        name: 'Amit Patel',
        email: 'amit.patel@leadtracker.com',
        password: 'emp123',
        role: 'employee',
        phone: '+91 98765 11111',
        location: 'Mumbai, Maharashtra',
        language: 'English, Gujarati, Marathi',
      },
      {
        id: 'usr_004',
        name: 'Sunita Verma',
        email: 'sunita.verma@leadtracker.com',
        password: 'emp123',
        role: 'employee',
        phone: '+91 98765 22222',
        location: 'Delhi, NCR',
        language: 'English, Hindi',
      },
      {
        id: 'usr_005',
        name: 'Karan Malhotra',
        email: 'karan.m@leadtracker.com',
        password: 'emp123',
        role: 'employee',
        phone: '+91 98765 33333',
        location: 'Bangalore, Karnataka',
        language: 'English, Kannada',
      },
      {
        id: 'usr_006',
        name: 'Divya Agarwal',
        email: 'divya.a@leadtracker.com',
        password: 'emp123',
        role: 'employee',
        phone: '+91 98765 44444',
        location: 'Hyderabad, Telangana',
        language: 'English, Telugu',
      },
      {
        id: 'usr_007',
        name: 'Tamilvanan',
        email: 'tamilvanan@leadtracker.com',
        password: 'emp123',
        role: 'employee',
        phone: '+91 98765 55555',
        location: 'Chennai, Tamil Nadu',
        language: 'English, Tamil',
      },
      {
        id: 'usr_008',
        name: 'Tamilnadu Employee',
        email: 'tamilnadu@leadtracker.com',
        password: 'emp123',
        role: 'employee',
        phone: '+91 98765 66666',
        location: 'Tamil Nadu',
        language: 'Tamil, English',
      },
    ];

    for (const emp of employeesToUpsert) {
      await User.findOneAndUpdate({ email: emp.email }, emp, { upsert: true, new: true });
    }
    console.log('[Seed] Employees seeded/updated in MongoDB Atlas successfully.');

    const leadCount = await Lead.countDocuments();
    if (leadCount === 0) {
      console.log('[Seed] Populating initial leads into MongoDB...');
      const sampleLeads = [
        {
          id: 'lead_101',
          platform: 'Facebook Ads',
          name: 'Vikram Singh',
          email: 'vikram.singh@example.com',
          phone: '+91 98200 12345',
          location: 'Mumbai',
          assignedTo: 'Amit Patel',
          assignedToRaw: 'usr_002',
          status: 'New',
          callCount: 1,
          followUpDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          notes: 'Interested in enterprise plan.',
          activities: [
            {
              id: 'act_101',
              type: 'note',
              note: 'Initial inquiry received via Facebook Ads campaign.',
              authorName: 'System',
              timestamp: new Date().toISOString(),
            },
          ],
        },
      ];
      await Lead.insertMany(sampleLeads);
      console.log('[Seed] Leads seeded successfully.');
    }
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
  }
};
