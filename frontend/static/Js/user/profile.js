// document.addEventListener('DOMContentLoaded', function() {
//     const accessToken = localStorage.getItem('access_token');
//     if (!accessToken) {
//         window.location.href = '/login/';
//         return;
//     }

//     // Fetch user details
//     fetch('/auth/user/me/', {
//         method: 'GET',
//         headers: {
//             'Authorization': 'Bearer ' + accessToken,
//         }
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         return response.json();
//     })
//     .then(data => {
//         // Populate form fields with user data
//         document.getElementById('username').value = data.username || '';
//         document.getElementById('phone_number').value = data.phone_number || '';
//         document.getElementById('email').value = data.email || '';
//         document.getElementById('address').value = data.address || '';
//         document.getElementById('other_information').value = data.other_information || '';
//         document.getElementById('profile_picture').src = data.profile_picture || ''; // This might need special handling if it's an actual URL
//         document.getElementById('date_of_birth').value = data.date_of_birth || '';
//         document.getElementById('gender').value = data.gender || '';
//         document.getElementById('secondary_phone_number').value = data.secondary_phone_number || '';
//         document.getElementById('facebook_profile').value = data.facebook_profile || '';
//         document.getElementById('twitter_profile').value = data.twitter_profile || '';
//         document.getElementById('linkedin_profile').value = data.linkedin_profile || '';
//         document.getElementById('bio').value = data.bio || '';
//         document.getElementById('preferences').value = JSON.stringify(data.preferences) || '';
//     })
//     .catch(error => console.error('Error:', error));

//     // Ensure the form element exists before adding event listener
//     const form = document.getElementById('update-form');
//     if (form) {
//         form.addEventListener('submit', function(event) {
//             event.preventDefault();

//             const formData = new FormData(form);
//             const jsonData = {};
//             formData.forEach((value, key) => {
//                 jsonData[key] = value;
//             });

//             fetch('/auth/user/me/', {
//                 method: 'PATCH',
//                 headers: {
//                     'Authorization': 'Bearer ' + accessToken,
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify(jsonData)
//             })
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 console.log('Profile updated successfully:', data);
//                 document.getElementById('message').textContent = 'Profile updated successfully!';
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 document.getElementById('message').textContent = 'Failed to update profile.';
//             });
//         });
//     } else {
//         console.error('Update form not found.');
//     }
// });


document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    // Fetch user details
    fetch('/auth/user/me/', {
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
        // Populate form fields with user data
        document.getElementById('username').value = data.username || '';
        document.getElementById('phone_number').value = data.phone_number || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('address').value = data.address || '';
        document.getElementById('other_information').value = data.other_information || '';
        document.getElementById('profile_picture').src = data.profile_picture || ''; // This might need special handling if it's an actual URL
        document.getElementById('date_of_birth').value = data.date_of_birth || '';
        document.getElementById('gender').value = data.gender || '';
        document.getElementById('secondary_phone_number').value = data.secondary_phone_number || '';
        document.getElementById('facebook_profile').value = data.facebook_profile || '';
        document.getElementById('twitter_profile').value = data.twitter_profile || '';
        document.getElementById('linkedin_profile').value = data.linkedin_profile || '';
        document.getElementById('bio').value = data.bio || '';
        document.getElementById('preferences').value = JSON.stringify(data.preferences) || '';
    })
    .catch(error => console.error('Error:', error));

    // Ensure the form element exists before adding event listener
    const form = document.querySelector('form');
    if (form) {
        form.addEventListener('submit', function(event) {
            event.preventDefault();

            // Create FormData object to handle file uploads and form data
            var formData = new FormData(form);
            
            // Correct way to get the 'username' value from FormData
            var username = formData.get('username');
            // console.log(username);
            
            // Log FormData entries to check if data is captured correctly
            // for (let [key, value] of formData.entries()) {
            //     console.log(key, value);
            // }

            fetch('/auth/user/me/', {
                method: 'PATCH',
                headers: {
                    'Authorization': 'Bearer ' + accessToken,
                    // 'Content-Type': 'application/json', // Not needed when using FormData
                },
                body: formData // Use FormData object as the body
            })
            .then(response => {
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log(data);
                document.getElementById('message').textContent = 'Profile updated successfully!';
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('message').textContent = 'Failed to update profile.';
            });
        });
    } else {
        console.error('Update form not found.');
    }
});

