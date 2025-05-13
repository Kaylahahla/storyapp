export function renderLoginPage() {
  const mainContent = document.getElementById('main-content');
  mainContent.innerHTML = `
    <form id="login-form">
      <h2>Masuk</h2>
      <label for="email">Email:</label>
      <input type="email" id="email" required />

      <label for="password">Password:</label>
      <input type="password" id="password" required />

      <button type="submit">Login</button>

      <p style="text-align: center; margin-top: 1rem;">
        Belum punya akun? <a href="#register">Daftar di sini</a>
      </p>
    </form>
  `;

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const LoginPresenter = (await import('../../presenter/login-presenter.js')).default;
    await LoginPresenter.login(email, password);
  });
}
