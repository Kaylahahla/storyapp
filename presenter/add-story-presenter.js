import { addStory } from '../src/util/api';
import { renderAddStoryPage } from '../src/views/add-story-page';
import { initCamera, stopCamera } from '../src/util/camera';
import { initMap, addMarker } from '../src/util/map';
import { saveStory } from '../src/util/indexed-db';

let currentMarker = null;

export const handleAddStoryPage = () => {
  renderAddStoryPage();

  const form = document.getElementById('add-story-form');
  const video = document.getElementById('video');
  const canvas = document.getElementById('canvas');
  const captureButton = document.getElementById('capture-button');
  const photoInput = document.getElementById('photo');

  const onMapClick = (lat, lng) => {
    if (currentMarker) {
      currentMarker.remove();
    }
    addMarker(lat, lng);
    form.lat.value = lat;
    form.lon.value = lng;
  };

  initCamera(video, canvas, captureButton, photoInput);
  initMap('map', onMapClick);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const description = form.description.value;
    const photo = form.photo.files[0];
    const lat = form.lat.value ? parseFloat(form.lat.value) : null;
    const lon = form.lon.value ? parseFloat(form.lon.value) : null;

    try {
      // Try to add story to API first
      try {
        const result = await addStory(description, photo, lat, lon);
        if (!result.error) {
          // Pastikan object yang disimpan punya id
          const storyToSave = result.story
            ? { ...result.story, id: result.story.id || Date.now().toString() }
            : { ...result, id: result.id || Date.now().toString() };
          await saveStory(storyToSave);
          alert('Cerita berhasil ditambahkan!');
          stopCamera();
          window.location.hash = '#home';
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error('Gagal kirim ke API:', error);
        // If offline, save to IndexedDB only
        const offlineStory = {
          id: Date.now().toString(),
          description,
          photoUrl: URL.createObjectURL(photo),
          lat,
          lon,
          createdAt: new Date().toISOString(),
          isOffline: true
        };
        await saveStory(offlineStory);
        let errorMsg = 'Cerita disimpan secara offline. Akan disinkronkan saat online.';
        if (error && error.message) {
          errorMsg += '\nError: ' + error.message;
        }
        alert(errorMsg);
        stopCamera();
        window.location.hash = '#home';
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan saat menambahkan cerita.');
    }
  });
};

export const cleanupAddStoryPage = () => {
  stopCamera();
  if (currentMarker) {
    currentMarker.remove();
    currentMarker = null;
  }
};
