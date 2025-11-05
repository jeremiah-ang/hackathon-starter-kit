// Initialize Socket.IO connection
const socket = io();

// DOM Elements
const questionForm = document.getElementById('questionForm');
const questionInput = document.getElementById('questionInput');
const charCount = document.getElementById('charCount');
const questionsList = document.getElementById('questionsList');
const filterButtons = document.querySelectorAll('.btn-filter');
const modal = document.getElementById('questionModal');
const modalClose = document.querySelector('.close');
const questionDetail = document.getElementById('questionDetail');
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');

let currentSort = 'recent';
let questions = [];

// Socket.IO Event Handlers
socket.on('connected', (data) => {
    console.log('Connected to server:', data);
    updateConnectionStatus(true);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    updateConnectionStatus(false);
});

socket.on('question-added', (question) => {
    console.log('New question added:', question);
    questions.unshift(question);
    renderQuestions();
    showNotification('New question added!');
});

socket.on('answer-added', (answer) => {
    console.log('New answer added:', answer);
    // Refresh the current question if modal is open
    const currentQuestionId = questionDetail.dataset.questionId;
    if (currentQuestionId && parseInt(currentQuestionId) === answer.question_id) {
        loadQuestionDetail(answer.question_id);
    }
    // Update the question in the list
    const question = questions.find(q => q.id === answer.question_id);
    if (question) {
        question.is_answered = true;
    }
    renderQuestions();
    showNotification('New answer added!');
});

socket.on('question-upvoted', (question) => {
    console.log('Question upvoted:', question);
    const index = questions.findIndex(q => q.id === question.id);
    if (index !== -1) {
        questions[index] = question;
        renderQuestions();
    }
});

socket.on('answer-upvoted', (answer) => {
    console.log('Answer upvoted:', answer);
    // Refresh if viewing this question
    const currentQuestionId = questionDetail.dataset.questionId;
    if (currentQuestionId) {
        loadQuestionDetail(currentQuestionId);
    }
});

socket.on('error', (data) => {
    console.error('Socket error:', data);
    showNotification(data.message, 'error');
});

// Form Handlers
questionForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const content = questionInput.value.trim();
    
    if (!content) return;

    try {
        const response = await fetch('/api/questions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });

        if (response.ok) {
            questionInput.value = '';
            updateCharCount();
            showNotification('Question submitted successfully!');
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to submit question', 'error');
        }
    } catch (err) {
        console.error('Error submitting question:', err);
        showNotification('Failed to submit question', 'error');
    }
});

questionInput.addEventListener('input', updateCharCount);

function updateCharCount() {
    const count = questionInput.value.length;
    charCount.textContent = `${count}/1000`;
}

// Filter Handlers
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        filterButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        currentSort = button.dataset.sort;
        loadQuestions();
    });
});

// Load Questions
async function loadQuestions() {
    try {
        const response = await fetch(`/api/questions?sort=${currentSort}&limit=50`);
        if (response.ok) {
            questions = await response.json();
            renderQuestions();
        } else {
            questionsList.innerHTML = '<div class="error">Failed to load questions</div>';
        }
    } catch (err) {
        console.error('Error loading questions:', err);
        questionsList.innerHTML = '<div class="error">Failed to load questions</div>';
    }
}

// Render Questions
function renderQuestions() {
    if (questions.length === 0) {
        questionsList.innerHTML = '<div class="no-questions">No questions yet. Be the first to ask!</div>';
        return;
    }

    questionsList.innerHTML = questions.map(question => `
        <div class="question-card" data-id="${question.id}">
            <div class="question-header">
                <span class="timestamp">${formatTimestamp(question.created_at)}</span>
                ${question.is_answered ? '<span class="badge badge-answered">Answered</span>' : '<span class="badge badge-unanswered">Unanswered</span>'}
            </div>
            <div class="question-content">
                ${escapeHtml(question.content)}
            </div>
            <div class="question-footer">
                <button class="btn btn-small upvote-btn" onclick="upvoteQuestion(${question.id})">
                    👍 ${question.upvotes || 0}
                </button>
                <button class="btn btn-small" onclick="viewQuestion(${question.id})">
                    💬 ${question.answer_count || 0} ${question.answer_count === 1 ? 'Answer' : 'Answers'}
                </button>
            </div>
        </div>
    `).join('');
}

