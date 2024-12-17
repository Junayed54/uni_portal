function requestOTP() {
    const email = document.getElementById('email').value;

    fetch('/api/request-otp/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById('message').innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            document.getElementById('request-otp-form').style.display = 'none';
            document.getElementById('verify-otp-form').style.display = 'block';
        } else if (data.error) {
            document.getElementById('message').innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

// Function to verify OTP and reset password
function verifyOTP() {
    const email = document.getElementById('email').value;
    const otp = document.getElementById('otp').value;
    const newPassword = document.getElementById('new-password').value;

    fetch('/api/verify-otp/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, otp: otp, new_password: newPassword }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            document.getElementById('message').innerHTML = `<div class="alert alert-success">${data.message}</div>`;
            document.getElementById('verify-otp-form').style.display = 'none';
        } else if (data.error) {
            document.getElementById('message').innerHTML = `<div class="alert alert-danger">${data.error}</div>`;
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}