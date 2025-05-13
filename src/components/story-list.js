import L from 'leaflet';
import { idbStory } from '../util/idb'; // ✅ tambahkan ini untuk menyimpan ke IndexedDB

function escapeHtml(text) {
  if (!text) return '';
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function showDetailModal(story) {
  let modalRoot = document.getElementById('modal-detail-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-detail-root';
    document.body.appendChild(modalRoot);
  }
  modalRoot.innerHTML = `
    <style>
      .modal-bg { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); z-index: 1000; display: flex; align-items: center; justify-content: center; }
      .modal-content { background: #fff; border-radius: 10px; padding: 28px 24px 18px 24px; max-width: 400px; width: 95vw; box-shadow: 0 8px 32px rgba(0,0,0,0.18); position: relative; text-align: left; }
      .modal-content img { max-width: 100%; max-height: 220px; border-radius: 8px; margin-bottom: 16px; }
      .modal-content .close-modal { position: absolute; top: 10px; right: 16px; background: #e63946; color: #fff; border: none; border-radius: 50%; width: 32px; height: 32px; font-size: 1.2em; cursor: pointer; }
      #modal-map { height: 180px; width: 100%; border-radius: 8px; margin-top: 10px; }
    </style>
    <div class="modal-bg" id="modal-bg">
      <div class="modal-content">
        <button class="close-modal" id="close-modal">&times;</button>
        <h3>Detail Cerita</h3>
        ${story.photoUrl ? `<img src="${escapeHtml(story.photoUrl)}" alt="photo" />` : ''}
        <div><b>Deskripsi:</b><br/>${escapeHtml(story.description) || '-'}</div>
        ${story.createdAt ? `<div style="margin-top:8px;"><b>Tanggal:</b> ${new Date(story.createdAt).toLocaleString()}</div>` : ''}
        ${(story.lat != null && story.lon != null) ? `<div style="margin-top:8px;"><b>Lokasi:</b> <span id="latlon">${story.lat}, ${story.lon}</span><div id="modal-map"></div></div>` : ''}
      </div>
    </div>
  `;
  document.getElementById('close-modal').onclick = () => { modalRoot.innerHTML = ''; };
  document.getElementById('modal-bg').onclick = (e) => { if (e.target.id === 'modal-bg') modalRoot.innerHTML = ''; };

  // Render map jika ada lat/lon
  if (story.lat != null && story.lon != null) {
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

class StoryList extends HTMLElement {
  set stories(value) {
    this._stories = value;
    this.render();
  }

  render() {
    if (!this._stories || this._stories.length === 0) {
      this.innerHTML = '<p>No stories available</p>';
      return;
    }

    let html = `
      <style>
        .story-list .detail-btn, .story-list .save-btn {
          background: #d76c82;
          color: #fff;
          border: none;
          border-radius: 6px;
          padding: 8px 18px;
          font-size: 1em;
          cursor: pointer;
          margin: 8px 8px 0 0;
          transition: background 0.2s, box-shadow 0.2s;
          box-shadow: 0 2px 8px rgba(215,108,130,0.07);
        }
        .story-list .detail-btn:hover, .story-list .save-btn:hover {
          background: #b23a48;
        }
      </style>
      <div class="story-list">`;
    for (let i = 0; i < this._stories.length; i++) {
      const story = this._stories[i];
      const createdDate = story.createdAt
        ? new Date(story.createdAt).toLocaleDateString()
        : 'Unknown';

      html += `
        <div class="story-card">
          <img src="${escapeHtml(story.photoUrl)}" alt="${escapeHtml(story.name)}" class="story-image" />
          <div class="story-content">
            <h3>${escapeHtml(story.name)}</h3>
            <p>${escapeHtml(story.description)}</p>
            <p>Created on: ${createdDate}</p>
            <button class="detail-btn" data-index="${i}">Lihat Detail</button>
            <button class="save-btn" data-index="${i}">Simpan Offline</button>
          </div>
        </div>`;
    }
    html += '</div>';
    this.innerHTML = html;

    // Event untuk tombol "Lihat Detail"
    const detailButtons = this.querySelectorAll('.detail-btn');
    detailButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const index = btn.dataset.index;
        const story = this._stories[index];
        showDetailModal(story);
      });
    });

    // ✅ Event untuk tombol "Simpan Offline"
    const saveButtons = this.querySelectorAll('.save-btn');
    saveButtons.forEach(btn => {
      btn.addEventListener('click', async () => {
        const index = btn.dataset.index;
        const story = this._stories[index];
        await idbStory.save(story);
        alert('✅ Cerita disimpan untuk offline!');
      });
    });
  }
}

if (!customElements.get('story-list')) {
  customElements.define('story-list', StoryList);
}
