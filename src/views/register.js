
import { registerUser } from '../util/api';

export const renderRegisterForm = () => {
  const registerHTML = `
    <h2>Daftar Akun Dicoding Story</h2>
    <form id="register-form">
      <label for="name">Nama:</label>
      <input type="text" id="name" required />
      <label for="email">Email:</label>
      <input type="email" id="email" required />
      <label for="password">Password (min 8 karakter):</label>
      <input type="password" id="password" required />
      <button type="submit">Daftar</button>
    </form>
  `;

  document.getElementById('main-content').innerHTML = registerHTML;

  const form = document.getElementById('register-form');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = form.name.value;
    const email = form.email.value;
    const password = form.password.value;
    await registerUser(name, email, password);
  });
};
