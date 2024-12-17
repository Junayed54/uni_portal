document.addEventListener('DOMContentLoaded', function() {
    const accessToken = localStorage.getItem('access_token');
    console.log(accessToken);
    if (!accessToken) {
        window.location.href = '/login/';
        return;
    }

    fetch('/quiz/exams/exam_list', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    })
    .then(response => response.json())
    .then(data => {
        // console.log(data);
        const examsList = document.getElementById('exams-list');
        examsList.innerHTML = data.map(exam => `
            <div class="col-md-6 mb-4">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <div class="d-flex justify-content-end">
                            <div class="p-1  rounded mt-0 text-white" style="background:#7BD3EA;">${exam.status}</div>
                        </div>
                        <h5 class="card-title" style="color:#72BF78;">${exam.title}</h5>
                        <p class="text-muted">${exam.category_name}</p>
                        <div class="d-flex my-4" style="gap:5px;">
                            <div class="p-2 rounded text-white" style="background-color: #808D7C;">${exam.total_questions} Ques.</div>
                            <div class="p-2 rounded text-white" style="background-color: #808D7C">${exam.total_mark} Marks</div>
                            <div class="p-2 rounded text-white" style="background-color: #808D7C">${exam.duration} Mins</div>
                        </div>
                        <h6 class="text-muted">Examiner: <span class="" style="font-weight:bold; color:#4CC9FE;">${exam.creater_name}</span></h6>
                        <h6 class="text-muted">Package: <span class="" style="color:#4CC9FE;">${exam.title}</span></h6>
                        
                        <div class="mt-3">
                            <h5>Subjects:</h5>
                            <div class="d-flex flex-wrap" style="gap: 5px;">
                                ${exam.subjects.map(subject => `
                                    <span class="badge text-white" style="background-color: #A0D683; padding: 5px 10px; border-radius: 5px;">
                                        ${subject.subject}: ${subject.question_count}
                                    </span>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="card-footer text-start d-flex justify-content-between">
                        <button class="btn btn-light btn-sm border border-dark" onclick="viewExamDetail('${exam.exam_id}')">
                            <i class="fa-solid fa-circle-info center" style="font-size:14px"></i>  Details
                        </button>
                        <button class="btn btn-light btn-sm border-dark" onclick="shareExam('${exam.title}', '${window.location.origin}/quiz/exam_detail/${exam.exam_id}/')">
                            <img src="${share_icon}" alt="share" style="width: 20px; height: 20px; margin-right: 5px;"> Share
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    })
    .catch(error => console.error('Error:', error));
});

function viewExamDetail(examId) {
    window.location.href = `/quiz/exam_detail/${examId}/`;
}

function shareExam(title, url) {
    const shareData = {
        title: title,
        text: `Check out this exam: ${title}`,
        url: url
    };

    if (navigator.share) {
        navigator.share(shareData)
            .then(() => console.log('Shared successfully'))
            .catch(err => console.error('Error sharing:', err));
    } else {
        alert('Sharing is not supported on this device. Copy this link to share: ' + url);
    }
}

