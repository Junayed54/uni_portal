document.addEventListener("DOMContentLoaded", function () {
    const packageForm = document.getElementById('packageForm');

    packageForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent the form from submitting

        // Collect form data
        const data = {
            name: document.getElementById('name').value,
            price: parseFloat(document.getElementById('price').value),
            duration_in_days: parseInt(document.getElementById('duration').value),
            max_exams: parseInt(document.getElementById('maxExams').value),
            max_attampts: parseInt(document.getElementById('maxAttampts').value),
            very_easy_percentage: document.getElementById('veryEasyRange').value.trim(),
            easy_percentage: document.getElementById('easyRange').value.trim(),
            medium_percentage: document.getElementById('mediumRange').value.trim(),
            hard_percentage: document.getElementById('hardRange').value.trim(),
            very_hard_percentage: document.getElementById('veryHardRange').value.trim(),
            expert_percentage: document.getElementById('expertRange').value.trim()
        };

        // Validate difficulty ranges
        const difficultyKeys = [
            'very_easy_percentage',
            'easy_percentage',
            'medium_percentage',
            'hard_percentage',
            'very_hard_percentage',
            'expert_percentage'
        ];
        let isValid = true;

        difficultyKeys.forEach(key => {
            const range = data[key];
            const [min, max] = range.split('-').map(Number); // Split the range into min and max

            if (range.indexOf('-') === -1 || isNaN(min) || isNaN(max)) {
                document.getElementById('responseMessage').innerHTML = `<div class="alert alert-danger">Invalid range format for ${key.replace('_percentage', '').replace('_', ' ')}. Use format like "10-20".</div>`;
                isValid = false;
            } else if (min >= max || min < 0 || max > 100) {
                document.getElementById('responseMessage').innerHTML = `<div class="alert alert-danger">Invalid range for ${key.replace('_percentage', '').replace('_', ' ')}. Ensure min < max and values are between 0 and 100.</div>`;
                isValid = false;
            }
        });

        if (!isValid) {
            return; // Exit if validation fails
        }

        // Access Token (You should obtain this token via your authentication method)
        const accessToken = localStorage.getItem('access_token'); // Replace with actual token retrieval method

        // Use fetch() to send the request
        fetch('/packages/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(data)
        })
            .then(response => {
                if (response.ok) {
                    return response.json(); // If the response is ok, parse JSON
                }
                return response.json().then(errData => {
                    throw new Error(errData.detail || 'Something went wrong!');
                });
            })
            .then(responseData => {
                document.getElementById('responseMessage').innerHTML = '<div class="alert alert-success">Package created successfully!</div>';
                packageForm.reset(); // Reset form
                // Redirect to package listing after a brief delay
                setTimeout(() => {
                    window.location.href = '/all_packages/';
                }, 2000);
            })
            .catch(error => {
                document.getElementById('responseMessage').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
            });
    });
});
