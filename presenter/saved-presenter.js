import { getStories, deleteStory } from '../src/util/indexed-db';

export const handleSavedPage = async () => {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <style>
      .saved-list-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
        gap: 20px;
        margin-top: 24px;
      }
      .saved-story {
        background: #fff;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        padding: 18px 16px 14px 16px;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        transition: box-shadow 0.2s;
      }
      .saved-story:hover {
        box-shadow: 0 4px 16px rgba(0,0,0,0.13);
      }
      .saved-story strong {
        font-size: 1.1em;
        margin-bottom: 8px;
        color: #b23a48;
      }
      .saved-story img {
        margin: 10px 0 12px 0;
        border-radius: 6px;
        max-width: 100%;
        max-height: 120px;
        object-fit: cover;
        background: #eee;
      }
      .delete-saved, .detail-saved {
        background: #e63946;
        color: #fff;
        border: none;
        border-radius: 5px;
        padding: 7px 16px;
        font-size: 0.95em;
        cursor: pointer;
        margin-top: 8px;
        margin-right: 8px;
        transition: background 0.2s;
      }
      .detail-saved {
        background: #457b9d;
      }
      .delete-saved:hover {
        background: #b23a48;
      }
      .detail-saved:hover {
        background: #1d3557;
      }
      /* Modal styles */
      .modal-bg {
        position: fixed;
        top: 0; left: 0; right: 0; bottom: 0;
        background: rgba(0,0,0,0.4);
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .modal-content {
        background: #fff;
        border-radius: 10px;
        padding: 28px 24px 18px 24px;
        max-width: 400px;
        width: 95vw;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        position: relative;
        text-align: left;
      }
      .modal-content img {
        max-width: 100%;
        max-height: 220px;
        border-radius: 8px;
        margin-bottom: 16px;
      }
      .modal-content .close-modal {
        position: absolute;
        top: 10px; right: 16px;
        background: #e63946;
        color: #fff;
        border: none;
        border-radius: 50%;
        width: 32px; height: 32px;
        font-size: 1.2em;
        cursor: pointer;
      }
      #modal-map { height: 180px; width: 100%; border-radius: 8px; margin-top: 10px; }
    </style>
    <h2>Daftar Cerita Tersimpan</h2>
    <div id="saved-list" class="saved-list-grid">Memuat...</div>
    <div id="modal-detail-root"></div>
  `;

  const stories = await getStories();
  const listEl = document.getElementById('saved-list');

  if (!stories.length) {
    listEl.innerHTML = '<p style="grid-column: 1/-1; text-align:center; color:#888;">Tidak ada cerita tersimpan.</p>';
    return;
  }

  listEl.innerHTML = stories.map(story => `
    <div class="saved-story">
      <strong>${story.description || '(Tanpa deskripsi)'}</strong>
      ${story.photoUrl ? `<img src="${story.photoUrl}" alt="photo" />` : ''}
      <div style="display:flex;gap:8px;">
        <button data-id="${story.id}" class="detail-saved">Detail</button>
        <button data-id="${story.id}" class="delete-saved">Hapus</button>
      </div>
    </div>
  `).join('');

  // Hapus story
  listEl.querySelectorAll('.delete-saved').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const id = btn.getAttribute('data-id');
      await deleteStory(id);
      handleSavedPage(); // refresh list
    });
  });

  // Detail story
  listEl.querySelectorAll('.detail-saved').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.getAttribute('data-id');
      const story = stories.find(s => s.id == id);
      showDetailModal(story);
    });
  });
};

function showDetailModal(story) {
  const modalRoot = document.getElementById('modal-detail-root');
  modalRoot.innerHTML = `
    <div class="modal-bg" id="modal-bg">
      <div class="modal-content">
        <button class="close-modal" id="close-modal">&times;</button>
        <h3>Detail Cerita</h3>
        ${story.photoUrl ? `<img src="${story.photoUrl}" alt="photo" />` : ''}
        <div><b>Deskripsi:</b><br/>${story.description || '-'}</div>
        ${story.createdAt ? `<div style="margin-top:8px;"><b>Tanggal:</b> ${new Date(story.createdAt).toLocaleString()}</div>` : ''}
        ${(story.lat && story.lon) ? `<div style="margin-top:8px;"><b>Lokasi:</b> <span id="latlon">${story.lat}, ${story.lon}</span><div id="modal-map"></div></div>` : ''}
      </div>
    </div>
  `;
  document.getElementById('close-modal').onclick = () => { modalRoot.innerHTML = ''; };
  document.getElementById('modal-bg').onclick = (e) => { if (e.target.id === 'modal-bg') modalRoot.innerHTML = ''; };

  // Render map jika ada lat/lon
  if (story.lat && story.lon) {
    setTimeout(() => {
      if (window.L) {
        const map = window.L.map('modal-map').setView([story.lat, story.lon], 13);
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
        window.L.marker([story.lat, story.lon]).addTo(map);
      }
    }, 100);
  }
} 