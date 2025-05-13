import { idbStory } from '../util/idb';

export async function renderSavedPage() {
  const mainContent = document.getElementById('main-content');
  const stories = await idbStory.getAll();

  if (!stories.length) {
    mainContent.innerHTML = '<h2>Belum ada cerita tersimpan offline.</h2>';
    return;
  }

  const cards = stories.map(story => `
    <div class="story-card">
      <img src="${story.photoUrl}" class="story-image" />
      <div class="story-content">
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <button class="delete-btn" data-id="${story.id}">Hapus</button>
      </div>
    </div>
  `).join('');

  mainContent.innerHTML = `
    <h2>Story Tersimpan (Offline)</h2>
    <div class="story-list">${cards}</div>
  `;

  // Handler tombol hapus
  document.querySelectorAll('.delete-btn').forEach(button => {
    button.addEventListener('click', async () => {
      await idbStory.delete(button.dataset.id);
      renderSavedPage(); // refresh tampilan
    });
  });
}
