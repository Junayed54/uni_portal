document.addEventListener('DOMContentLoaded', function() {
    // URL to the API endpoint
    let userId = window.location.href.split('/')[5];
    // console.log(userId);
    const apiUrl = `/quiz/user-exam-summary/${userId}`;
    
    // Fetch data from API
    fetch(apiUrl, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('access_token')}` // Use the JWT token if required
        },
        // body: JSON.stringify({  // Send userId in the request body
        //     user_id: userId
        // })
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        
        // Populate data into HTML using Vanilla JavaScript
        document.getElementById('username').textContent = data.username || "User";
        document.getElementById('total-attempts').textContent = `${data.total_attempts}`;
        document.getElementById('total-passed').textContent = `${data.total_passed}`;
        document.getElementById('total-failed').textContent = `${data.total_failed}`;
        const elements = document.getElementsByClassName('total-question');
        for (let element of elements) {
            element.textContent = `${data.total_questions}`;
        }
        //.textContent = `${data.total_questions}`;
        document.getElementById('total-answered').textContent = data.total_answered;
        document.getElementById('total-unanswered').textContent = data.total_unanswered;
        document.getElementById('total-correct-answers').textContent = data.total_correct_answers;
        document.getElementById('total-wrong-answers').textContent = data.total_wrong_answers;
    })
    .catch(error => console.error('Error fetching exam summary:', error));


    
});


// Function to create the line chart for correct answers
document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/quiz/attempts/all_attempts/';
    let user_id = window.location.href.split('/')[5];

    // Fetch data and update chart based on the selected time period
    function fetchDataAndCreateChart(timePeriod = 'all') {
        fetch(`${apiUrl}?time_period=${timePeriod}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`
            },
            body: JSON.stringify({ user_id: user_id }) // Send userId in the request body
        })
        .then(response => response.json())
        .then(data => {
            console.log("API Response:", data);

            // Extract labels and detailed data for tooltips
            const labels = data.map(attempt => new Date(attempt.attempt_time).toLocaleDateString());
            const correctAnswers = data.map(attempt => attempt.correct_answers);
            const examTitles = data.map(attempt => attempt.exam_title);
            const obtainedMarks = data.map(attempt => attempt.obtained_marks);
            const percentages = data.map(attempt => attempt.percentage);
            const totalQuestions = data.map(attempt => attempt.total_questions);
            const wrongAnswers = data.map(attempt => attempt.wrong_answers);

            // Reverse the data for reversed X-axis
            const reversedLabels = labels.reverse();
            const reversedCorrectAnswers = correctAnswers.reverse();
            const reversedExamTitles = examTitles.reverse();
            const reversedObtainedMarks = obtainedMarks.reverse();
            const reversedPercentages = percentages.reverse();
            const reversedTotalQuestions = totalQuestions.reverse();
            const reversedWrongAnswers = wrongAnswers.reverse();

            if (reversedLabels.length > 0 && reversedCorrectAnswers.length > 0) {
                createCorrectAnswersLineChart(
                    reversedLabels,
                    reversedCorrectAnswers,
                    reversedExamTitles,
                    reversedObtainedMarks,
                    reversedPercentages,
                    reversedTotalQuestions,
                    reversedWrongAnswers
                );
            } else {
                console.error('No exam attempts data available for the selected time period.');
            }
        })
        .catch(error => console.error('Error fetching exam attempts:', error));
    }

    // Initialize the line chart with tooltips showing detailed exam information
    function createCorrectAnswersLineChart(labels, correctAnswers, examTitles, obtainedMarks, percentages, totalQuestions, wrongAnswers) {
        const ctx = document.getElementById('correctAnswersChart').getContext('2d');

        // Destroy previous chart instance if it exists
        if (window.correctAnswersChart instanceof Chart) {
            window.correctAnswersChart.destroy();
        }

        window.correctAnswersChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels, // Reversed labels
                datasets: [{
                    label: 'Correct Answers per Attempt',
                    data: correctAnswers, // Reversed correct answers
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 123, 255, 0.2)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                plugins: {
                    tooltip: {
                        callbacks: {
                            // Customize tooltip to include detailed exam information
                            label: function (tooltipItem) {
                                const index = tooltipItem.dataIndex;
                                const title = examTitles[index];
                                const correct = correctAnswers[index];
                                const marks = obtainedMarks[index];
                                const percentage = percentages[index];
                                const total = totalQuestions[index];
                                const wrong = wrongAnswers[index];
                                return [
                                    `Exam: ${title}`,
                                    `Correct: ${correct}`,
                                    `Marks: ${marks}`,
                                    `Percentage: ${percentage}%`,
                                    `Total Questions: ${total}`,
                                    `Wrong Answers: ${wrong}`,
                                ];
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Attempt Date'
                        },
                        reverse: true // Reverse X-axis order
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Correct Answers'
                        }
                    }
                },
                responsive: true
            }
        });
    }

    // Initial fetch for 'all' time period
    fetchDataAndCreateChart('all');

    // Add event listeners for the time period radio buttons
    const radioButtons = document.getElementsByName('timePeriod');
    radioButtons.forEach(radio => {
        radio.addEventListener('change', function () {
            fetchDataAndCreateChart(this.value);
        });
    });
});




async function loadExams() {
    try {
        let user_id = window.location.href.split('/')[5];
        const response = await fetch('/quiz/attempts/highest_attempts/', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({  // Send userId in the request body
                user_id: user_id
            })
        });

        if (!response.ok) {
            throw new Error('Failed to fetch exam attempts.');
        }

        const data = await response.json();
        const examList = document.getElementById('examList');
        examList.innerHTML = ''; // Clear previous content
        console.log("exam and attempts", data);

        data.exams.forEach((exam, index) => {
            const examItem = document.createElement('div');
            examItem.className = 'accordion-item';

            // Exam Header with Toggle Button
            examItem.innerHTML = `
                <h2 class="accordion-header" id="heading${index}">
                    <button class="accordion-button collapsed bg-secondary text-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
                        Exam title: ${exam.exam_title}
                    </button>
                </h2>
                <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#examList">
                    <div class="accordion-body">
                        <div class="row">
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Total questions: ${exam.total_questions}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Answered: ${exam.highest_attempt.answered}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Total Correct Answers: ${exam.highest_attempt.total_correct_answers}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Wrong Answers: ${exam.highest_attempt.wrong_answers}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Passed Mark: ${exam.passed_marks}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Attempt Time: ${new Date(exam.highest_attempt.attempt_time).toLocaleString()}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Participated: ${exam.unique_participants}</li>
                            </div>
                            <div class="col-6 mb-2">
                                <li class="list-group-item">Position: ${exam.highest_attempt.position}</li>
                            </div>
                        </div>
                        <!-- Create a canvas for the chart -->
                        <div class="row mt-3">
                            <div class="col-12">
                                <canvas id="attemptChart${index}" width="400" height="200"></canvas>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Append the exam item to the exam list
            examList.appendChild(examItem);

            // Add event listener to the collapse event (when the accordion expands)
            const collapseElement = document.getElementById(`collapse${index}`);
            collapseElement.addEventListener('show.bs.collapse', function () {
                // Trigger the API call when the accordion is expanded
                viewUserAttemptsDetails(user_id, exam.exam_id, index);
            });
        });
    } catch (error) {
        console.error(error);
        alert('Error loading exams. Please try again.');
    }
}

