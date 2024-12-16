// Wait for the DOM to load before attaching event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Select the registration form using its ID
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        // Attach the submit event listener to the form
        registerForm.addEventListener('submit', async (event) => {
            event.preventDefault(); // Prevent default form submission
            await register(); // Call the register function
        });
    }
});

// Async function to handle registration
async function register() {
    // Get form field values
    const username = document.getElementById('username').value.trim();
    const phone_number = document.getElementById('phone_number').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;

    // Get error message elements
    const errorMessage = document.getElementById('error-message');
    const usernameError = document.getElementById('username-error');
    const phoneNumberError = document.getElementById('phone-number-error');
    const emailError = document.getElementById('email-error');
    const passwordError = document.getElementById('password-error');
    const roleError = document.getElementById('role-error');

    console.log("Register form submitted");

    // Clear previous error messages
    errorMessage.textContent = '';
    usernameError.textContent = '';
    phoneNumberError.textContent = '';
    emailError.textContent = '';
    passwordError.textContent = '';
    roleError.textContent = '';

    try {
        // Send registration data to the server
        const response = await fetch('/auth/signup/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, phone_number, email, password, role }),
        });

        if (response.ok) {
            
            alert("Successfully user created!");
            // Redirect to the login page upon successful registration
            window.location.href = '/login/';
        } else {
            // Handle server errors and display them
            const data = await response.json();

            // Display field-specific errors
            if (data.username) {
                usernameError.textContent = data.username.join(', ');
            }
            if (data.phone_number) {
                phoneNumberError.textContent = data.phone_number.join(', ');
            }
            if (data.email) {
                emailError.textContent = data.email.join(', ');
            }
            if (data.password) {
                passwordError.textContent = data.password.join(', ');
            }
            if (data.role) {
                roleError.textContent = data.role.join(', ');
            }
            if (data.non_field_errors) {
                errorMessage.textContent = data.non_field_errors.join(', ');
            }
            throw new Error(data.detail || 'Registration failed');
        }
    } catch (error) {
        // Display general error messages
        if (!errorMessage.textContent) {
            errorMessage.textContent = error.message;
        }
    }
}
