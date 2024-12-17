document.addEventListener('DOMContentLoaded', function() {
    // Fetch invited exams
    
    fetch('/api/invited-exams/', {  // Adjust this URL to your Django API endpoint
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')  // Use localStorage or sessionStorage to get your JWT token
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        // Populate the cards with the invited exams
        const invitedExamsList = document.getElementById('invited-exams-list');
        invitedExamsList.innerHTML = ''; // Clear existing cards
        
        data.forEach(invitation => {
            const exam = invitation.exam;
            const invitedUser = invitation.invited_user;

            const card = `
                <div class="col-md-4 mb-4">
                    <div class="card">
                        <div class="card-body">
                            <h5 class="card-title">${invitation.exam}</h5>
                            <p class="card-text">Invited by: ${invitation.invited_by} (${invitation.invited_user_email})</p>
                            <p class="card-text">Invited At: ${new Date(invitation.invited_at).toLocaleString()}</p>
                            
                            <a href="/quiz/exam_room/${invitation.exam_id}/" class="btn btn-primary">Start Exam</a>
                        </div>
                    </div>
                </div>
            `;
            
            invitedExamsList.insertAdjacentHTML('beforeend', card); // Append card to the list
        });
    })
    .catch(error => {
        console.error('Error fetching invited exams:', error);
        alert('Failed to fetch invited exams. Please try again.');
    });
});
