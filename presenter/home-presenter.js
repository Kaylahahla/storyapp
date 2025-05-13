import { fetchStories } from '../src/util/api';
import { renderHomePage } from '../src/views/home';
import { initMap, loadMarkers } from '../src/util/map';
import { saveStory, getStories } from '../src/util/indexed-db';

export const handleHomePage = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<p>Silakan login terlebih dahulu untuk melihat cerita.</p>';
    return;
  }

  try {
    let stories;
    
    // Try to fetch from API first
    try {
      stories = await fetchStories(token);
      // Save stories to IndexedDB
      stories.forEach(story => saveStory(story));
    } catch (error) {
      console.log('Offline mode: Loading from IndexedDB');
      // If offline, load from IndexedDB
      stories = await getStories();
      if (!stories || stories.length === 0) {
        throw new Error('No stories available offline');
      }
    }

    renderHomePage(stories);

    // Initialize map and load markers
    initMap('map');
    loadMarkers(stories);
  } catch (error) {
    console.error('Error loading stories:', error);
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = '<p>Gagal memuat cerita. Silakan periksa koneksi internet Anda.</p>';
  }
};
