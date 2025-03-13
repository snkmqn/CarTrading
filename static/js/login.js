document.addEventListener("DOMContentLoaded", updateAuthUI);

document.querySelector('.login-form').addEventListener('submit', async function (event) {
    event.preventDefault();

    const username = document.getElementById('username');
    const password = document.getElementById('password');

    let isValid = true;
    const latinPattern = /^[A-Za-z0-9_\-@.]+$/;
    const hasNumber = /\d/;

    if (username.value.trim() === '') {
        showError(username, 'Please enter your username');
        isValid = false;
    } else if (!latinPattern.test(username.value.trim())) {
        showError(username, 'Use only Latin characters');
        isValid = false;
    }

    if (password.value.trim() === '') {
        showError(password, 'Please enter your password.');
        isValid = false;
    } else if (password.value.includes(' ')) {
        showError(password, 'Password must not contain spaces.');
        isValid = false;
    } else if (password.value.length < 6) {
        showError(password, 'Password must be at least 6 characters.');
        isValid = false;
    } else if (!hasNumber.test(password.value)) {
        showError(password, 'Password must contain at least one number.');
        isValid = false;
    } else if (!latinPattern.test(password.value.trim())) {
        showError(password, 'Use only Latin characters.');
        isValid = false;
    }

    if (!isValid) return;

    try {
        console.log('Sending login request to the server');
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                username: username.value.trim(),
                password: password.value.trim()
            })
        });

        const data = await response.json();
        console.log(data);

        if (response.status === 200) {
            localStorage.setItem("token", data.token);
            window.location.href = "/index";
        } else {
            if (data.message.includes("username")) {
                showError(username, "User not registered");
            }
            if (data.message.includes("password")) {
                showError(password, "Invalid password");
            }
        }
    } catch (error) {
        console.error("Login error:", error);
        showError(username, "Error. Try again.");
        showError(password, "Error. Try again.");
    }
});


function showError(input, message) {
    input.value = '';
    input.placeholder = message;
    input.classList.add('error');
}

document.getElementById('username').addEventListener('input', function () {
    this.classList.remove('error');
});

document.getElementById('password').addEventListener('input', function () {
    this.classList.remove('error');
});

document.getElementById('username').addEventListener('keydown', handleKey);
document.getElementById('password').addEventListener('keydown', handleKey);

function handleKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.querySelector('.login-form').dispatchEvent(new Event('submit'));
    } else if (event.key === 'Escape') {
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
        document.getElementById('username').classList.remove('error');
        document.getElementById('password').classList.remove('error');
    }
}

function updateAuthUI() {
    console.log("updateAuthUI called");
    const token = localStorage.getItem("token");
    const authContainer = document.getElementById("auth-container");

    if (!authContainer) {
        console.log("auth-container not found!");
        return;
    }

    if (token) {
        authContainer.innerHTML = `
            <ul class="nav-links">
                <li><a href="/myAds">My Ads</a></li>
                <li><a href="/profile">My Profile</a></li>
                <li>
                    <button id="logout" class="btn btn-primary">Log out</button>
                </li>
            </ul>
        `;

        document.getElementById("logout").addEventListener("click", function () {
            localStorage.removeItem("token");
            updateAuthUI();
            window.location.href = "/index";
        });

    } else {
        console.log("No token found!");
        authContainer.innerHTML = `
              <ul class="nav-links">
                <li><button onclick="location.href='/login'" class="btn btn-primary">Sign In</button></li>
                <li><button onclick="location.href='/signup'" class="btn btn-primary">Sign Up</button></li>
            </ul>
        `;
    }
}




