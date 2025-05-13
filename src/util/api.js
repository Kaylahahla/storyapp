const API_URL = 'https://story-api.dicoding.dev/v1';

export const fetchStories = async (token) => {
  if (!token) return [];

  try {
    const response = await fetch(`${API_URL}/stories`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();
    if (data.error) throw new Error(data.message);

    return data.listStory;
  } catch (error) {
    console.error('⚠️ Gagal fetch dari API:', error);
    return [];
  }
};

export const addStory = async (description, photo, lat, lon) => {
  const formData = new FormData();
  formData.append('description', description);
  formData.append('photo', photo);
  if (lat && lon) {
    formData.append('lat', lat);
    formData.append('lon', lon);
  }

  const token = localStorage.getItem('token');
  if (!token) {
    alert('Token tidak ditemukan. Silakan login terlebih dahulu.');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/stories`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (data.error) {
      throw new Error(data.message);
    }

    // ✅ Tambahkan notifikasi lokal
    if (Notification.permission === 'granted') {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        registration.showNotification('Story berhasil dibuat', {
          body: `Anda telah membuat story baru dengan deskripsi: ${description}`,
        });
      }
    }

    return data;
  } catch (error) {
    console.error('Gagal menambahkan cerita:', error);
    return { error: true, message: error.message };
  }
};

export const registerUser = async (name, email, password) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error saat register:', error);
    return { error: true, message: error.message };
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (!data.error) {
      return {
        error: false,
        token: data.loginResult.token,
        name: data.loginResult.name,
        userId: data.loginResult.userId,
      };
    } else {
      return { error: true, message: data.message };
    }
  } catch (error) {
    console.error('Error saat login:', error);
    return { error: true, message: error.message };
  }
};
