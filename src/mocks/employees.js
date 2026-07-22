import { ROLES } from '../utils/roles';

/**
 * Mock employees. These are the users with EMPLOYEE or ADMIN role
 * who can have leads assigned to them.
 */
const mockEmployees = [
  {
    id: 'usr_003',
    name: 'Amit Patel',
    email: 'amit.patel@leadtracker.com',
    phone: '+91 98765 11111',
    location: 'Mumbai, Maharashtra',
    role: ROLES.EMPLOYEE,
  },
  {
    id: 'usr_004',
    name: 'Sunita Verma',
    email: 'sunita.verma@leadtracker.com',
    phone: '+91 98765 22222',
    location: 'Delhi, NCR',
    role: ROLES.EMPLOYEE,
  },
  {
    id: 'usr_005',
    name: 'Karan Malhotra',
    email: 'karan.m@leadtracker.com',
    phone: '+91 98765 33333',
    location: 'Bangalore, Karnataka',
    role: ROLES.EMPLOYEE,
  },
  {
    id: 'usr_006',
    name: 'Divya Agarwal',
    email: 'divya.a@leadtracker.com',
    phone: '+91 98765 44444',
    location: 'Hyderabad, Telangana',
    role: ROLES.EMPLOYEE,
  },
  {
    id: 'usr_007',
    name: 'Tamilvanan',
    email: 'tamilvanan@leadtracker.com',
    phone: '+91 98765 55555',
    location: 'Chennai, Tamil Nadu',
    role: ROLES.EMPLOYEE,
  },
  {
    id: 'usr_008',
    name: 'Tamilnadu Employee',
    email: 'tamilnadu@leadtracker.com',
    phone: '+91 98765 66666',
    location: 'Tamil Nadu',
    role: ROLES.EMPLOYEE,
  },
];

export default mockEmployees;
