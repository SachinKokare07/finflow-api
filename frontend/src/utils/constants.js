export const API_URL = import.meta.env.VITE_API_URL || 'https://finflow-api-90cp.onrender.com';

export const ROLES = {
  viewer: 'viewer',
  analyst: 'analyst',
  admin: 'admin',
};

export const ROLE_LABELS = {
  viewer: 'Viewer',
  analyst: 'Analyst',
  admin: 'Admin',
};

export const TRANSACTION_TYPES = ['income', 'expense'];

export const CATEGORIES = [
  'salary',
  'freelance',
  'investment',
  'business',
  'rent',
  'utilities',
  'groceries',
  'transport',
  'healthcare',
  'entertainment',
  'education',
  'insurance',
  'taxes',
  'other',
];

export const TRANSACTION_TYPE_LABELS = {
  income: 'Income',
  expense: 'Expense',
};

export const NAV_ITEMS = [
  { label: 'Dashboard', to: '/app/dashboard', roles: ['analyst', 'admin'] },
  { label: 'Transactions', to: '/app/transactions', roles: ['viewer', 'analyst', 'admin'] },
  { label: 'Users', to: '/app/users', roles: ['admin'] },
  { label: 'Profile', to: '/app/profile', roles: ['viewer', 'analyst', 'admin'] },
];