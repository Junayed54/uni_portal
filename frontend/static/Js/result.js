document.addEventListener('DOMContentLoaded', function () {
    const examId = window.location.pathname.split('/')[3]; // Replace with the actual exam ID
    const accessToken = localStorage.getItem('access_token'); // Assumes the token is stored in local storage
    
    
    if (!accessToken) {
        alert('You must be logged in to view this page.');
        window.location.href = '/login/';
        return;
    }

    // Fetch Exam Details
    function fetchExamDetails() {
        fetch(`/quiz/exams/exam_detail/${examId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(response => response.json())
            .then(data => renderExamDetails(data))
            .catch(error => console.error('Error fetching exam details:', error));
    }

    function renderExamDetails(data) {
        const examDetails = document.getElementById('exam-details');
        examDetails.innerHTML = `
            <h3>${data.title}</h3>
        `;
    }

    // Fetch Best Attempts
    function fetchBestAttempts() {
        fetch(`/quiz/attempts/user_best_attempts/?exam_id=${examId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(response => response.json())
            .then(data => renderBestAttempts(data))
            .catch(error => console.error('Error fetching best attempts:', error));
    }

    function renderBestAttempts(data) {
        // console.log("attempts", data);
        
        const attemptsContainer = document.getElementById('user-attempts');
        attemptsContainer.innerHTML = '';

        if (data.length === 0) {
            attemptsContainer.innerHTML = '<tr><td colspan="8" class="text-center">No attempts found.</td></tr>';
            return;
        }

        data.forEach(attempt => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(attempt.attempt_time).toLocaleDateString()}</td>
                <td>${attempt.user_name}</td>
                <td>${attempt.total_questions || 'N/A'}</td>
                <td>${attempt.answered || 'N/A'}</td>
                <td>${attempt.total_correct_answers || 'N/A'}</td>
                <td>${attempt.wrong_answers || 'N/A'}</td>
                <td>${attempt.pass_mark || 'N/A'}</td>
                <td>
                    <button class="btn btn-light details-btn" data-user-id="${attempt.user}">
                        <img src="${imagePath}" alt="Attempts" style="width: 26px; height: 26px; margin-right: 5px;">
                        
                    </button>
                </td>
            `;
            attemptsContainer.appendChild(row);
        });

        // Add event listeners to "Details" buttons after rendering
        addDetailsButtonListeners();
    }

    // Event listener for "Details" buttons
    function addDetailsButtonListeners() {
        const buttons = document.querySelectorAll('.details-btn');
        buttons.forEach(button => {
            button.addEventListener('click', function () {
                const userId = button.getAttribute('data-user-id');
                
                viewUserAttemptsDetails(userId);
            });
        });
    }

    // View User Attempts Details (ensure the function is defined globally)
    function viewUserAttemptsDetails(userId) {
        fetch(`/quiz/attempts/user_attempts/?exam_id=${examId}&user_id=${userId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(response => response.json())
            .then(data => showUserAttemptsDetails(data))
            .catch(error => console.error('Error fetching user attempts details:', error));
    }

    // Add a global variable outside the function to store the chart instance
    let attemptChart = null;  // Initialize as null

    function showUserAttemptsDetails(data) {
        console.log("data nof ",data);
        const attemptsDetailsContainer = document.getElementById('user-attempts-details');
        attemptsDetailsContainer.innerHTML = '';

        if (data.length === 0) {
            attemptsDetailsContainer.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center text-muted">No detailed attempts found.</td>
                </tr>`;
            return;
        }

        // Populate Table Rows
        data.forEach(attempt => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(attempt.attempt_time).toLocaleDateString()}</td>
                <td>${new Date(attempt.attempt_time).toLocaleTimeString()}</td>
                <td>${attempt.total_questions}</td>
                <td>${attempt.answered}</td>
                <td>${attempt.total_correct_answers}</td>
                <td>${attempt.wrong_answers}</td>
                <td>${attempt.pass_mark}</td>
            `;
            attemptsDetailsContainer.appendChild(row);
        });

        // Extract data for the chart
        const labels = data.map(attempt => new Date(attempt.attempt_time).toLocaleDateString());
        const correctData = data.map(attempt => attempt.total_correct_answers);
        const wrongData = data.map(attempt => attempt.wrong_answers);

        // Destroy previous chart instance if it exists
        if (attemptChart) {
            attemptChart.destroy();  // Check if attemptChart is not null before destroying
        }

        // Create a new chart instance
        const ctx = document.getElementById('attemptChart').getContext('2d');
        attemptChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Correct Answers',
                        data: correctData,
                        backgroundColor: 'rgba(0, 128, 0, 0.6)',
                        borderColor: 'green',
                        borderWidth: 1
                    },
                    {
                        label: 'Wrong Answers',
                        data: wrongData,
                        backgroundColor: 'rgba(255, 0, 0, 0.6)',
                        borderColor: 'red',
                        borderWidth: 1
                    }
                ]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });

        // Open the modal using Bootstrap's JavaScript API
        const modal = new bootstrap.Modal(document.getElementById('attempt-details-modal'));
        modal.show();
    }

    
    

    // Fetch Leaderboard
    function fetchLeaderboard() {
        fetch(`/quiz/leaderboard/${examId}/`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        })
            .then(response => response.json())
            .then(data => renderLeaderboard(data))
            .catch(error => console.error('Error fetching leaderboard:', error));
    }

    function renderLeaderboard(data) {
        // console.log("leaderboard", data);
        const leaderboardContainer = document.getElementById('leaderboard');
        leaderboardContainer.innerHTML = ''; // Clear existing rows

        if (data.length === 0) {
            leaderboardContainer.innerHTML = '<tr><td colspan="4" class="text-center">No leaderboard data available.</td></tr>';
            return;
        }

        
        data.forEach((entry, index) => {
            console.log("Entry", entry);
            const percentage = entry.total_questions > 0 ? ((entry.score / entry.total_questions) * 100).toFixed(2) : 0;
            const position = index + 1;
            leaderboardContainer.innerHTML += `
                <div class="col">
                    <div class="border border-secondary rounded d-flex align-items-center gap-3 p-3 shadow-sm h-100 clickable-div" data-user-id="${entry.user_id}">
                        <!-- User Icon -->
                        <div class="flex-shrink-0">
                            <img src="../../../static/images/user_9071610.png" alt="User Icon" class="rounded-circle border border-primary" width="50" height="50">
                        </div>

                        <!-- User Data -->
                        <div class="flex-grow-1 overflow-hidden">
                            <h5 class="m-0 text-truncate text-primary">${entry.user}</h5>
                            <small class="d-block">Position: <span class="text-muted">${position}</span></small>
                            <small class="d-block text-success fw-bold">Top Level</small>
                            <small class="d-block">Total Questions: <span class="text-muted">${entry.total_questions}</span></small>
                            <small class="d-block">Total Score: <span class="text-muted">${entry.score}</span></small>
                            <small class="d-block">Percentage: <span class="text-muted">${percentage}%</span></small>
                        </div>
                    </div>
                </div>
            `;


        });

        document.querySelectorAll('.clickable-div').forEach(div => {
            div.addEventListener('click', function() {
                const userId = this.getAttribute('data-user-id');  // Get user ID from data attribute
                window.location.href = `/quiz/user_summary/${userId}/`;  // Redirect to the URL with the user ID
            });
        });
    }

    // Initialize the page
    fetchExamDetails();
    fetchBestAttempts();
    fetchLeaderboard();
});
