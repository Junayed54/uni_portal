document.addEventListener('DOMContentLoaded', function () {
    const accessToken = window.localStorage.getItem('access_token');
    const apiUrl = `/quiz/questions/question_bank/`;

    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    const loader = document.getElementById('loading');
    const tableContainer = document.getElementById('table-container');
    const questionList = document.getElementById('question-list');
    const downloadBtn = document.getElementById('download-btn');
    const paginationContainer = document.getElementById('pagination');

    const pageSize = 10; // Number of questions per page
    let currentPage = 1; // Start on the first page
    let totalQuestions = 0; // Total number of questions

    function showLoader() {
        loader.style.display = 'block'; // Show the loader
        tableContainer.style.display = 'none'; // Hide the table during loading
    }

    function hideLoader() {
        loader.style.display = 'none'; // Hide the loader
        tableContainer.style.display = 'block'; // Show the table once data is loaded
    }

    function fetchQuestions(page) {
        showLoader(); // Show loader before fetching data

        fetch(`${apiUrl}?page=${page}&page_size=${pageSize}`, {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            hideLoader(); // Hide the loader after data is fetched

            if (!data.results || data.results.length === 0) {
                questionList.innerHTML = '<tr><td colspan="10">No questions available</td></tr>';
                
                totalQuestions = 0; // Reset total questions
                updatePagination(); // Update pagination
                return;
            }

            totalQuestions = data.count; // Set total questions
            questionList.innerHTML = '';

            data.results.forEach((question, index) => {
                const rowHTML = `
                    <tr>
                        <td>${(page - 1) * pageSize + index + 1}</td>
                        <td>${question.text}</td>
                        <td>${question.options[0]?.text || ''}</td>
                        <td>${question.options[1]?.text || ''}</td>
                        <td>${question.options[2]?.text || ''}</td>
                        <td>${question.options[3]?.text || ''}</td>
                        <td>${question.options.find(option => option.is_correct)?.text || ''}</td>
                        <td>${question.options.length}</td>
                        <td>${question.category_name}</td>
                        <td>${question.difficulty_level}</td>
                    </tr>
                `;
                questionList.innerHTML += rowHTML;
            });

            updatePagination();
            document.getElementById('buttons').classList.remove('d-none');
        })
        .catch(error => {
            console.error('Error fetching questions:', error);
            hideLoader(); // Hide loader in case of an error
        });
    }

    function updatePagination() {
        paginationContainer.innerHTML = ''; // Clear previous pagination
    
        const totalPages = Math.ceil(totalQuestions / pageSize); // Calculate total pages
    
        if (totalPages <= 1) {
            return; // No need for pagination if there's only one page
        }
    
        // Create the "Prev" button
        const prevItem = document.createElement('li');
        prevItem.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`; // Disable if on first page
    
        const prevLink = document.createElement('a');
        prevLink.className = 'page-link';
        prevLink.textContent = 'Prev';
        prevLink.href = 'javascript:void(0);'; // Prevent default link behavior
        prevLink.addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage > 1) {
                currentPage--;
                fetchQuestions(currentPage);
            }
        });
    
        prevItem.appendChild(prevLink);
        paginationContainer.appendChild(prevItem);
    
        const maxPagesToShow = 3; // Number of pages to show in the middle
        const startPage = Math.max(currentPage - 1, 1);
        const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);
    
        // Always show the first two pages
        for (let i = 1; i <= Math.min(2, totalPages); i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`; // Highlight the current page
            const pageLink = document.createElement('a');
            pageLink.className = 'page-link';
            pageLink.textContent = i;
            pageLink.href = 'javascript:void(0);';
            pageLink.addEventListener('click', function (e) {
                e.preventDefault();
                currentPage = i;
                fetchQuestions(currentPage);
            });
            pageItem.appendChild(pageLink);
            paginationContainer.appendChild(pageItem);
        }
    
        // Add ellipsis if current page window is not adjacent to the first pages
        if (currentPage > 3) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = '<a class="page-link" href="javascript:void(0);">...</a>';
            paginationContainer.appendChild(ellipsis);
        }
    
        // Show the pages around the current page
        for (let i = startPage; i <= endPage; i++) {
            if (i > 2 && i < totalPages - 1) { // Avoid repeating the first and last pages
                const pageItem = document.createElement('li');
                pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
                const pageLink = document.createElement('a');
                pageLink.className = 'page-link';
                pageLink.textContent = i;
                pageLink.href = 'javascript:void(0);';
                pageLink.addEventListener('click', function (e) {
                    e.preventDefault();
                    currentPage = i;
                    fetchQuestions(currentPage);
                });
                pageItem.appendChild(pageLink);
                paginationContainer.appendChild(pageItem);
            }
        }
    
        // Add ellipsis before the last two pages
        if (endPage < totalPages - 2) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = '<a class="page-link" href="javascript:void(0);">...</a>';
            paginationContainer.appendChild(ellipsis);
        }
    
        // Always show the last two pages
        for (let i = Math.max(totalPages - 1, 3); i <= totalPages; i++) {
            const pageItem = document.createElement('li');
            pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
            const pageLink = document.createElement('a');
            pageLink.className = 'page-link';
            pageLink.textContent = i;
            pageLink.href = 'javascript:void(0);';
            pageLink.addEventListener('click', function (e) {
                e.preventDefault();
                currentPage = i;
                fetchQuestions(currentPage);
            });
            pageItem.appendChild(pageLink);
            paginationContainer.appendChild(pageItem);
        }
    
        // Create the "Next" button
        const nextItem = document.createElement('li');
        nextItem.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`; // Disable if on last page
    
        const nextLink = document.createElement('a');
        nextLink.className = 'page-link';
        nextLink.textContent = 'Next';
        nextLink.href = 'javascript:void(0);'; // Prevent default link behavior
        nextLink.addEventListener('click', function (e) {
            e.preventDefault();
            if (currentPage < totalPages) {
                currentPage++;
                fetchQuestions(currentPage);
            }
        });
    
        nextItem.appendChild(nextLink);
        paginationContainer.appendChild(nextItem);
    }
    

    

    fetchQuestions(currentPage); // Initial fetch
    downloadBtn.addEventListener('click', () => {
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.table_to_sheet(document.querySelector("table"));
        XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");
        XLSX.writeFile(workbook, "questions.xlsx");
    });
});
