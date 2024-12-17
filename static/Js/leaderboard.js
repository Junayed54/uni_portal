document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    const leaderboardContainer = document.getElementById('leaderboard');

    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    // Assuming the exam_id is provided in the URL or you fetch it from the DOM
    const examId = window.location.pathname.split('/')[3];
    console.log(examId);

    // Fetch leaderboard data
    async function fetchLeaderboard() {
        try {
            const response = await fetch(`/quiz/leaderboard/${examId}/`, {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch leaderboard data');
            }

            const leaderboardData = await response.json();

            // Clear the current leaderboard data
            leaderboardContainer.innerHTML = '';

            if (leaderboardData.length === 0) {
                leaderboardContainer.innerHTML = '<tr><td colspan="3" class="text-center">No leaderboard data available</td></tr>';
            } else {
                // Populate leaderboard data
                leaderboardData.forEach((entry, index) => {
                    console.log(entry)
                    const row = `
                        <tr>
                            <th scope="row">${index + 1}</th>
                            <td>${entry.user}</td>
                            <td>${entry.score}</td>
                        </tr>
                    `;
                    leaderboardContainer.innerHTML += row;
                });
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    fetchLeaderboard();
});
