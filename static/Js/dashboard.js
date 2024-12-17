// Get the access token from local storage
const accessToken = localStorage.getItem('access_token');

// Check if the token exists
if (!accessToken) {
    alert('Access token not found. Please log in.');
    window.location.href = '/login'; // Redirect to login if token is missing
}

// Fetch data from the API with authorization
fetch('/auth/api/dashboard/', {
    method: 'GET',
    headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
    },
})
    .then(response => {
        if (!response.ok) {
            if (response.status === 401) {
                alert('Unauthorized access. Please log in again.');
                window.location.href = '/login'; // Redirect on unauthorized
            }
            throw new Error('Failed to fetch data');
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        // Update summary cards
        document.getElementById('totalStudents').textContent = data.summary.total_students;
        document.getElementById('totalPackageUsers').textContent = data.summary.total_package_users;
        document.getElementById('totalQuestions').textContent = data.summary.total_questions;

        // Extract chart data
        const labels = data.chart_data.labels;

        // Dataset for questions published
        const questionsData = {
            labels: labels,
            datasets: [{
                label: 'Questions Published',
                data: data.chart_data.datasets[0].data,
                backgroundColor: '#FF6384',
                borderColor: '#FF6384',
                tension: 0.1,
                fill: true
            }]
        };

        // Dataset for users joined
        const usersData = {
            labels: labels,
            datasets: [{
                label: 'Users Joined',
                data: data.chart_data.datasets[1].data,
                backgroundColor: '#36A2EB',
                borderColor: '#36A2EB',
                tension: 0.1,
                fill: true
            }]
        };

        // Dataset for package users joined
        const packageUsersData = {
            labels: labels,
            datasets: [{
                label: 'Package Users Joined',
                data: data.chart_data.datasets[2].data,
                backgroundColor: '#FFCE56',
                borderColor: '#FFCE56',
                tension: 0.1,
                fill: true
            }]
        };

        // Render Questions Chart
        const questionsCtx = document.getElementById('questionsChart').getContext('2d');
        new Chart(questionsCtx, {
            type: 'line',
            data: questionsData,
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Questions Published Over Time'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Count'
                        },
                        beginAtZero: true
                    }
                }
            }
        });

        // Render Users Chart
        const usersCtx = document.getElementById('usersChart').getContext('2d');
        new Chart(usersCtx, {
            type: 'line',
            data: usersData,
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Users Joined Over Time'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Count'
                        },
                        beginAtZero: true
                    }
                }
            }
        });

        // Render Package Users Chart
        const packageUsersCtx = document.getElementById('packageUsersChart').getContext('2d');
        new Chart(packageUsersCtx, {
            type: 'line',
            data: packageUsersData,
            options: {
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Package Users Joined Over Time'
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Count'
                        },
                        beginAtZero: true
                    }
                }
            }
        });
    })
    .catch(error => console.error('Error fetching data:', error));
