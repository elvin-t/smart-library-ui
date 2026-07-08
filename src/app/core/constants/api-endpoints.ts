export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register'
  },

  USERS: {
    BASE: '/api/users'
  },

  BOOKS: {
    BASE: '/api/books',
    SEARCH: '/api/books/search',
    AVAILABLE: '/api/books/available'
  },

  INVENTORY: {
    BASE: '/api/books/inventory',
    LOW_STOCK: '/api/books/inventory/low-stock',
    UNAVAILABLE: '/api/books/inventory/unavailable'
  },

  BORROW: {
    BASE: '/api/borrow-records'
  },

  NOTIFICATIONS: {
    BASE: '/api/notifications'
  }
};
