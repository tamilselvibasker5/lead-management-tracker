/**
 * Lead status constants.
 */
export const LEAD_STATUSES = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  RESPONDED: 'Responded',
  QUALIFIED: 'Qualified',
  PROPOSAL_SENT: 'Proposal Sent',
  WON: 'Won',
  LOST: 'Lost'
};

/**
 * Mock leads data. The `assignedTo` field references an employee user ID.
 */
const mockLeads = [
  {
    id: 'lead_001',
    name: 'Vikram Singh',
    email: 'vikram.singh@gmail.com',
    phone: '+91 98765 43210',
    status: LEAD_STATUSES.QUALIFIED,
    assignedTo: 'usr_003',
    createdAt: '2026-07-01T10:00:00Z',
    followUpDate: '2026-07-12T10:00:00Z',
    notes: 'Very interested in our premium plan.',
    activities: [
      { id: 'act_1', type: 'note', text: 'Initial contact made', date: '2026-07-01T10:05:00Z' }
    ]
  },
  {
    id: 'lead_002',
    name: 'Neha Gupta',
    email: 'neha.gupta@outlook.com',
    phone: '+91 87654 32109',
    status: LEAD_STATUSES.CONTACTED,
    assignedTo: 'usr_003',
    createdAt: '2026-07-02T11:30:00Z',
    followUpDate: '2026-07-10T14:00:00Z', // Today's follow-up
    notes: 'Asked to call back later.',
    activities: [
      { id: 'act_2', type: 'call', text: 'Called but busy. Requested callback today.', date: '2026-07-02T11:45:00Z' }
    ]
  },
  {
    id: 'lead_003',
    name: 'Arjun Reddy',
    email: 'arjun.reddy@yahoo.com',
    phone: '+91 76543 21098',
    status: LEAD_STATUSES.PROPOSAL_SENT,
    assignedTo: 'usr_004',
    createdAt: '2026-07-02T14:15:00Z',
    followUpDate: '2026-07-15T09:00:00Z',
    notes: 'Sent proposal for basic tier.',
    activities: []
  },
  {
    id: 'lead_004',
    name: 'Sneha Iyer',
    email: 'sneha.iyer@gmail.com',
    phone: '+91 65432 10987',
    status: LEAD_STATUSES.NEW,
    assignedTo: null,
    createdAt: '2026-07-03T09:00:00Z',
    followUpDate: null,
    notes: '',
    activities: []
  },
  {
    id: 'lead_005',
    name: 'Rohit Mehta',
    email: 'rohit.mehta@company.co',
    phone: '+91 54321 09876',
    status: LEAD_STATUSES.WON,
    assignedTo: 'usr_004',
    createdAt: '2026-07-03T16:45:00Z',
    followUpDate: null,
    notes: 'Signed contract on July 8.',
    activities: [
      { id: 'act_3', type: 'meeting', text: 'Contract signed in person', date: '2026-07-08T11:00:00Z' }
    ]
  },
  {
    id: 'lead_006',
    name: 'Kavya Nair',
    email: 'kavya.nair@gmail.com',
    phone: '+91 43210 98765',
    status: LEAD_STATUSES.NEW,
    assignedTo: 'usr_003',
    createdAt: '2026-07-04T08:20:00Z',
    followUpDate: null,
    notes: '',
    activities: []
  },
  {
    id: 'lead_007',
    name: 'Deepak Joshi',
    email: 'deepak.joshi@proton.me',
    phone: '+91 32109 87654',
    status: LEAD_STATUSES.LOST,
    assignedTo: 'usr_003',
    createdAt: '2026-07-05T12:00:00Z',
    followUpDate: null,
    notes: 'Too expensive for their budget.',
    activities: [
      { id: 'act_4', type: 'email', text: 'Sent pricing list', date: '2026-07-05T12:30:00Z' },
      { id: 'act_5', type: 'email', text: 'Replied saying out of budget', date: '2026-07-06T09:15:00Z' }
    ]
  },
  {
    id: 'lead_008',
    name: 'Ananya Das',
    email: 'ananya.das@gmail.com',
    phone: '+91 21098 76543',
    status: LEAD_STATUSES.NEW,
    assignedTo: null,
    createdAt: '2026-07-06T10:30:00Z',
    followUpDate: null,
    notes: '',
    activities: []
  },
  {
    id: 'lead_009',
    name: 'Siddharth Rao',
    email: 'sid.rao@hotmail.com',
    phone: '+91 10987 65432',
    status: LEAD_STATUSES.CONTACTED,
    assignedTo: 'usr_004',
    createdAt: '2026-07-07T15:10:00Z',
    followUpDate: '2026-07-11T10:00:00Z',
    notes: 'Follow up next week.',
    activities: []
  },
  {
    id: 'lead_010',
    name: 'Meera Kapoor',
    email: 'meera.kapoor@gmail.com',
    phone: '+91 99887 76655',
    status: LEAD_STATUSES.NEW,
    assignedTo: 'usr_003',
    createdAt: '2026-07-08T09:45:00Z',
    followUpDate: null,
    notes: '',
    activities: []
  },
];

export default mockLeads;
