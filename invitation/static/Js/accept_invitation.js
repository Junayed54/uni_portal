async function acceptInvitation() {
    // Check if user is already logged in
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        // Redirect to login page if not logged in
        window.location.href = '/auth/login/?next=' + window.location.pathname;
        return;
    }

    const token = window.location.href.split('/').pop(); // Extract token from URL

    try {
        // Send request to accept the invitation
        const acceptResponse = await fetch(`/api/accept-invitation/${token}/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,  // Use access token from localStorage
            }
        });

        const acceptResult = await acceptResponse.json();

        if (acceptResponse.ok) {
            document.getElementById("message").textContent = acceptResult.message;
        } else {
            document.getElementById("message").textContent = acceptResult.error;
        }
    } catch (error) {
        document.getElementById("message").textContent = 'An error occurred. Please try again.';
    }
}

// Attach event listener to the button to trigger the invitation acceptance on click
document.getElementById("acceptButton").addEventListener("click", acceptInvitation);
