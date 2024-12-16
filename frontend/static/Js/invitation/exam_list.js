document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    fetch('/api/exam-invites/', {
        headers: {
            'Authorization': `Bearer ${accessToken}`, // Include the access token in the Authorization header
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        const invitesList = document.getElementById('invites-list');
        invitesList.innerHTML = ''; // Clear any existing content

        data.forEach(invite => {
            const inviteCard = `
                <div class="col-md-4 mb-4">
                    <div class="card shadow-sm">
                        <div class="card-header">
                            <h5 class="card-title">${invite.exam.title}</h5>
                        </div>
                        <div class="card-body">
                            <p><strong>Invited By:</strong> ${invite.invited_by}</p>
                            <p><strong>Invited User:</strong> ${invite.invited_user}</p>
                            <p><strong>Invited At:</strong> ${new Date(invite.invited_at).toLocaleString()}</p>
                            <p><strong>Status:</strong> ${invite.is_accepted ? 'Accepted' : 'Pending'}</p>
                            <button class="btn btn-custom" data-bs-toggle="modal" data-bs-target="#inviteModal" onclick="showDetails('${invite.exam.title}', '${invite.invited_by}', '${invite.invited_user}', '${invite.token}', '${invite.invited_at}', ${invite.is_accepted})">View Details</button>
                        </div>
                    </div>
                </div>
            `;
            invitesList.insertAdjacentHTML('beforeend', inviteCard);
        });
    })
    .catch(error => console.error('Error fetching invites:', error));
});

function showDetails(examTitle, invitedBy, invitedUser, token, invitedAt, isAccepted) {
    document.getElementById('modalInviteDetails').innerHTML = `
        <p><strong>Exam Title:</strong> ${examTitle}</p>
        <p><strong>Invited By:</strong> ${invitedBy}</p>
        <p><strong>Invited User:</strong> ${invitedUser}</p>
        <p><strong>Token:</strong> ${token}</p>
        <p><strong>Invited At:</strong> ${new Date(invitedAt).toLocaleString()}</p>
        <p><strong>Status:</strong> ${isAccepted ? 'Accepted' : 'Pending'}</p>
    `;
}