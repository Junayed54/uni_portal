document.addEventListener('DOMContentLoaded', async function() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    let newCategoryId = null;

    // Category-related elements
    const categorySelect = document.getElementById('category');
    const newCategoryInput = document.getElementById('new-category-input');
    const addNewCategoryOption = document.createElement('option');
    addNewCategoryOption.value = 'new';
    addNewCategoryOption.textContent = 'Add New Category';
    categorySelect.appendChild(addNewCategoryOption);

    // Subject-related elements
    const subjectSelect = document.getElementById('subject');
    const unitSelect = document.getElementById('unit');
    const instituteSelect = document.getElementById('institute');

    // Fetch and display categories, subjects, units, and institutes
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
                categories.forEach(category => {
                    const option = document.createElement('option');
                    option.value = category.id;
                    option.textContent = category.name;
                    categorySelect.appendChild(option);
                });
            } else {
                console.error('Failed to load categories');
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    }

    async function loadSubjects() {
        try {
            const response = await fetch('/quiz/subjects/', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                }
            });
            const subjects = await response.json();

            if (response.ok) {
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
            console.error('Error fetching subjects:', error);
        }
    }

    async function loadUnits() {
        try {
            const response = await fetch('/quiz/units/', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                }
            });
            const units = await response.json();

            if (response.ok) {
                units.forEach(unit => {
                    const option = document.createElement('option');
                    option.value = unit.id;
                    option.textContent = unit.name;
                    unitSelect.appendChild(option);
                });
            } else {
                console.error('Failed to load units');
            }
        } catch (error) {
            console.error('Error fetching units:', error);
        }
    }

    async function loadInstitutes() {
        try {
            const response = await fetch('/quiz/institutes/', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                }
            });
            const institutes = await response.json();

            if (response.ok) {
                institutes.forEach(institute => {
                    const option = document.createElement('option');
                    option.value = institute.id;
                    option.textContent = institute.name;
                    instituteSelect.appendChild(option);
                });
            } else {
                console.error('Failed to load institutes');
            }
        } catch (error) {
            console.error('Error fetching institutes:', error);
        }
    }

    // Load all the data
    loadCategories();
    loadSubjects();
    loadUnits();
    loadInstitutes();

    // Show input for new category if "Add New Category" is selected
    categorySelect.addEventListener('change', function() {
        if (categorySelect.value === 'new') {
            newCategoryInput.style.display = 'block';
        } else {
            newCategoryInput.style.display = 'none';
        }
    });

    // Creating a new category and updating the dropdown
    async function createNewCategory(categoryName) {
        try {
            const response = await fetch('/quiz/exam_categories/create/', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: categoryName })
            });

            const result = await response.json();
            if (response.ok) {
                const newOption = document.createElement('option');
                newOption.value = result.id; 
                newCategoryId = result.id; // Set new category ID
                newOption.textContent = result.name;

                categorySelect.appendChild(newOption);
                categorySelect.value = newCategoryId; // Set new category as selected
                
                newCategoryInput.style.display = 'none'; // Hide input after creating the category
            } else {
                console.error('Failed to create new category');
            }
        } catch (error) {
            console.error('Error creating category:', error);
        }
    }

    // Handle form submission (creating the exam)
    const createExamBtn = document.getElementById('create-exam-btn');
    createExamBtn.addEventListener('click', async function() {
        const form = document.getElementById('create-exam-form');
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Set duration in seconds
        const duration = document.getElementById('duration').value;
        data.duration = duration * 60;

        // Set starting_time and last_date to null if not provided
        data.starting_time = null;
        data.last_date = data.last_date || null;

        try {
            const response = await fetch('/quiz/exams/', {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();
            if (response.ok) {
                alert('Exam created successfully');
            } else {
                alert('Failed to create exam');
                console.error(result);
            }
        } catch (error) {
            console.error('Error creating exam:', error);
        }
    });
});