function viewUserAttemptsDetails(userId, examId, index) {
    // console.log("index", index);
    const accessToken = localStorage.getItem('access_token');  // Get token
    fetch(`/quiz/attempts/user_attempts/?exam_id=${examId}&user_id=${userId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        // Call the function to create a chart for this exam's attempts
        showUserAttemptsDetails(data, index);

    })
    .catch(error => console.error('Error fetching user attempts details:', error));
}


let attemptChart; // Variable to hold the chart instance

function showUserAttemptsDetails(data, index) {
    const labels = data.map(attempt => new Date(attempt.attempt_time).toLocaleDateString());
    const correctData = data.map(attempt => attempt.total_correct_answers);
    const wrongData = data.map(attempt => attempt.wrong_answers);

    // Destroy previous chart instance if it exists
    if (attemptChart) {
        attemptChart.destroy();
    }

    // Create a new chart instance with dynamic canvas ID for each exam
    const ctx = document.getElementById(`attemptChart${index}`).getContext('2d');
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
                    borderWidth: 1,
                    barThickness: 20
                },
                {
                    label: 'Wrong Answers',
                    data: wrongData,
                    backgroundColor: 'rgba(255, 0, 0, 0.6)',
                    borderColor: 'red',
                    borderWidth: 1,
                    barThickness: 20
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






// async function loadExams() {
//     try {
//         let user_id = window.location.href.split('/')[5];
//         const response = await fetch('/quiz/attempts/highest_attempts/', {
//             method: 'POST',
//             headers: {
//                 'Authorization': `Bearer ${localStorage.getItem('access_token')}`,  // Add authentication token if needed
//                 'Content-Type': 'application/json'
//             },
//             body: JSON.stringify({  // Send userId in the request body
//                     user_id: user_id
//             })
//         });

//         if (!response.ok) {
//             throw new Error('Failed to fetch exam attempts.');
//         }

//         const data = await response.json();
//         const examList = document.getElementById('examList');
//         examList.innerHTML = ''; // Clear previous content
//         console.log("exam and attempts", data);
//         data.exams.forEach((exam, index) => {
//             const examItem = document.createElement('div');
//             examItem.className = 'accordion-item';

//             // Exam Header with Toggle Button
//             examItem.innerHTML = `
//                 <h2 class="accordion-header" id="heading${index}">
//                     <button class="accordion-button collapsed bg-secondary text-white" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}" aria-expanded="false" aria-controls="collapse${index}">
//                         Exam title: ${exam.exam_title}
//                     </button>
//                 </h2>
//                 <div id="collapse${index}" class="accordion-collapse collapse" aria-labelledby="heading${index}" data-bs-parent="#examList">
//                     <div class="accordion-body">
//                         <div class="row">
//                             <div class="col-6 mb-2">
//                                 <li class="list-group-item">Total questions: ${exam.total_questions}</li>
//                             </div>
//                             <div class="col-6 mb-2">
//                                 <li class="list-group-item">Answered: ${exam.highest_attempt.answered}</li>
//                             </div>
//                             <div class="col-6 mb-2">
//                                 <li class="list-group-item">Total Correct Answers: ${exam.highest_attempt.total_correct_answers}</li>
//                             </div>
//                             <div class="col-6 mb-2">
//                                 <li class="list-group-item">Wrong Answers: ${exam.highest_attempt.wrong_answers}</li>
//                             </div>
//                             <div class="col-6 mb-2">
//                                 <li class="list-group-item">Passed Mark: ${exam.passed_marks}</li>
//                             </div>
//                             <div class="col-6 mb-2">
//                                 <li class="list-group-item">Attempt Time: ${new Date(exam.highest_attempt.attempt_time).toLocaleString()}</li>
//                             </div>
//                             <div class="col-6 mb-2">
//                                 <li class="list-group-item">Participated: ${exam.unique_participants}</li>
//                             </div>
//                             <div class="col-6 mb-2">
//                                 <li class="list-group-item">Position: ${exam.highest_attempt.position}</li>
//                             </div>
//                         </div>
//                     </div>


//                 </div>
//             `;

//             // Append the exam item to the exam list
//             examList.appendChild(examItem);
//         });
//     } catch (error) {
//         console.error(error);
//         alert('Error loading exams. Please try again.');
//     }
// }

// Load exams when the page is loaded
document.addEventListener('DOMContentLoaded', loadExams);


//Quistions
document.addEventListener("DOMContentLoaded", function () {
    fetchSubmittedQuestions();
});

// Fetch submitted questions and update UI
function fetchSubmittedQuestions() {
    let user_id = window.location.href.split('/')[5];
    fetch('/quiz/user-answers/all-submitted-questions/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + localStorage.getItem('access_token')
        },
        body: JSON.stringify({  // Send userId in the request body
            user_id: user_id
        })
    })
    .then(response => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        console.log("Fetched data:", data);
        
        updateQuestionCounts(data);
        setupClickListeners(data);
    })
    .catch(error => console.error('Error fetching questions:', error));
}

