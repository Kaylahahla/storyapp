import { loginUser } from '../src/util/api';

const LoginPresenter = {
  async login(email, password) {
    try {
      const result = await loginUser(email, password);

      if (!result.error) {
        localStorage.setItem('token', result.token);
        localStorage.setItem('userName', result.name);
        localStorage.setItem('userId', result.userId);
        alert('Login berhasil!');
        
        window.updateLoginRegisterVisibility?.();
        window.location.hash = '#home';
      } else {
        alert(`Login gagal: ${result.message}`);
      }
    } catch (error) {
      console.error('Terjadi kesalahan saat login:', error);
      alert('Terjadi kesalahan tak terduga saat login.');
    }
  }
};

export default LoginPresenter;
