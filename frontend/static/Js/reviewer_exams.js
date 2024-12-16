document.addEventListener('DOMContentLoaded', function() {
    // Function to fetch assigned exams
    function fetchAssignedExams() {
        fetch('/quiz/status/my_assigned_exams/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token'),  // Assuming JWT token is stored in localStorage
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            populateExams(data);
        })
        .catch(error => {
            console.error('Error fetching exams:', error);
        });
    }

    // Function to dynamically populate the exams
    function populateExams(exams) {
        const examsContainer = document.getElementById('exams-container');
        examsContainer.innerHTML = '';  // Clear any existing content

        if (exams.length === 0) {
            examsContainer.innerHTML = '<p class="text-center">No exams assigned for review.</p>';
            return;
        }

        const examCards = exams.map(exam => `
            <div class="col-12 col-sm-6 col-md-4">
                <div class="card h-100">
                    <div class="card-body">
                       
                        <h5 class="card-title" style="color:#5ca904;">${exam.exam_details['title']}</h5>
                        
                        <div class="d-flex my-4" style="gap:5px;">
                            <div class="p-2 rounded text-white" style="background-color: #808080">${exam.exam_details['total_questions']} Ques.</div>
                            <div class="p-2 rounded text-white" style="background-color: #808080">${exam.exam_details['total_marks']} Marks</div>
                            <div class="p-2 rounded text-white" style="background-color: #808080">${exam.exam_details['duration']} Sec</div>
                        </div>

                        
                        <h6 class="text-muted">Examiner: <span class="text-secondary" style="font-weight:bold;">${exam.exam_details['created_by']}</span></h6>
                        <h6 class="text-muted">Package: <span class="text-info">${exam.exam_details['title']}</span></h6>
                        <a href="/quiz/exam_check/${exam.exam}/" class="btn btn-primary mt-3">Review Exam</a>
                    </div>
                </div>
            </div>
        `).join('');
        
        examsContainer.innerHTML = examCards;
        
    }

    // Call the function to fetch and display the exams
    fetchAssignedExams();
});