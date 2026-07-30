

const email = document.querySelector('#email')
const password = document.querySelector('#password')
const loginForm = document.querySelector('#login-form')

function form_input(e){
  e.preventDefault();
  let flag = true;
  if(email.value === ''){
    email.classList.add('error')
    flag = false
  }
  if(password.value === ''){
    password.classList.add('error')
    flag = false
  }
  return flag
}

function togglePassword() {
    const input = document.getElementById('password');
    const icon = document.getElementById('eyeIcon');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}

const from_disable = document.querySelector('.form_disable');

from_disable.addEventListener('click', function () {
    // Delay disabling by a few milliseconds so the form actually submits
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
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorToast.style.opacity = '0';
    setTimeout(() => errorToast.remove(), 500); // Wait for transition
  }, 5000);
}

