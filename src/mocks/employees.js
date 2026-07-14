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
    role: ROLES.EMPLOYEE,
  },
  {
    id: 'usr_004',
    name: 'Sunita Verma',
    email: 'sunita.verma@leadtracker.com',
    phone: '+91 98765 22222',
    role: ROLES.EMPLOYEE,
  },
  {
    id: 'usr_005',
    name: 'Karan Malhotra',
    email: 'karan.m@leadtracker.com',
    phone: '+91 98765 33333',
    role: ROLES.EMPLOYEE,
  },
  {
    id: 'usr_006',
    name: 'Divya Agarwal',
    email: 'divya.a@leadtracker.com',
    phone: '+91 98765 44444',
    role: ROLES.EMPLOYEE,
  },
];

export default mockEmployees;
