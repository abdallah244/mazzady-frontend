// Production environment configuration
export const environment = {
  production: true,
  apiUrl: 'https://mazzady-backend-6e70bb7a3b34.herokuapp.com',
  frontendUrl: 'https://mazzady.vercel.app',

  // Google OAuth
  googleClientId: '334129382230-ngs2m2rhh5t2ripbgejpu3lq6j5hjvdn.apps.googleusercontent.com',

  // Facebook OAuth
  facebookAppId: '946975937863038',

  // WebSocket configuration
  wsUrl: 'wss://mazzady-backend-6e70bb7a3b34.herokuapp.com',

  // Feature flags
  enableDebugMode: false,
  enableConsoleLog: false,
};
