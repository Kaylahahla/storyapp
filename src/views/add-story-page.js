export const renderAddStoryPage = () => {
  const html = `
    <form id="add-story-form" enctype="multipart/form-data">
      <label for="description">Deskripsi Cerita:</label>
      <textarea id="description" name="description" required></textarea>

      <label for="photo">Pilih Foto:</label>
      <input type="file" id="photo" name="photo" accept="image/*" required>

      <video id="video" autoplay style="width: 100%; max-width: 400px;"></video>
      <button id="capture-button" type="button">Ambil Foto dari Kamera</button>
      <canvas id="canvas" style="display: none;"></canvas>

      <label for="lat">Latitude:</label>
      <input type="number" id="lat" name="lat" step="any">

      <label for="lon">Longitude:</label>
      <input type="number" id="lon" name="lon" step="any">

      <button type="submit">Tambah Cerita</button>
    </form>
    <div id="map" style="height: 300px; margin-top: 20px;"></div>
  `;

  document.getElementById('main-content').innerHTML = html;
};
