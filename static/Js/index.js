document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');

    // DOM elements
    const logout = document.getElementById('logout');
    const teacher = document.getElementById('teacher');
    const admin = document.getElementById('admin');
    const pk_admin = document.getElementById('pk_admin');
    const student = document.getElementById('student');
    const student1 = document.getElementById('student1');
    const teacher_admin = document.getElementById('teacheradmin');
    const login = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout');
    const user_name = document.getElementById('user_name');
    const role = document.getElementById('role');
    const packages = document.getElementById('packages');

    // 1. Check if access token exists
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }


    // 2. Function to validate token with the backend
    function validateToken() {
        fetch('/auth/validate-token/', {  // Endpoint for validating token
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        })
        .then(response => {
            if (response.status === 401 || response.status === 403) {
                // Token invalid or expired
                // alert('Session expired or invalid. Please log in again.');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                window.location.href = '/login/';
                return Promise.reject('Unauthorized');
            }
            return response.json();  // Token is valid, continue execution
        })
        .then(() => {
            // Token is valid, continue to fetch user role
            fetchUserRole();  // Call function to fetch user data based on role
        })
        .catch(error => {
            console.error('Token validation failed:', error);
        });
    }

    // 3. Function to fetch and handle user role
    function fetchUserRole() {
        fetch('/auth/user-role/', {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + accessToken,
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(data => {
            logout.classList.remove('d-none');
            login.classList.add('d-none');
            user_name.innerText = data.username;
            role.innerText = data.role;

            // Role-based visibility logic
            if (data.role === 'teacher') {
                teacher.classList.remove('d-none');
            } else if (data.role === 'admin') {
                admin.classList.remove('d-none');
                pk_admin.classList.remove('d-none');
            } else if (data.role === 'student') {
                student.classList.remove('d-none');
                student1.classList.remove('d-none');

                const userSummaryDiv = document.getElementById('user-summary');
    
                // Array.from(userSummaryDivs).forEach(function(div) {
                    userSummaryDiv.addEventListener('click', function() {
                        // Assume 'data-user-id' is a custom attribute storing the user ID
                        // const userId = div.getAttribute('data-user-id');
                        
                        // Construct the URL
                        const url = `/quiz/user_summary/${data.user_id}`;
                        
                        // Redirect to the URL
                        window.location.href = url;
                    });
                // });
            }
        })
        .catch(error => console.error('Error fetching user role:', error));
    }

    // 4. Call the token validation function
    validateToken();

    // 5. Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login/';
        });
    }
});








// document.addEventListener('DOMContentLoaded', function() {
//     const accessToken = localStorage.getItem('access_token');
//     const logout = document.getElementById('logout');
//     const teacher = document.getElementById('teacher');
//     const admin = document.getElementById('admin');
//     const pk_admin = document.getElementById('pk_admin');
//     // console.log(admin);
//     const student = document.getElementById('student');
//     const student1 = document.getElementById('student1');
//     const teacher_admin = document.getElementById('teacheradmin');
//     const login = document.getElementById('login-btn');
//     const logoutBtn = document.getElementById('logout');
//     const user_name = document.getElementById('user_name');
//     const role = document.getElementById('role');
//     const packages = document.getElementById('packages')
    

//     if (!accessToken) {
//         window.location.href = '/login/';
//         return;
//     }
//     teacher.classList.add('d-none');
//     // Check if the required elements exist in the DOM
//     if (logout && teacher && login && logoutBtn) {
        
//         if (accessToken) {
//             logout.classList.remove('d-none');
//             login.classList.add('d-none');
            
//             // Add logout functionality
//             logoutBtn.addEventListener('click', () => {
//                 localStorage.removeItem('access_token');
//                 localStorage.removeItem('refresh_token');
//                 window.location.reload();
//             });

//             // Fetch the user role
//             fetch('/auth/user-role/', {
//                 method: 'GET',
//                 headers: {
//                     'Authorization': 'Bearer ' + accessToken,
//                 }
//             })
//             .then(response => response.json())
//             .then(data => {
//                 console.log(data);
//                 user_name.innerText = data.username
               
//                 role.innerHTML = data.role;
//                 if (data.role === 'teacher') {
//                     teacher.classList.remove('d-none');
                    
//                 }

//                 else if(data.role === 'admin'){
                    
//                     admin.classList.remove('d-none');
//                     pk_admin.classList.remove('d-none');
                    
//                 }
//                 else if(data.role =='admin' || data.role =='teacher'){
//                     teacher_admin.classList.remove('d-none');
//                     packages.classList.remove('d-none')
//                 }
//                 else if(data.role == 'student'){
//                     student.classList.remove('d-none');
//                     student1.classList.remove('d-none');
//                     const userSummaryDivs = document.getElementsByClassName('user-summary');
    
//     // Convert the HTMLCollection to an array and add event listeners
//                     Array.from(userSummaryDivs).forEach(function(div) {
//                         div.addEventListener('click', function() {
//                             // Assume 'data-user-id' is a custom attribute storing the user ID
//                             // const userId = div.getAttribute('data-user-id');
                            
//                             // Construct the URL
//                             const url = `/quiz/user_summary/${data.user_id}`;
                            
//                             // Redirect to the URL
//                             window.location.href = url;
//                         });
//                     });

//                 }
//                 else{
//                     teacher.classList.add('d-none');
//                     // console.log("hello2");
//                 }
//             })
//             .catch(error => console.error('Error:', error));

//         } else {
//             login.classList.remove('d-none');
            
//         }
//     } else {
        
//         console.error('Required elements are missing from the DOM');
//     }

// });



// document.addEventListener('DOMContentLoaded', function() {
//     // Get all elements with the class 'user-summary'
    
// });

