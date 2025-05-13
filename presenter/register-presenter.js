import { registerUser } from '../src/util/api';

const RegisterPresenter = {
  async register(name, email, password) {
    try {
      const result = await registerUser(name, email, password);

      if (!result.error) {
        alert('Registrasi berhasil! Silakan login.');
        window.location.hash = '#login';
      } else {
        alert(`Registrasi gagal: ${result.message}`);
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat registrasi:', error);
      alert('Terjadi kesalahan tak terduga saat registrasi.');
    }
  }
};

export default RegisterPresenter;
