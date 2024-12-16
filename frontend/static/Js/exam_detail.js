document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');
    
    // Extract exam_id from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const examId = window.location.pathname.split('/')[3];  // Ensure the exam_id is passed in the URL

    if (!examId || !accessToken) {
        window.location.href = '/login/';
        return;
    }

    const examDetailsUrl = `/quiz/exams/exam_detail/${examId}/`;
    const subjectCountsUrl = `/quiz/exams/${examId}/subjects/`;
    const leaderboardUrl = `/quiz/leader_board/${examId}`;

    function fetchExamDetails() {
        fetch(examDetailsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                console.log(data);
                
                // Populate Exam Details
                document.getElementById('exam-title').textContent = data.title;
                document.getElementById('exam-total-questions').textContent = data.total_questions;
                document.getElementById('exam-total-marks').textContent = data.total_mark;
                
                document.getElementById('exam-last-date').textContent = new Date(data.last_date).toLocaleDateString();
                document.getElementById('exam-negative-marks').textContent = data.negative_mark || 'N/A';
                if (!data.last_date){
                    document.getElementById('exam-starting-time').textContent = new Date(data.starting_time).toLocaleTimeString();
                }
                
                document.getElementById('exam-duration').textContent = data.duration || 'N/A';
                document.getElementById('exam-category').textContent = data.category_name || 'N/A';
                document.getElementById('exam-status').textContent = data.status || 'N/A';

                // Populate Questions Table
                // const questionsList = document.getElementById('questions-list');
                // questionsList.innerHTML = ''; // Clear previous data
                // data.questions.forEach((question, index) => {
                //     const optionsHTML = question.options.map(option => `<li>${option.text}</li>`).join('');
                //     const rowHTML = `
                //         <tr>
                //             <td>${index + 1}</td>
                //             <td>${question.text}</td>
                //             <td><ul>${optionsHTML}</ul></td>
                //             <td>${question.options.find(option => option.is_correct)?.text || 'N/A'}</td>
                //         </tr>
                //     `;
                //     questionsList.innerHTML += rowHTML;
                // });
            }
        })
        .catch(error => console.error('Error fetching exam details:', error));
    }

    function fetchSubjectCounts() {
        fetch(subjectCountsUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data) {
                // console.log(data);
                const subjectList = document.getElementById('subject-list');
                subjectList.innerHTML = ''; // Clear previous data
                data.forEach(subject => {
                    const subjectDiv = document.createElement('div');
                    subjectDiv.className = 'subject-item'; // Add a class for styling (optional)
                    subjectDiv.textContent = `${subject.subject_name}: ${subject.question_count}`;
                    subjectList.appendChild(subjectDiv);
                });
            }
        })
        .catch(error => console.error('Error fetching subject counts:', error));
    }

    // Fetch the exam details and subjects on page load
    fetchExamDetails();
    fetchSubjectCounts();
    const startExam = document.getElementById('start-exam');
    startExam.addEventListener('click', function() {
        window.location.href = `/quiz/start_exam/${examId}/`;
    });
    // Redirect to the leaderboard page when the button is clicked
    document.getElementById('leaderboard-btn').addEventListener('click', function () {
        window.location.href = leaderboardUrl;
    });

    const result = document.getElementById('result-btn');
    result.addEventListener('click', function () {
        window.location.href = `/quiz/result/${examId}/`;
    });
});
