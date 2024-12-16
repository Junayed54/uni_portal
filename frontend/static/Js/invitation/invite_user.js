document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }
    const examId = window.location.href.split('/')[5];
    console.log(examId);
    // Populate the exams dropdown
    // fetch('/quiz/exams/student_exam_list/', {
    //     method: 'GET',
    //     headers: {
    //         'Authorization': 'Bearer ' + accessToken,
    //     }
    // })
    // .then(response => response.json())
    // .then(data => {
    //     const examSelect = document.getElementById('exam-select');
    //     data.forEach(exam => {
    //         const option = document.createElement('option');
    //         option.value = exam.exam_id;
    //         option.textContent = exam.title;
    //         examSelect.appendChild(option);
    //     });
    // })
    // .catch(error => console.error('Error fetching exams:', error));

    // Populate the users dropdown
    fetch('/quiz/students/', {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        }
    })
    .then(response => response.json())
    .then(data => {
        // const userSelect = document.getElementById('user-select');
        const userSelect= document.getElementById('user-select');
        data.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = user.username;  // or user.email if preferred
            // userSelect.appendChild(option);
            userSelect.appendChild(option);
        });
    })
    .catch(error => console.error('Error fetching students:', error));

    // Handle form submission
    document.getElementById('invite-form').addEventListener('submit', function(event) {
        event.preventDefault();
        
        // const examId = document.getElementById('exam-select').value;
        const selectedUsers = Array.from(document.getElementById('user-select').selectedOptions)
                                   .map(option => option.value);

        if (!examId || selectedUsers.length === 0) {
            document.getElementById('message').textContent = 'Please select an exam and at least one user.';
            return;
        }
        console.log(selectedUsers);
        // Prepare invitations for all selected users
        selectedUsers.forEach(userId => {
            fetch(`/api/invite-user/${examId}/`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ user_id: userId })
            })
            .then(response => response.json())
            .then(data => {
                console.log(data);
                document.getElementById('message').textContent = 'Invitations sent successfully!';
            })
            .catch(error => {
                console.error('Error sending invitation:', error);
                document.getElementById('message').textContent = 'Failed to send invitations.';
            });
        });
    });
});
