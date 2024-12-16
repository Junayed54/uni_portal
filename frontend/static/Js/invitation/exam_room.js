document.addEventListener('DOMContentLoaded', () => {
    const examId = window.location.href.split('/')[5];  // Dynamically get the exam ID
    const token = localStorage.getItem('access_token'); // Get the JWT token from localStorage

    const startExamBtn = document.getElementById('start-exam-btn');
    startExamBtn.classList.add('d-none');
    const nextQuestionBtn = document.getElementById('next-question-btn');
    const questionText = document.getElementById('question-text');
    const optionsList = document.getElementById('options-list');
    const scoreList = document.getElementById('score-list');
    const questionNumberElement = document.getElementById('question-number'); // Display question number
    const totalQuestionsElement = document.getElementById('total-questions'); // Display total number of questions
    const scoreElement = document.getElementById('score'); // Display user score
    const userScoresList = document.getElementById('user-scores-list'); // List for user scores

    const wsUrl = `ws://127.0.0.1:8000/ws/exam/${examId}/`; // WebSocket URL without token
    let socket;

    // Initialize WebSocket
    function initializeWebSocket() {
        socket = new WebSocket(wsUrl);

        socket.onopen = function () {
            console.log('WebSocket connected.');
            startExamBtn.disabled = false;  // Enable start button after connection

            // Send authentication message with the token
            socket.send(JSON.stringify({
                action: 'authenticate',
                token: token
            }));
        };

        socket.onmessage = function (event) {
            const data = JSON.parse(event.data);

            if (data.action === 'question') {
                displayQuestion(data);  // Update UI for question display
            } else if (data.action === 'exam_complete') {
                completeExam(data);  // Handle exam completion
            } else if (data.action === 'score_update') {
                updateScore(data);  // Update score
            } else if (data.action === 'user_scores') {
                console.log('User scores:', data.scores);
                updateUserScores(data);  // Update user scores
            
            } else if (data.action==='active_users') {
                updateActiveUsers(data.users);
            } else if (data.error) {
                alert(data.error);
            }
        };

        socket.onclose = function () {
            console.log('WebSocket disconnected.');
        };

        socket.onerror = function (error) {
            console.error('WebSocket error:', error);
            alert('WebSocket error occurred. Please try again.');
        };
    }

    // Display the current question, options, question number, and score
    function displayQuestion(data) {
        questionText.innerText = data.question;
        optionsList.innerHTML = '';  // Clear old options

        // Display options
        data.options.forEach((option, index) => {
            const optionItem = document.createElement('button');
            optionItem.className = 'list-group-item list-group-item-action mb-2';
        
            // Add option number (index + 1) before the option text
            optionItem.innerText = `${index + 1}. ${option.text}`;
            
            optionItem.onclick = () => submitAnswer(data.question_id, option.id);
            optionsList.appendChild(optionItem);
        });
        

        // Update the question number, total number of questions, and score
        questionNumberElement.innerText = `${data.current_question_number}. Question`;  // Example: "1. Question"
        totalQuestionsElement.innerText = `Total Questions: ${data.total_questions}`;
        scoreElement.innerText = `Score: ${data.score}`;

        // startExamBtn.classList.add('d-none');  // Hide start button after starting exam
        nextQuestionBtn.classList.remove('d-none');  // Show next question button
    }

    // Complete the exam
    function completeExam(data) {
        questionText.innerText = data.message;
        optionsList.innerHTML = '';  // Clear options
        nextQuestionBtn.classList.add('d-none');  // Hide next question button
    }

    // Update the score list with each question
    function updateScore(data) {
        // const scoreItem = document.createElement('li');
        // scoreItem.className = 'list-group-item';
        // scoreItem.innerText = `${data.correct ? 'Correct' : 'Wrong'}`;
        // scoreList.appendChild(scoreItem);

        // // Update displayed score
        // scoreElement.innerText = `Score: ${data.score}`;
    }

    // Update the user scores list
    function updateUserScores(data) {
        userScoresList.innerHTML = ''; // Clear existing scores
        data.scores.forEach(user => {
            const scoreItem = document.createElement('li');
            scoreItem.className = 'list-group-item';
            scoreItem.innerText = `${user.username}: ${user.score}`; // Adjust property names as necessary
            userScoresList.appendChild(scoreItem);
        });
    }

    // Start Exam button handler
    startExamBtn.addEventListener('click', () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                action: 'start_exam',
                exam_id: examId
            }));
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
    });

    // Next Question button handler
    nextQuestionBtn.addEventListener('click', () => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                action: 'next_question',
                exam_id: examId
            }));

            questionText.innerHTML = 'Loading next question...';
            optionsList.innerHTML = '';
            nextQuestionBtn.classList.add('d-none');
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
    });

    // Submit answer
    function submitAnswer(questionId, optionId) {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({
                action: 'submit_answer',
                exam_id: examId,
                question_id: questionId,
                selected_option_id: optionId
            }));

            const buttons = optionsList.querySelectorAll('button');
            buttons.forEach(button => button.disabled = true);
        } else {
            console.error('WebSocket is not open. Cannot send message.');
        }
    }

    function updateActiveUsers(users) {
        const activeUsersTableBody = document.getElementById('active-users-table-body');
        activeUsersTableBody.innerHTML = '';  // Clear the current table body
    
        // Convert the users object into an array of entries (username, score)
        Object.entries(users).forEach(([username, score]) => {
            // Create a new row for each active user
            const row = document.createElement('tr');
            
            // Create a cell for the username
            const usernameCell = document.createElement('td');
            const span = document.createElement('span');
            span.className = "badge bg-success-transparent"
            span.innerText = username;
            usernameCell.appendChild(span);
            row.appendChild(usernameCell);
    
            // Create a cell for the score
            const scoreCell = document.createElement('td');
            scoreCell.innerText = score;
            row.appendChild(scoreCell);
    
            // Append the row to the table body
            activeUsersTableBody.appendChild(row);
        });
    }
    

    // Initialize WebSocket on page load
    initializeWebSocket();
});
