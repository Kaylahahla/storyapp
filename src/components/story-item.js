import L from 'leaflet';

export class StoryItem extends HTMLElement {
  connectedCallback() {
    this.render();
  }

  render() {
    const { name, description, photoUrl, lat, lon } = this;

    this.innerHTML = `
      <div class="story-item">
        <h3>${name}</h3>
        <p>${description}</p>
        <img src="${photoUrl}" alt="Story image" width="100%">
        <div id="map-${this.id}" style="height: 200px;"></div>
      </div>
    `;

    const map = L.map(`map-${this.id}`).setView([lat, lon], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([lat, lon]).addTo(map).bindPopup(name).openPopup();
  }
}

customElements.define('story-item', StoryItem);
