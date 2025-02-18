async function signup() {
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const name = document.getElementById('signup-name').value;
  const birthday = document.getElementById('signup-birthday').value;
  const address = document.getElementById('signup-address').value;

  const response = await fetch('/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, name, birthday, address})
  });

  const data = await response.json();
  alert(data.message || data.error);
}

async function confirm_signup() {
  const username = document.getElementById('signup-username').value;
  const email = document.getElementById('signup-email').value;
  const password = document.getElementById('signup-password').value;
  const code = document.getElementById('confirmation-code').value;

  const response = await fetch('/confirm-sign-up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password, code})
});

  const data = await response.json();
  alert(data.message || data.error);

}


async function login() {
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;

  const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  alert(data.message || data.error);
}

// instructing user to enter confirmation code
document.getElementById("signupBtn").addEventListener("click", function() {
  alert("Sign-up successful! Please enter your confirmation code.");
});

