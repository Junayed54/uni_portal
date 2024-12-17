const accessToken = localStorage.getItem('access_token');
let userRole = '';

// Fetch User Role
async function fetchUserRole() {
    try {
        const response = await fetch('/auth/user-role/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            }
        });
        const data = await response.json();

        if (response.ok) {
            userRole = data.role;  // Assume 'role' is returned in the response
        } else {
            console.error('Failed to fetch user role');
        }
    } catch (error) {
        console.error('Error fetching user role:', error);
    }
}

// Initialize user role before form submission
fetchUserRole();

// Toggle display based on exam type selection
document.getElementById('exam_type').addEventListener('change', function() {
    const examType = this.value;
    const difficultySection = document.getElementById('difficulty-section');
    const fileUploadSection = document.getElementById('file-upload-section');
    
    if (examType === 'file') {
        difficultySection.style.display = 'none';
        fileUploadSection.style.display = 'block';
    } else {
        difficultySection.style.display = 'block';
        fileUploadSection.style.display = 'none';
    }
});

// Fetch and display categories
async function loadCategories() {
    try {
        const response = await fetch('/quiz/exam_categories/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            }
        });
        const categories = await response.json();

        if (response.ok) {
            const categorySelect = document.getElementById('category');
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id;
                option.textContent = category.name;
                categorySelect.appendChild(option);
            });
            // Add 'Add New Category' option
            const addNewCategoryOption = document.createElement('option');
            addNewCategoryOption.value = 'new';
            addNewCategoryOption.textContent = 'Add New Category';
            categorySelect.appendChild(addNewCategoryOption);
        } else {
            console.error('Failed to load categories');
        }
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

// Fetch and display units, institutes, and subjects
async function loadUnitsInstitutesSubjects() {
    try {
        const [unitsResponse, institutesResponse, subjectsResponse] = await Promise.all([
            fetch('/quiz/units/', { headers: { 'Authorization': 'Bearer ' + accessToken } }),
            fetch('/quiz/institutes/', { headers: { 'Authorization': 'Bearer ' + accessToken } }),
            fetch('/quiz/subjects/', { headers: { 'Authorization': 'Bearer ' + accessToken } })
        ]);
        
        const units = await unitsResponse.json();
        const institutes = await institutesResponse.json();
        const subjects = await subjectsResponse.json();

        if (unitsResponse.ok) {
            const unitSelect = document.getElementById('unit');
            units.forEach(unit => {
                const option = document.createElement('option');
                option.value = unit.id;
                option.textContent = unit.name;
                unitSelect.appendChild(option);
            });
        } else {
            console.error('Failed to load units');
        }

        if (institutesResponse.ok) {
            const instituteSelect = document.getElementById('institute');
            institutes.forEach(institute => {
                const option = document.createElement('option');
                option.value = institute.id;
                option.textContent = institute.name;
                instituteSelect.appendChild(option);
            });
        } else {
            console.error('Failed to load institutes');
        }

        if (subjectsResponse.ok) {
            const subjectSelect = document.getElementById('subject');
            subjects.forEach(subject => {
                const option = document.createElement('option');
                option.value = subject.id;
                option.textContent = subject.name;
                subjectSelect.appendChild(option);
            });
        } else {
            console.error('Failed to load subjects');
        }
    } catch (error) {
        console.error('Error fetching units, institutes, or subjects:', error);
    }
}

// Initialize categories, units, institutes, and subjects
loadCategories();
loadUnitsInstitutesSubjects();

// Handle category selection
document.getElementById('category').addEventListener('change', function() {
    const newCategoryInput = document.getElementById('new-category-input');
    if (this.value === 'new') {
        newCategoryInput.style.display = 'block';
    } else {
        newCategoryInput.style.display = 'none';
    }
});

// Form submission
document.getElementById('examForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const formData = new FormData(this);

    // If the exam type is 'question_bank', validate and collect difficulty levels
    if (document.getElementById('exam_type').value === 'question_bank') {
        let totalPercentage = 0;
        const difficultyLevels = {};

        // Collect difficulty level data from the form inputs
        document.querySelectorAll('[name^="difficulty_levels"]').forEach(input => {
            const level = input.name.split('difficulty_levels[')[1].split(']')[0];
            const value = parseInt(input.value || 0);
            totalPercentage += value;
            difficultyLevels[level] = value;
        });

        // Validate the total percentage
        if (totalPercentage !== 100) {
            alert('The total percentage of difficulty levels must be 100.');
            return;
        }

        // Append difficulty levels as JSON string
        formData.append('difficulty_levels', JSON.stringify(difficultyLevels));
    }

    // Send form data with file support
    try {
        const response = await fetch('/quiz/create-exam/', {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': 'Bearer ' + accessToken,
            }
        });

        const data = await response.json();
        if (response.ok) {
            alert('Success: ' + data.message);
            const redirectUrl = userRole === 'teacher' ? '/quiz/draft_exams/' : '/quiz/user_exams/';
            window.location.href = redirectUrl;
        } else {
            alert('Error: ' + (data.error || 'Failed to create exam.'));
        }
    } catch (error) {
        alert('Error: Failed to create exam.');
        console.error('Error:', error);
    }
});