// Update counts of questions
function updateQuestionCounts(data) {
    
    document.getElementById('total-questions').innerText = data.submitted_questions.length;
    document.getElementById('total-answered').innerText = data.submitted_questions.length;
    document.getElementById('total-correct-answers').innerText = data.correct_answers.length;
    document.getElementById('total-wrong-answers').innerText = data.wrong_answers.length;
}
//
// Set up click listeners for question rows
function setupClickListeners(data) {
    document.querySelectorAll('.question-row').forEach(row => {
        row.addEventListener('click', function () {
            const type = this.getAttribute('data-type');
            let questionsToDisplay = [];

            // Determine which questions to display
            switch (type) {
                
                case 'answered':
                    questionsToDisplay = data.submitted_questions;
                    break;
                case 'correct':
                    questionsToDisplay = data.correct_answers;
                    break;
                case 'wrong':
                    questionsToDisplay = data.wrong_answers;
                    break;
                default:
                    console.error("Unknown question type:", type);
                    return;
            }

            displayQuestions(questionsToDisplay, type);
        });
    });
}

// Display questions in the container with options
// Set the number of items per page
// Set the number of questions to display per page
// Set the number of questions to display per page
const itemsPerPage = 5;
let currentPage = 1;
let globalQuestions = []; // Store questions globally as an array
let globalType = ''; // Store type globally

