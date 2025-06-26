import { register, login } from '../../data/api';

const RegisterPage = {
  async render() {
    return `
      <section class="login-page">
        <div class="login-container">
          <h2 style="text-align:center; margin-bottom: 1rem;">Daftar Akun</h2>
          <form id="registerForm" class="login-form">
            <label for="name">Nama Lengkap</label>
            <input type="text" id="name" name="name" placeholder="Nama lengkap Anda" required />

            <label for="email">Email</label>
            <input type="email" id="email" name="email" placeholder="Alamat email valid" required />

            <label for="password">Password</label>
            <div class="password-toggle">
              <input type="password" id="password" name="password" placeholder="Minimal 8 karakter" required />
              <button type="button" class="password-toggle-button" id="togglePassword">👁️</button>
            </div>
            <small>Minimal 8 karakter.</small>

            <button type="submit" class="login-button" style="margin-top: 1rem;">
              <i class="fa fa-user-plus"></i> Daftar
            </button>
          </form>
          <p class="register-link">Sudah punya akun? <a href="#/">Login di sini</a></p>
          <div id="registerMessage" style="margin-top:1rem; text-align:center;"></div>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const form = document.getElementById('registerForm');
    const message = document.getElementById('registerMessage');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;

      const result = await register(name, email, password);

      if (result.error) {
        message.textContent = result.message;
        message.style.color = 'red';
      } else {
        // Registrasi berhasil, login otomatis
        const loginResult = await login(email, password);

        if (loginResult.error) {
          message.textContent = 'Registrasi berhasil, tapi login gagal. Silakan login manual.';
          message.style.color = 'orange';
        } else {
          localStorage.setItem('token', loginResult.loginResult.token);
          message.textContent = 'Registrasi & login berhasil! Mengarahkan...';
          message.style.color = 'lightgreen';
          setTimeout(() => {
            window.location.hash = '#/home';
          }, 1000);
        }
      }
    });

    // Fitur tampilkan password
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');

    togglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      togglePassword.textContent = type === 'password' ? '👁️' : '🙈';
    });
  },
};

export default RegisterPage;
