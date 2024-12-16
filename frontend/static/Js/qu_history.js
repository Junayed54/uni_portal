document.addEventListener('DOMContentLoaded', function () {
    // Populate the 'year' dropdown with a range of years (e.g., from 2000 to current year)
    const yearSelect = document.getElementById('year');
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= 2000; i--) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        yearSelect.appendChild(option);
    }

    // Handle form submission
    const form = document.getElementById('question-history-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Get selected year and month
        const year = document.getElementById('year').value;
        const month = document.getElementById('month').value;

        if (!year || !month) {
            alert('Please select both year and month');
            return;
        }

        // Fetch question history from the API
        fetch(`/quiz/question-history/?year=${year}&month=${month}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);

            // Clear previous results
            const questionList = document.getElementById('question-list');
            const totalQuestions = document.getElementById('total-questions');
            questionList.innerHTML = '';

            // Check if there are questions
            if (data.length > 0) {
                totalQuestions.textContent = data.length;  // Set the total question count

                data.forEach(question => {
                    // Create a row for each question
                    const row = document.createElement('tr');

                    // Question text
                    const questionTextCell = document.createElement('td');
                    questionTextCell.textContent = question.text;

                    // Created by
                    const createdByCell = document.createElement('td');
                    createdByCell.textContent = question.created_by;

                    // Created at
                    const createdAtCell = document.createElement('td');
                    const createdAtDate = new Date(question.created_at);
                    createdAtCell.textContent = createdAtDate.toLocaleDateString();

                    // Append cells to row
                    row.appendChild(questionTextCell);
                    row.appendChild(createdByCell);
                    row.appendChild(createdAtCell);

                    // Append row to table body
                    questionList.appendChild(row);
                });
            } else {
                totalQuestions.textContent = '0';  // No questions found
                const noDataRow = document.createElement('tr');
                const noDataCell = document.createElement('td');
                noDataCell.colSpan = 3;
                noDataCell.classList.add('text-danger', 'text-center');
                noDataCell.textContent = 'No questions available for the selected month.';
                noDataRow.appendChild(noDataCell);
                questionList.appendChild(noDataRow);
            }
        })
        .catch(error => {
            console.error('Error fetching question history:', error);
            alert('Failed to fetch question history.');
        });
    });
});
