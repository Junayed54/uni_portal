document.addEventListener('DOMContentLoaded', function () {
    const accessToken = localStorage.getItem('access_token');

    fetch(`/quiz/teachers`, {
        method: 'GET',
        headers: {
            'Authorization': 'Bearer ' + accessToken,
        }
    })
    .then(response => response.json())
    .then(data => {
        const teacherSelect = document.getElementById('teachers');
        
        teacherSelect.innerHTML = '<option selected disabled value="">Choose...</option>'; // Reset options
        const allOption = document.createElement('option');
        allOption.value = 'All';
        allOption.textContent = 'All';
        teacherSelect.appendChild(allOption);

        if (Array.isArray(data)) {
            data.forEach(teacher => {
                const option = document.createElement('option');
                option.value = teacher.id;
                option.textContent = teacher.username;
                teacherSelect.appendChild(option);
            });
        } else {
            console.error('Unexpected data format:', data);
        }
    })
    .catch(error => console.error('Error loading teachers:', error));
});

document.getElementById('filter-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const formData = new FormData(this);
    const userId = formData.get('teacher_id');
    const month = formData.get('month');
    const year = formData.get('year');

    console.log("Selected User ID:", userId); // Debugging check

    fetch(`/quiz/teacher-summary/`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            user_id: userId,
            month: month,
            year: year
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Check the data

        const resultDiv = document.getElementById('results');
        resultDiv.innerHTML = ''; // Clear previous results

        // Check if user ID is 'All' to display summary for all teachers
        if (userId.toLowerCase() === 'all' && data.overall_summary) {
            // Overall summary for all teachers
            const summaryDiv = document.createElement('div');
            summaryDiv.innerHTML = `
                <h3>Overall Category Summary</h3>
                <ul>
                    ${data.overall_summary.map(cat => `<li>${cat.category_name}: ${cat.question_count} questions</li>`).join('')}
                </ul>
            `;
            resultDiv.appendChild(summaryDiv);

            const teachersDiv = document.createElement('div');
            teachersDiv.innerHTML = `<h3>Teachers Summary</h3>`;
            data.individual_teachers.forEach(item => {
                const userDiv = document.createElement('div');
                userDiv.innerHTML = `
                    <h4>${item.username}</h4>
                    <p>Total Questions: ${item.total_questions}</p>
                    <ul>
                        ${item.categories.map(cat => `<li>${cat.category_name}: ${cat.question_count} questions</li>`).join('')}
                    </ul>
                `;
                teachersDiv.appendChild(userDiv);
            });

            resultDiv.appendChild(teachersDiv);
        } else if (data.length > 0) {
            // Specific summary for one teacher
            const user = data[0]; // Access the first element in the array
            const userDiv = document.createElement('div');
            userDiv.innerHTML = `
                <h3>${user.username || 'Teacher Details'}</h3>
                <p>Total Questions: ${user.total_questions}</p>
                <ul>
                    ${user.categories.map(cat => 
                        `<li>${cat.category_name}: ${cat.question_count} questions</li>`
                    ).join('')}
                </ul>
            `;
            resultDiv.appendChild(userDiv);
        } else {
            resultDiv.innerHTML = `<p>No data available for the selected teacher or period.</p>`;
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
