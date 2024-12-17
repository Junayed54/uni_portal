document.addEventListener("DOMContentLoaded", function () {
    const packageId = window.location.pathname.split("/")[2]; // Extract package ID from URL
    const accessToken = localStorage.getItem('access_token'); // Get access token
    console.log(packageId);
    
    // Fetch the existing package data
    fetch(`/packages/${packageId}/`, {  // API endpoint for fetching package details
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })
      .then(response => response.json())
      .then(data => {
        console.log(data);
        // Populate form fields with the fetched data
        document.getElementById('name').value = data.name;
        document.getElementById('price').value = data.price;
        document.getElementById('duration').value = data.duration_in_days;
        document.getElementById('maxExams').value = data.max_exams;

        // Populate difficulty range fields
        document.getElementById('veryEasyRange').value = data.very_easy_percentage;
        document.getElementById('easyRange').value = data.easy_percentage;
        document.getElementById('mediumRange').value = data.medium_percentage;
        document.getElementById('hardRange').value = data.hard_percentage;
        document.getElementById('veryHardRange').value = data.very_hard_percentage;
        document.getElementById('expertRange').value = data.expert_percentage;
      })
      .catch(error => {
        document.getElementById('responseMessage').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
      });

    // Form submission for update
    document.getElementById('updatePackageForm').addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent form submission

      // Collect updated form data (excluding 'name')
      const data = {
        price: parseFloat(document.getElementById('price').value),
        duration_in_days: parseInt(document.getElementById('duration').value),
        max_exams: parseInt(document.getElementById('maxExams').value),
        
        // Difficulty range values
        very_easy_percentage: document.getElementById('veryEasyRange').value,
        easy_percentage: document.getElementById('easyRange').value,
        medium_percentage: document.getElementById('mediumRange').value,
        hard_percentage: document.getElementById('hardRange').value,
        very_hard_percentage: document.getElementById('veryHardRange').value,
        expert_percentage: document.getElementById('expertRange').value
      };

      // Send updated data to the backend
      fetch(`/packages/${packageId}/`, {  // API endpoint for updating package
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(data)
      })
        .then(response => response.json())
        .then(responseData => {
          document.getElementById('responseMessage').innerHTML = '<div class="alert alert-success">Package updated successfully!</div>';
        })
        .catch(error => {
          document.getElementById('responseMessage').innerHTML = `<div class="alert alert-danger">Error: ${error.message}</div>`;
        });
    });
});
