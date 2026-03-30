import Auth0Lock from 'auth0-lock';
import axios from 'axios';
import { useAuthStore } from '../stores/auth';

class AuthLockService {
  constructor({ router, pinia, config }) {
    this.router = router;
    this.authStore = useAuthStore(pinia);
    this.apiKey = config.apiKey;
    this.domain = config.domain;
    this.clientID = config.clientID;
    this.client = null;

    const lockOptions = {
      ...config.options,
      auth: {
        ...config.options?.auth,
        redirectUrl: this.getHost(),
      },
    };

    this.lock = new Auth0Lock(config.clientID, config.domain, lockOptions);

    this.authStore.restoreFromStorage();
    if (this.authStore.isAuthenticated) {
      this.createClient();
    }

    this.lock.on('authenticated', (authResult) => {
      this.lock.getUserInfo(authResult.accessToken, (error, profile) => {
        if (error) {
          console.error(error);
          return;
        }

        this.authStore.setSession({
          authResult,
          userProfile: profile,
        });

        this.createClient();
        this.router.push({ name: 'home' });
      });
    });

    this.lock.on('authorization_error', (error) => {
      console.error(error);
    });
  }

  getHost() {
    return window.location.origin;
  }

  login() {
    if (!this.configured()) {
      throw new Error('Auth0 configuration missing. Check VITE_AUTH0_* env vars.');
    }
    this.lock.show();
  }

  logout() {
    this.authStore.clearSession();
    this.client = null;
    this.lock.logout({ returnTo: this.getHost() });
  }

  configured() {
    return Boolean(this.clientID && this.domain);
  }

  headers() {
    const token = this.authStore.token?.accessToken;
    if (!token) return {};
    return {
      Authorization: `Bearer ${token}`,
      apiKey: this.apiKey,
    };
  }

  createClient() {
    if (this.client) return this.client;
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || 'https://odata.easefica.co.za/easefica/',
      timeout: 5000,
      headers: this.headers(),
    });
    return this.client;
  }

  isAuthorised() {
    return this.authStore.isAuthenticated;
  }
}

export function installAuthLock(app, { router, pinia, config }) {
  const service = new AuthLockService({
    router,
    pinia,
    config,
  });

  app.config.globalProperties.$authLock = service;
  app.provide('authLock', service);
}
