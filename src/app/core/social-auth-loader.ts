/**
 * Dynamically loads Google and Facebook SDKs on demand.
 * Removes them from index.html to avoid third-party cookies
 * and network overhead on every page load.
 */

declare const google: any;
declare const FB: any;

const SDK_CACHE = new Map<string, Promise<void>>();

export function loadGoogleSdk(): Promise<void> {
  if (typeof google !== 'undefined' && google?.accounts) {
    return Promise.resolve();
  }

  if (SDK_CACHE.has('google')) {
    return SDK_CACHE.get('google')!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Google SDK'));
    document.head.appendChild(script);
  });

  SDK_CACHE.set('google', promise);
  return promise;
}

export function loadFacebookSdk(): Promise<void> {
  if (typeof FB !== 'undefined') {
    return Promise.resolve();
  }

  if (SDK_CACHE.has('facebook')) {
    return SDK_CACHE.get('facebook')!;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Facebook SDK'));
    document.head.appendChild(script);
  });

  SDK_CACHE.set('facebook', promise);
  return promise;
}
