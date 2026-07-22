import User from './models/User.js';
import Lead from './models/Lead.js';

export const seedDatabase = async () => {
  try {
    const employeesToUpsert = [
      {
        id: 'usr_001',
        name: 'Priya Sharma',
        email: 'admin@leadtracker.com',
        password: 'admin123',
        role: 'admin',
        phone: '+91 98765 43210',
        location: 'Mumbai, Maharashtra',
      },
      {
        id: 'usr_002',
        name: 'Employee Account',
        email: 'employee@leadtracker.com',
        password: 'emp123',
        role: 'employee',
        phone: '+91 98765 00000',
        location: 'Delhi, NCR',
      },
      {
        id: 'usr_003',
        name: 'Amit Patel',
        email: 'amit.patel@leadtracker.com',
        password: 'emp123',
        role: 'employee',
        phone: '+91 98765 11111',
        location: 'Mumbai, Maharashtra',
      },
      {
        id: 'usr_004',
        name: 'Sunita Verma',
        email: 'sunita.verma@leadtracker.com',
        password: 'emp123',
        role: 'employee',
        phone: '+91 98765 22222',
        location: 'Delhi, NCR',
      },
      {
        id: 'usr_005',
        name: 'Karan Malhotra',
        email: 'karan.m@leadtracker.com',
        password: 'emp123',
        role: 'employee',
        phone: '+91 98765 33333',
        location: 'Bangalore, Karnataka',
      },
      {
        id: 'usr_006',
        name: 'Divya Agarwal',
        email: 'divya.a@leadtracker.com',
        password: 'emp123',
        role: 'employee',
        phone: '+91 98765 44444',
        location: 'Hyderabad, Telangana',
      },
      {
        id: 'usr_007',
        name: 'Tamilvanan',
        email: 'tamilvanan@leadtracker.com',
        password: 'emp123',
        role: 'employee',
        phone: '+91 98765 55555',
        location: 'Chennai, Tamil Nadu',
      },
      {
        id: 'usr_008',
        name: 'Tamilnadu Employee',
        email: 'tamilnadu@leadtracker.com',
        password: 'emp123',
        role: 'employee',
        phone: '+91 98765 66666',
        location: 'Tamil Nadu',
      },
    ];

    for (const emp of employeesToUpsert) {
      await User.findOneAndUpdate({ email: emp.email }, emp, { upsert: true });
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
        {
          id: 'lead_102',
          platform: 'Google Search',
          name: 'Ananya Roy',
          email: 'ananya.roy@example.com',
          phone: '+91 98300 23456',
          location: 'Kolkata',
          assignedTo: 'Neha Gupta',
          assignedToRaw: 'emp_002',
          status: 'Contacted',
          callCount: 2,
          followUpDate: new Date(Date.now() + 172800000).toISOString().split('T')[0],
          notes: 'Requested product catalog and pricing sheet.',
          activities: [
            {
              id: 'act_102',
              type: 'call',
              note: 'Called customer, shared brochure via email.',
              authorName: 'Neha Gupta',
              timestamp: new Date().toISOString(),
            },
          ],
        },
        {
          id: 'lead_103',
          platform: 'LinkedIn',
          name: 'Rahul Kapoor',
          email: 'rahul.k@example.com',
          phone: '+91 98100 34567',
          location: 'Delhi',
          assignedTo: 'Rohan Verma',
          assignedToRaw: 'emp_003',
          status: 'Qualified',
          callCount: 3,
          followUpDate: new Date(Date.now() + 259200000).toISOString().split('T')[0],
          notes: 'High intent buyer — scheduling demo.',
          activities: [],
        },
      ];
      await Lead.insertMany(sampleLeads);
      console.log('[Seed] Leads seeded successfully.');
    }
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
  }
};
