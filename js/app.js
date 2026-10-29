/*
 * Demo · Simulación de inicio de sesión
 * - Ningún dato se envía a un servidor ni se guarda (sin fetch, sin cookies, sin storage).
 * - Cualquier usuario/contraseña y cualquier código de 6 dígitos son válidos.
 *
 * Parámetros opcionales en la URL:
 *   ?color=16a34a          Color principal (hex sin #)
 *   &wa=5215512345678      Número de WhatsApp para el botón "Volver a WhatsApp"
 *   &msg=Ya inicié sesión  Texto prellenado al volver a WhatsApp
 *   &otp=0                 Desactiva el paso del código de verificación
 */
(function () {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  const $ = (id) => document.getElementById(id);

  // ---------- Configuración por URL ----------
  const color = (params.get('color') || '').replace('#', '');
  if (/^[0-9a-fA-F]{6}$/.test(color)) {
    document.documentElement.style.setProperty('--accent', '#' + color);
    // Texto blanco u oscuro según luminancia del color
    const r = parseInt(color.slice(0, 2), 16);
    const g = parseInt(color.slice(2, 4), 16);
    const b = parseInt(color.slice(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    document.documentElement.style.setProperty('--accent-contrast', lum > 0.6 ? '#111827' : '#ffffff');
  }

  const waNumber = (params.get('wa') || '').replace(/\D/g, '');
  const waMsg = params.get('msg') || 'Ya inicié sesión ✅';
  const useOtp = params.get('otp') !== '0';

  if (waNumber.length >= 10 && waNumber.length <= 15) {
    const btnWa = $('btn-wa');
    btnWa.href = 'https://wa.me/' + waNumber + '?text=' + encodeURIComponent(waMsg);
    btnWa.hidden = false;
  }

  // ---------- Utilidades ----------
  function showStep(id) {
    document.querySelectorAll('.step').forEach((s) => s.classList.remove('is-active'));
    $(id).classList.add('is-active');
    const firstInput = $(id).querySelector('input');
    if (firstInput) setTimeout(() => firstInput.focus(), 50);
  }

  function setError(inputId, errId, msg) {
    $(errId).textContent = msg;
    $(inputId).classList.toggle('has-error', Boolean(msg));
  }

  function setLoading(btn, loading) {
    btn.classList.toggle('is-loading', loading);
    btn.disabled = loading;
  }

  let toastTimer;
  function toast(msg) {
    const t = $('toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
  }

  function fakeDelay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ---------- Paso 1: Login ----------
  $('toggle-pass').addEventListener('click', () => {
    const pass = $('pass');
    const show = pass.type === 'password';
    pass.type = show ? 'text' : 'password';
    $('toggle-pass').textContent = show ? 'Ocultar' : 'Mostrar';
    $('toggle-pass').setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
  });

  $('user').addEventListener('input', () => setError('user', 'err-user', ''));
  $('pass').addEventListener('input', () => setError('pass', 'err-pass', ''));

  $('forgot').addEventListener('click', () => {
    toast('Función no disponible en esta demo');
  });

  $('form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const user = $('user').value.trim();
    const pass = $('pass').value;
    let valid = true;

    if (!user) {
      setError('user', 'err-user', 'Escribe tu usuario o correo.');
      valid = false;
    }
    if (!pass) {
      setError('pass', 'err-pass', 'Escribe tu contraseña.');
      valid = false;
    }
    if (!valid) return;

    const btn = $('btn-login');
    setLoading(btn, true);
    await fakeDelay(1200);
    setLoading(btn, false);

    // Se limpian los campos: nada queda en memoria del formulario
    $('pass').value = '';
    $('pass').type = 'password';
    $('toggle-pass').textContent = 'Mostrar';

    if (useOtp) {
      showStep('step-otp');
      startCountdown();
    } else {
      $('user').value = '';
      showStep('step-success');
    }
  });

  // ---------- Paso 2: Código ----------
  let countdownTimer;
  function startCountdown() {
    let seconds = 30;
    const resend = $('resend');
    resend.disabled = true;
    resend.innerHTML = 'Reenviar código en <span id="countdown">30</span>s';
    clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      seconds -= 1;
      const cd = $('countdown');
      if (cd) cd.textContent = seconds;
      if (seconds <= 0) {
        clearInterval(countdownTimer);
        resend.disabled = false;
        resend.textContent = 'Reenviar código';
      }
    }, 1000);
  }

  $('otp').addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setError('otp', 'err-otp', '');
  });

  $('resend').addEventListener('click', () => {
    toast('Código reenviado (simulado)');
    startCountdown();
  });

  $('back-login').addEventListener('click', () => {
    clearInterval(countdownTimer);
    $('otp').value = '';
    setError('otp', 'err-otp', '');
    showStep('step-login');
  });

  $('form-otp').addEventListener('submit', async (e) => {
    e.preventDefault();
    const code = $('otp').value;
    if (code.length !== 6) {
      setError('otp', 'err-otp', 'El código debe tener 6 dígitos.');
      return;
    }

    const btn = $('btn-otp');
    setLoading(btn, true);
    await fakeDelay(1000);
    setLoading(btn, false);

    clearInterval(countdownTimer);
    $('otp').value = '';
    $('user').value = '';
    showStep('step-success');
  });

  // ---------- Paso 3: Éxito ----------
  $('btn-restart').addEventListener('click', () => {
    showStep('step-login');
  });
})();
