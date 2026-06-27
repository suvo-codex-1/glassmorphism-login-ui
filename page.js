function showToast(message, type = '', duration = 3000) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast show ' + type;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.className = 'toast';
  }, duration);
}

/**
 * Simple email format validator.
 * @param {string} email
 * @returns {boolean}
 */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/**
 * Highlight a field with an error state and auto-clear on input.
 * @param {HTMLInputElement} input
 */
function flagField(input) {
  input.style.borderColor = '#f87171';
  input.style.boxShadow   = '0 0 0 3px rgba(248,113,113,0.18)';
  input.addEventListener('input', clearFlag.bind(null, input), { once: true });
}

function clearFlag(input) {
  input.style.borderColor = '';
  input.style.boxShadow   = '';
}

/* ── Tab / Panel switching ───────────────────────────────── */

const tabs   = document.querySelectorAll('.tab');
const panels = { signin: document.getElementById('panel-signin'),
                 signup: document.getElementById('panel-signup') };

/**
 * Switch the visible panel and update the active tab indicator.
 * @param {'signin'|'signup'} target
 */
function switchTab(target) {
  tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === target));
  Object.entries(panels).forEach(([key, el]) =>
    el.classList.toggle('active', key === target)
  );
}

/* Tab buttons */
tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.tab)));

/* "Sign Up" / "Sign In" shortcut buttons & links */
document.getElementById('goto-signup')  .addEventListener('click', () => switchTab('signup'));
document.getElementById('goto-signin')  .addEventListener('click', () => switchTab('signin'));
document.getElementById('switch-signup').addEventListener('click', e => { e.preventDefault(); switchTab('signup'); });
document.getElementById('switch-signin').addEventListener('click', e => { e.preventDefault(); switchTab('signin'); });

/* ── Password visibility toggle ─────────────────────────── */

/**
 * Toggle an input between password / text type.
 * Implemented for every .toggle-pw button via delegation.
 */
document.querySelectorAll('.toggle-pw').forEach(btn => {
  btn.addEventListener('click', () => {
    const input  = document.getElementById(btn.dataset.target);
    const isText = input.type === 'text';
    input.type   = isText ? 'password' : 'text';
    btn.textContent = isText ? '👁' : '🔒';
  });
});

/* ── Password strength meter ─────────────────────────────── */

const signupPassword = document.getElementById('signup-password');
const strengthBar    = document.getElementById('strength-bar');
const strengthLabel  = document.getElementById('strength-label');

const STRENGTH_CONFIG = [
  { label: '',        color: '',        width: '0%'  },
  { label: 'Weak',    color: '#f87171', width: '25%' },
  { label: 'Fair',    color: '#fb923c', width: '50%' },
  { label: 'Good',    color: '#facc15', width: '75%' },
  { label: 'Strong',  color: '#4ade80', width: '100%'},
];

/**
 * Score a password from 0–4.
 * Criteria: length ≥8, uppercase, digit, special character.
 * @param {string} pw
 * @returns {number} 0–4
 */
function scorePassword(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8)              score++;
  if (/[A-Z]/.test(pw))           score++;
  if (/\d/.test(pw))              score++;
  if (/[^A-Za-z0-9]/.test(pw))   score++;
  return score;
}

signupPassword.addEventListener('input', () => {
  const score  = scorePassword(signupPassword.value);
  const config = STRENGTH_CONFIG[score];
  strengthBar.style.width      = config.width;
  strengthBar.style.background = config.color;
  strengthLabel.textContent    = config.label;
  strengthLabel.style.color    = config.color;
});

/* ── Sign In form validation & submission ────────────────── */

/**
 * Validate sign-in fields.
 * @returns {boolean} true if all fields pass
 */
function validateSignIn() {
  const username = document.getElementById('signin-username');
  const password = document.getElementById('signin-password');
  let valid = true;

  if (username.value.trim().length < 3) {
    flagField(username);
    showToast('Username must be at least 3 characters.', 'error');
    valid = false;
  } else if (password.value.length < 6) {
    flagField(password);
    showToast('Password must be at least 6 characters.', 'error');
    valid = false;
  }
  return valid;
}

document.getElementById('signin-btn').addEventListener('click', () => {
  if (!validateSignIn()) return;

  /* Simulate async login check */
  const btn = document.getElementById('signin-btn');
  btn.textContent = 'Signing in…';
  btn.disabled    = true;

  setTimeout(() => {
    btn.textContent = 'Sign In';
    btn.disabled    = false;
    showToast('Signed in successfully! 🎉', 'success');
  }, 1400);
});


/**
 * Validate sign-up fields.
 * @returns {boolean} true if all fields pass
 */
function validateSignUp() {
  const name     = document.getElementById('signup-name');
  const email    = document.getElementById('signup-email');
  const password = document.getElementById('signup-password');
  const confirm  = document.getElementById('signup-confirm');

  if (name.value.trim().length < 2) {
    flagField(name);
    showToast('Please enter your full name.', 'error');
    return false;
  }

  if (!isValidEmail(email.value)) {
    flagField(email);
    showToast('Please enter a valid email address.', 'error');
    return false;
  }

  if (scorePassword(password.value) < 2) {
    flagField(password);
    showToast('Choose a stronger password (min 8 chars + uppercase + digit).', 'error');
    return false;
  }

  if (password.value !== confirm.value) {
    flagField(confirm);
    showToast('Passwords do not match.', 'error');
    return false;
  }

  return true;
}

document.getElementById('signup-btn').addEventListener('click', () => {
  if (!validateSignUp()) return;

  const btn = document.getElementById('signup-btn');
  btn.textContent = 'Creating account…';
  btn.disabled    = true;

  setTimeout(() => {
    btn.textContent = 'Create Account';
    btn.disabled    = false;
    showToast('Account created! Welcome aboard 🎉', 'success');
    /* Optionally switch to sign-in after success */
    setTimeout(() => switchTab('signin'), 1600);
  }, 1600);
});

/* ── Forgot Password modal ───────────────────────────────── */

const modalOverlay = document.getElementById('modal-overlay');

/** Open the modal */
function openModal() {
  modalOverlay.classList.add('open');
  document.getElementById('reset-email').value = '';
  clearFlag(document.getElementById('reset-email'));
}

/** Close the modal */
function closeModal() {
  modalOverlay.classList.remove('open');
}

document.getElementById('forgot-link')  .addEventListener('click', e => { e.preventDefault(); openModal(); });
document.getElementById('modal-cancel') .addEventListener('click', closeModal);

/* Close on backdrop click */
modalOverlay.addEventListener('click', e => {
  if (e.target === modalOverlay) closeModal();
});

document.getElementById('modal-send').addEventListener('click', () => {
  const emailInput = document.getElementById('reset-email');

  if (!isValidEmail(emailInput.value)) {
    flagField(emailInput);
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  const btn = document.getElementById('modal-send');
  btn.textContent = 'Sending…';
  btn.disabled    = true;

  setTimeout(() => {
    btn.textContent = 'Send Link';
    btn.disabled    = false;
    closeModal();
    showToast('Reset link sent! Check your inbox.', 'success');
  }, 1200);
});


/** Allow Enter key to trigger sign-in from any field in that panel */
document.getElementById('panel-signin').querySelectorAll('input').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('signin-btn').click();
  });
});

/** Allow Enter key to trigger sign-up from any field in that panel */
document.getElementById('panel-signup').querySelectorAll('input').forEach(input => {
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('signup-btn').click();
  });
});

/** Escape key closes modal */
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});