// View Question Detail
async function viewQuestion(questionId) {
    try {
        const response = await fetch(`/api/questions/${questionId}`);
        if (response.ok) {
            const question = await response.json();
            displayQuestionDetail(question);
            modal.style.display = 'block';
        }
    } catch (err) {
        console.error('Error loading question detail:', err);
        showNotification('Failed to load question details', 'error');
    }
}

async function loadQuestionDetail(questionId) {
    try {
        const response = await fetch(`/api/questions/${questionId}`);
        if (response.ok) {
            const question = await response.json();
            if (modal.style.display === 'block') {
                displayQuestionDetail(question);
            }
        }
    } catch (err) {
        console.error('Error reloading question detail:', err);
    }
}

function displayQuestionDetail(question) {
    questionDetail.dataset.questionId = question.id;
    
    const answersHtml = question.answers && question.answers.length > 0
        ? question.answers.map(answer => `
            <div class="answer-card">
                <div class="answer-content">${escapeHtml(answer.content)}</div>
                <div class="answer-footer">
                    <span class="timestamp">${formatTimestamp(answer.created_at)}</span>
                    <button class="btn btn-small upvote-btn" onclick="upvoteAnswer(${answer.id})">
                        👍 ${answer.upvotes || 0}
                    </button>
                </div>
            </div>
        `).join('')
        : '<div class="no-answers">No answers yet. Be the first to answer!</div>';

    questionDetail.innerHTML = `
        <div class="modal-question">
            <h3>Question</h3>
            <div class="question-content large">
                ${escapeHtml(question.content)}
            </div>
            <div class="question-meta">
                <span class="timestamp">${formatTimestamp(question.created_at)}</span>
                <button class="btn btn-small upvote-btn" onclick="upvoteQuestion(${question.id})">
                    👍 ${question.upvotes || 0}
                </button>
            </div>
        </div>

        <div class="answer-form">
            <h3>Your Answer</h3>
            <textarea 
                id="answerInput" 
                placeholder="Write your answer here... (max 2000 characters)"
                maxlength="2000"
                rows="4"
            ></textarea>
            <div class="form-footer">
                <span id="answerCharCount" class="char-count">0/2000</span>
                <button class="btn btn-primary" onclick="submitAnswer(${question.id})">Submit Answer</button>
            </div>
        </div>

        <div class="answers-section">
            <h3>Answers (${question.answers ? question.answers.length : 0})</h3>
            ${answersHtml}
        </div>
    `;

    const answerInput = document.getElementById('answerInput');
    const answerCharCount = document.getElementById('answerCharCount');
    answerInput.addEventListener('input', () => {
        answerCharCount.textContent = `${answerInput.value.length}/2000`;
    });
}

// Upvote Question
async function upvoteQuestion(questionId) {
    try {
        const response = await fetch(`/api/questions/${questionId}/upvote`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('Failed to upvote');
        }
    } catch (err) {
        console.error('Error upvoting question:', err);
        showNotification('Failed to upvote question', 'error');
    }
}

// Upvote Answer
async function upvoteAnswer(answerId) {
    try {
        const questionId = questionDetail.dataset.questionId;
        const response = await fetch(`/api/questions/${questionId}/answers/${answerId}/upvote`, {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error('Failed to upvote');
        }
    } catch (err) {
        console.error('Error upvoting answer:', err);
        showNotification('Failed to upvote answer', 'error');
    }
}

// Submit Answer
async function submitAnswer(questionId) {
    const answerInput = document.getElementById('answerInput');
    const content = answerInput.value.trim();

    if (!content) {
        showNotification('Please enter an answer', 'error');
        return;
    }

    try {
        const response = await fetch(`/api/questions/${questionId}/answers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ content }),
        });

        if (response.ok) {
            answerInput.value = '';
            showNotification('Answer submitted successfully!');
        } else {
            const error = await response.json();
            showNotification(error.error || 'Failed to submit answer', 'error');
        }
    } catch (err) {
        console.error('Error submitting answer:', err);
        showNotification('Failed to submit answer', 'error');
    }
}

// Modal Handlers
modalClose.onclick = function() {
    modal.style.display = 'none';
    questionDetail.dataset.questionId = '';
}

window.onclick = function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
        questionDetail.dataset.questionId = '';
    }
}

// Utility Functions
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateConnectionStatus(connected) {
    if (connected) {
        statusDot.className = 'status-dot connected';
        statusText.textContent = 'Connected';
    } else {
        statusDot.className = 'status-dot disconnected';
        statusText.textContent = 'Disconnected';
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.add('show');
    }, 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Initialize
loadQuestions();
