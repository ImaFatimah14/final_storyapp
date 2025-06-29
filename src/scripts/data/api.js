// ==================== src/data/api.js ====================
import CONFIG from '../config';
import Auth from '../utils/auth';

export const ENDPOINTS = {
  LOGIN: `${CONFIG.BASE_URL}/login`,
  REGISTER: `${CONFIG.BASE_URL}/register`,
  STORIES: `${CONFIG.BASE_URL}/stories`,
  SUBSCRIBE: `${CONFIG.BASE_URL}/notifications/subscribe`,
  UNSUBSCRIBE: `${CONFIG.BASE_URL}/notifications/unsubscribe`,
};

// ===== REGISTER USER =====
export const register = async (name, email, password) => {
  try {
    const response = await fetch(ENDPOINTS.REGISTER, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    return await response.json();
  } catch (error) {
    return { error: true, message: error.message };
  }
};

// ===== LOGIN USER =====
export const login = async (email, password) => {
  try {
    const response = await fetch(ENDPOINTS.LOGIN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    return await response.json();
  } catch (error) {
    console.error('Login error:', error);
    return { error: true, message: 'Terjadi kesalahan jaringan. Coba lagi.' };
  }
};

// ===== GET STORIES =====
export const getStories = async (token) => {
  try {
    const response = await fetch(ENDPOINTS.STORIES, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Error fetching stories:', error);
    return { error: true, message: error.message };
  }
};

// ===== POST STORY =====
export const postStory = async (token, { file, description, lat, lon }) => {
  try {
    const formData = new FormData();
    formData.append('photo', file);
    formData.append('description', description);
    if (lat) formData.append('lat', lat);
    if (lon) formData.append('lon', lon);

    const response = await fetch(ENDPOINTS.STORIES, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    return await response.json();
  } catch (error) {
    console.error('Post story error:', error);
    return { error: true, message: error.message };
  }
};

// ===== SUBSCRIBE PUSH NOTIFICATION =====
export async function subscribePushNotification({ endpoint, keys }) {
  try {
    const token = Auth.getToken();
    if (!token) {
      return { ok: false, message: 'Token tidak ditemukan. Silakan login ulang.' };
    }

    const payload = { endpoint, keys };

    const response = await fetch(ENDPOINTS.SUBSCRIBE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    return await response.json();
  } catch (error) {
    return { ok: false, message: error.message };
  }
}

// ===== UNSUBSCRIBE PUSH NOTIFICATION =====
export async function unsubscribePushNotification({ endpoint }) {
  try {
    const token = Auth.getToken();

    const response = await fetch(ENDPOINTS.UNSUBSCRIBE, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ endpoint }),
    });

    return await response.json();
  } catch (error) {
    return { ok: false, message: error.message };
  }
}
