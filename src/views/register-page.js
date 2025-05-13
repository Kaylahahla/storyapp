import RegisterPresenter from '../../presenter/register-presenter.js';

export function renderRegisterPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <form id="register-form">
      <h2>Daftar</h2>

      <label for="name">Nama:</label>
      <input type="text" id="name" required />

      <label for="email">Email:</label>
      <input type="email" id="email" required />

      <label for="password">Password:</label>
      <input type="password" id="password" required />

      <button type="submit">Register</button>
    </form>
  `;

  document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await RegisterPresenter.register(name, email, password);
  });
}
