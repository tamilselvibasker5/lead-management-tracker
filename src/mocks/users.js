import { ROLES } from '../utils/roles';

/**
 * Mock users for development. Each has an email/password you can type into
 * the login form, plus a role that drives the RBAC system.
 */
const mockUsers = [
  {
    id: 'usr_001',
    name: 'Priya Sharma',
    email: 'admin@leadtracker.com',
    password: 'admin123',
    role: ROLES.ADMIN,
    avatar: null,
  },
  {
    id: 'usr_002',
    name: 'Amit Patel',
    email: 'employee@leadtracker.com',
    password: 'emp123',
    role: ROLES.EMPLOYEE,
    avatar: null,
  },
];

export default mockUsers;
