import './styles/style.css';
import { handleHomePage } from '../presenter/home-presenter';
import { handleAddStoryPage, cleanupAddStoryPage } from '../presenter/add-story-presenter';
import { handleSavedPage } from '../presenter/saved-presenter';
import { renderLoginPage } from './views/login-page';
import { renderRegisterPage } from './views/register-page';
import { stopCamera } from './util/camera';

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

async function sendSubscriptionToServer(subscription) {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });

    const data = await response.json();
    console.log('✅ Subscription sent to server:', data);
  } catch (error) {
    console.error('❌ Failed to send subscription:', error);
  }
}

async function registerServiceWorkerAndSubscribe() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('Push notification not supported.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('✅ Service Worker registered.');

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Notification permission denied.');
      return;
    }

    const existingSubscription = await registration.pushManager.getSubscription();
    if (!existingSubscription) {
      const convertedVapidKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      await sendSubscriptionToServer(newSubscription);
    } else {
      console.log('🔔 Already subscribed.');
    }
  } catch (error) {
    console.error('❌ Service worker / subscription error:', error);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const mainContent = document.getElementById('main-content');
  const skipLink = document.querySelector('.skip-link');

  if (skipLink) {
    skipLink.addEventListener('click', (event) => {
      event.preventDefault();
      const hash = window.location.hash;

      let focusElement = mainContent;

      switch (hash) {
        case '#add-story':
          focusElement = document.getElementById('add-story-form') || mainContent;
          break;
        case '#login':
          focusElement = document.getElementById('login-form') || mainContent;
          break;
        case '#register':
          focusElement = document.getElementById('register-form') || mainContent;
          break;
        default:
          focusElement = mainContent;
      }

      focusElement.setAttribute('tabindex', '-1');
      focusElement.focus();
      window.history.replaceState(null, '', '#main-content');
    });
  }

  let previousHash = window.location.hash;

  const renderPage = () => {
    if (previousHash === '#add-story' && window.location.hash !== '#add-story') {
      cleanupAddStoryPage();
    }
    stopCamera();
    const token = localStorage.getItem('token');
    const hash = window.location.hash;
    const publicPages = ['#login', '#register'];
    const protectedPages = ['#home', '#add-story'];

    if (!hash || hash === '#') {
      window.location.hash = '#login';
      return;
    }

    if (!token && protectedPages.includes(hash)) {
      window.location.hash = '#login';
      return;
    }

    const renderContent = () => {
      switch (hash) {
        case '#home':
          handleHomePage();
          break;
        case '#add-story':
          handleAddStoryPage();
          break;
        case '#saved':
          handleSavedPage();
          break;
        case '#login':
          renderLoginPage();
          break;
        case '#register':
          renderRegisterPage();
          break;
        default:
          mainContent.innerHTML = '<h1>Page Not Found</h1>';
      }

      if (typeof window.updateLoginRegisterVisibility === 'function') {
        window.updateLoginRegisterVisibility();
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(() => renderContent());
    } else {
      mainContent.style.transition = 'opacity 0.3s ease-in-out';
      mainContent.style.opacity = '0';
      setTimeout(() => {
        renderContent();
        mainContent.style.opacity = '1';
      }, 300);
    }
    previousHash = hash;
  };

  window.addEventListener('hashchange', renderPage);
  window.addEventListener('load', renderPage);

  // 🔔 Registrasi service worker dan langganan push
  registerServiceWorkerAndSubscribe();
});
