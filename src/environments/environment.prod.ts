// Production environment configuration
export const environment = {
  production: true,
  apiUrl: '/api',
  frontendUrl: 'https://mazzady.works',

  // Google OAuth
  googleClientId: '334129382230-ngs2m2rhh5t2ripbgejpu3lq6j5hjvdn.apps.googleusercontent.com',

  // Facebook OAuth
  facebookAppId: '946975937863038',

  // WebSocket configuration
  wsUrl: 'wss://mazzady-backend.onrender.com',

  // Feature flags
  enableDebugMode: false,
  enableConsoleLog: false,
};
