document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    fetch('/quiz/status/draft_exams/', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        }
    })
    .then(response => response.json())
    .then(data => {
        const examsContainer = document.getElementById('exams-container');
        console.log(data);
        data.forEach(exam => {
            const examElement = document.createElement('div');
            examElement.classList.add('card', 'p-4');
            examElement.innerHTML = `
                <h2 class="card-title">${exam.exam_details['title']}</h2>
                <p class="card-text">Total Questions: ${exam.exam_details['total_questions']}</p>
                <p class="card-text">Total Marks: ${exam.exam_details['total_marks']}</p>
                <p class="card-text">Last Date: ${exam.exam_details['last_date']}</p>
                <div class="d-flex justify-between mt-4">
                    <div class="bg-primary rounded p-3 mt-2">
                        <a href="/quiz/teacher_exam_details/${exam.exam}/" class="text-white text-decoration-none">View Exam</a>
                    </div>
                    <div class="bg-secondary rounded p-2 mt-2">
                        <button class="send-btn text-white" data-status-id="${exam.id}">Send Admin</button>
                    </div>
                    <div class="bg-danger rounded p-2 mt-2">
                        <button class="delete-btn text-white" data-exam-id="${exam.exam}">Delete Exam</button>
                    </div>
                </div>
            `;
            examsContainer.appendChild(examElement);
        });

        document.querySelectorAll('.send-btn').forEach(button => {
            button.addEventListener('click', function() {
                const statusId = this.getAttribute('data-status-id');
                if (confirm('Are you sure you want to send this exam to admin?')) {
                    fetch(`/quiz/status/${statusId}/submit_to_admin/`, {
                        method: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + accessToken,
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            alert('Exam Sent to Admin successfully.');
                            window.location.reload();
                        } else {
                            response.json().then(data => alert('Error sending exam: ' + data.error));
                        }
                    })
                    .catch(error => console.error('Error:', error));
                }
            });
        });

        document.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', function() {
                const examId = this.getAttribute('data-exam-id');
                if (confirm('Are you sure you want to delete this exam?')) {
                    fetch(`/quiz/exams/${examId}/`, {
                        method: 'DELETE',
                        headers: {
                            'Authorization': 'Bearer ' + accessToken,
                        }
                    })
                    .then(response => {
                        if (response.ok) {
                            alert('Exam deleted successfully.');
                            window.location.reload();
                        } else {
                            response.json().then(data => alert('Error deleting exam: ' + data.error));
                        }
                    })
                    .catch(error => console.error('Error:', error));
                }
            });
        });
    })
    .catch(error => console.error('Error:', error));
});