function displayQuestions(questions = [], type) {
    globalQuestions = Array.isArray(questions) ? questions : [];
    globalType = type;

    const questionListContainer = document.getElementById("questionListContainer");
    const chart = document.getElementById('chart');
    chart.classList.add('d-none');
    const questions_show = document.getElementById('questions');
    questions_show.classList.remove('d-none');
    questionListContainer.innerHTML = '';

    if (globalQuestions.length === 0) {
        questionListContainer.innerHTML = '<p>No questions to display.</p>';
        return;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedQuestions = globalQuestions.slice(startIndex, endIndex);

    paginatedQuestions.forEach((item, index) => {
        const { question, selected_option, is_correct } = item;
        const options = question.options.map(opt => {
            let className = 'option-item'; // Base class for all options
            let bgColor = 'bg-light'; // Default background color

            if (type === 'wrong' && opt.id === selected_option.id) {
                className += ' text-danger';
                bgColor = 'bg-warning'; // Highlight wrong selected option
            }
            if (opt.is_correct) {
                className += ' text-white';
                bgColor = 'bg-success'; // Correct answer background color
            }
            return `
                <li class="list-group-item ${className} ${bgColor}">
                    ${opt.text}
                </li>
            `;
        }).join('');

        const questionCard = `
            <div class="card mb-2">
                <div class="card-header">
                    <h5>Question ${startIndex + index + 1}: ${question.text}</h5>
                </div>
                <div class="card-body">
                    <p><strong>Your Answer:</strong> ${selected_option ? selected_option.text : "Not answered"}</p>
                    <p><strong>Status:</strong> <span class="${is_correct ? 'text-success' : 'text-danger'}">
                        ${is_correct ? 'Correct' : 'Wrong'}
                    </span></p>
                    <p><strong>Options:</strong></p>
                    <ul class="list-group list-group-horizontal row-options">
                        ${options}
                    </ul>
                </div>
            </div>
        `;
        questionListContainer.insertAdjacentHTML('beforeend', questionCard);
    });

    updatePaginationControls(globalQuestions.length);
}

function updatePaginationControls(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const prevButton = document.getElementById("prevPage");
    const nextButton = document.getElementById("nextPage");
    const pageInfo = document.getElementById("pageInfo");

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;

    pageInfo.innerText = `Page ${currentPage} of ${totalPages}`;
}

function changePage(direction) {
    currentPage += direction;
    displayQuestions(globalQuestions, globalType);
}

// Sample Pagination Controls in HTML
document.getElementById("questions").insertAdjacentHTML('beforeend', `
    <div class="pagination-container mt-4">
        <button id="prevPage" class="btn btn-secondary" onclick="changePage(-1)" disabled>Previous</button>
        <span id="pageInfo" class="mx-2">Page 1</span>
        <button id="nextPage" class="btn btn-secondary" onclick="changePage(1)">Next</button>
    </div>
`);

