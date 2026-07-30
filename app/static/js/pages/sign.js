const ps1 = document.getElementById('ps1');
const ps2 = document.getElementById('ps2');
const ps3 = document.getElementById('ps3');
const conn1 = document.getElementById('conn1');
const conn2 = document.getElementById('conn2');

const stepEls = {
  1: document.getElementById('step1'),
  2: document.getElementById('step2'),
  3: document.getElementById('step3'),
};

function goStep(num) {

  // Hide all step panels

  Object.values(stepEls).forEach(el => el.classList.remove('active'));
  stepEls[num].classList.add('active');

  // Reset all sidebar items
  [ps1, ps2, ps3].forEach(el => el.classList.remove('active', 'completed'));
  [conn1, conn2].forEach(el => el.classList.remove('active', 'completed'));

  if (num === 1) {
    ps1.classList.add('active');
  }
  if (num === 2) {
    ps1.classList.add('completed');
    conn1.classList.add('completed');
    ps2.classList.add('active');
  }
  if (num === 3) {
    ps1.classList.add('completed');
    conn1.classList.add('completed');
    ps2.classList.add('completed');
    conn2.classList.add('completed');
    ps3.classList.add('active');
  }
}


// ─── ROLE SELECTION ────────────────────────────────────
document.querySelectorAll('.role-opt').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.role-opt').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    // Update hidden role input value based on selected option
    const roleInput = document.getElementById('roleInput');
    if (roleInput) {
      roleInput.value = opt.dataset.role || '';
    }
  });
});

// ─── TOGGLE PASSWORD ───────────────────────────────────
function togglePw(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn = document.getElementById(btnId);
  if (!input || !btn) return;

  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.innerHTML = isText
    ? '<i class="fa-solid fa-eye"></i>'
    : '<i class="fa-solid fa-eye-slash"></i>';
}

document.querySelectorAll('.toggle-pw').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    const input = btn.closest('.input-wrap')?.querySelector('input');
    if (!input) return;

    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    btn.innerHTML = isText
      ? '<i class="fa-solid fa-eye"></i>'
      : '<i class="fa-solid fa-eye-slash"></i>';
  });
});

// ─── VALIDATION ────────────────────────────────────────
function validateName(input) {
  const ok = input.value.trim().length >= 2;
  input.classList.toggle('valid', ok);
  input.classList.toggle('error', !ok && input.value.length > 0);
}

function validateEmail(input) {
  const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
  input.classList.toggle('valid', ok);
  input.classList.toggle('error', !ok && input.value.length > 0);
}

function validatePhone(input) {
  const ok = /^[9][6-9]\d{8}$/.test(input.value.replace(/\s/g, ''));
  input.classList.toggle('valid', ok);
  input.classList.toggle('error', !ok && input.value.length > 0);
}

function validateConfirm(input) {
  const pw = document.getElementById('password').value;
  const ok = input.value === pw && pw.length > 0;
  input.classList.toggle('valid', ok);
  input.classList.toggle('error', !ok && input.value.length > 0);
}

const from_disable = document.querySelector('.form_disable');

from_disable.addEventListener('click', function () {
  setTimeout(() => {
    this.disabled = true;
    this.style.backgroundColor = '#8d8c8cff';
  }, 10);

  setTimeout(() => {
    this.disabled = false;
    this.style.backgroundColor = '#1E3A8A';
  }, 2000);
});


const errorToast = document.getElementById('error-toast');
if (errorToast) {
  setTimeout(() => {
    errorToast.style.opacity = '0';
    setTimeout(() =>
      errorToast.style.display = "none", 500);
  }, 5000);
}


const first_name = document.getElementById('firstName');
const last_name = document.getElementById('lastName');
const email_address = document.getElementById('email');
const password = document.getElementById('password');
const confirm_password = document.getElementById('confirmPassword');
const confirm_button = document.querySelector('#step1 .btn-next');
const phone = document.querySelector("#phone");


confirm_button.addEventListener("click", function (e) {
  e.preventDefault();

  const errors = validateStep1();

  if (errors.length > 0) {
    showErrors(errors);
    return; // 🚫 STOP
  }

  goStep(2); // ✅ continue
});


function validateStep1() {
  let errors = [];

  if (first_name.value.trim() === "") {
    errors.push("First name is required");
  }

  if (last_name.value.trim() === "") {
    errors.push("Last name is required");
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email_address.value)) {
    errors.push("Invalid email");
  }

  if (!/^[9][6-9]\d{8}$/.test(phone.value)) {
    errors.push("Invalid phone number");
  }

  if (password.value.length < 6) {
    errors.push("Password must be at least 6 characters");
  }

  if (confirm_password.value !== password.value) {
    errors.push("Passwords do not match");
  }

  return errors;
}

function showErrors(errors) {
  const errorToast = document.getElementById('error-toast');

  if (!errorToast) return;

  errorToast.innerHTML = errors.join("<br>");
  errorToast.style.display = "block";
  errorToast.style.opacity = "1";

  setTimeout(() => {
    errorToast.style.opacity = "0";
    setTimeout(() => {
      errorToast.style.display = "none";
    }, 500);
  }, 2000);
}