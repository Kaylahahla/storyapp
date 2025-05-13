import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

let map;
let markers = [];

export const initMap = (containerId = 'map', onMapClick) => {
  map = L.map(containerId).setView([0, 0], 2);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  if (onMapClick) {
    map.on('click', (event) => {
      const { lat, lng } = event.latlng;
      onMapClick(lat, lng);
    });
  }
};

const customIcon = L.icon({
  iconUrl: 'https://leafletjs.com/examples/custom-icons/leaf-green.png',
  iconSize: [38, 95],
  iconAnchor: [22, 94],
  popupAnchor: [-2, -76],
  shadowUrl: 'https://leafletjs.com/examples/custom-icons/leaf-shadow.png',
  shadowSize: [50, 64],
  shadowAnchor: [4, 62],
});

export const addMarker = (lat, lon, popupText) => {
  if (!map) return;
  const marker = L.marker([lat, lon], {
    icon: customIcon,
    title: popupText,
    alt: popupText,
  }).addTo(map);
  if (popupText) {
    marker.bindPopup(popupText).openPopup();
  }
  markers.push(marker);
};

export const clearMarkers = () => {
  markers.forEach(marker => map.removeLayer(marker));
  markers = [];
};

export const loadMarkers = (stories) => {
  if (!map) return;
  clearMarkers();

  const bounds = L.latLngBounds();

  stories.forEach(story => {
    if (story.lat && story.lon) {
      const popupText = `
        <strong>${story.name || 'No Title'}</strong><br/>
        ${story.description || 'No Description'}<br/>
        <em>Coordinates: ${story.lat.toFixed(5)}, ${story.lon.toFixed(5)}</em>
      `;
      addMarker(story.lat, story.lon, popupText);
      bounds.extend([story.lat, story.lon]);
    }
  });

  if (bounds.isValid()) {
    map.fitBounds(bounds, { padding: [50, 50] });
  }
};
