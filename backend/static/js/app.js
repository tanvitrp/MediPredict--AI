/* Base Settings */
const API_BASE = 'http://127.0.0.1:5000/api';
let authToken = localStorage.getItem('token');
let currentUsername = localStorage.getItem('username');

/* Elements */
const authView = document.getElementById('auth-view');
const dashView = document.getElementById('dashboard-view');
const loginContainer = document.getElementById('login-form-container');
const regContainer = document.getElementById('register-form-container');

/* Initialization */
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    loadSymptoms();
});

function checkAuth() {
    if (authToken) {
        authView.classList.add('hidden');
        dashView.classList.remove('hidden');
        document.getElementById('user-greeting').classList.remove('hidden');
        document.getElementById('user-greeting').innerText = `Hello, ${currentUsername}`;
        document.getElementById('logout-btn').classList.remove('hidden');
        document.getElementById('history-btn').classList.remove('hidden');
    } else {
        dashView.classList.add('hidden');
        authView.classList.remove('hidden');
        document.getElementById('user-greeting').classList.add('hidden');
        document.getElementById('logout-btn').classList.add('hidden');
        document.getElementById('history-btn').classList.add('hidden');
    }
}

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    authToken = null;
    currentUsername = null;
    checkAuth();
});

/* Auth Toggling */
document.getElementById('show-register').addEventListener('click', () => {
    loginContainer.classList.add('hidden');
    regContainer.classList.remove('hidden');
});
document.getElementById('show-login').addEventListener('click', () => {
    regContainer.classList.add('hidden');
    loginContainer.classList.remove('hidden');
});

/* Registration */
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const res = await fetch(`${API_BASE}/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, email, password})
        });
        const data = await res.json();
        if (res.ok) {
            alert("Registration successful! Please login.");
            document.getElementById('show-login').click();
        } else {
            alert(data.error || "Registration failed");
        }
    } catch(err) {
        alert("Server error.");
    }
});

/* Login */
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await res.json();
        if (res.ok) {
            authToken = data.token;
            currentUsername = data.username;
            localStorage.setItem('token', authToken);
            localStorage.setItem('username', currentUsername);
            checkAuth();
        } else {
            alert(data.error || "Login failed");
        }
    } catch(err) {
        alert("Server error.");
    }
});

/* Modal Logic */
window.openModal = function(id) {
    if(id === 'history-modal') {
        fetchHistory();
    }
    document.getElementById(id).classList.add('active');
}
window.closeModal = function(id) {
    document.getElementById(id).classList.remove('active');
}

let activeChart = null;
function renderChart(canvasId, labels, data) {
    const ctx = document.getElementById(canvasId).getContext('2d');
    if(activeChart) activeChart.destroy();
    Chart.defaults.color = '#94a3b8';
    activeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Prediction Confidence (%)',
                data: data,
                backgroundColor: ['#00d2ff', '#3a7bd5', '#22c55e'],
                borderColor: 'transparent',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: { beginAtZero: true, max: 100 }
            }
        }
    });
}

async function fetchHistory() {
    if(!currentUsername) return;
    try {
        const res = await fetch(`${API_BASE}/history?username=${currentUsername}`);
        const data = await res.json();
        const tbody = document.getElementById('history-tbody');
        tbody.innerHTML = '';
        if(data.history && data.history.length > 0) {
            data.history.forEach(h => {
                tbody.innerHTML += `
                    <tr style="border-bottom:1px solid rgba(255,255,255,0.05)">
                        <td style="padding:0.5rem; color:var(--text-secondary)">${new Date(h.date).toLocaleDateString()}</td>
                        <td style="padding:0.5rem;">${h.mode}</td>
                        <td style="padding:0.5rem; color:var(--success)">${h.disease}</td>
                        <td style="padding:0.5rem;">${(h.accuracy * 100).toFixed(1)}%</td>
                    </tr>
                `;
            });
        } else {
            tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:1rem;">No history found.</td></tr>`;
        }
    } catch(e) {
        console.error(e);
    }
}

/* ---------------- TEXT PREDICTION ---------------- */
let availableSymptoms = [];
async function loadSymptoms() {
    try {
        const res = await fetch(`${API_BASE}/symptoms`);
        const data = await res.json();
        availableSymptoms = data.symptoms || [];
        const container = document.getElementById('symptoms-container');
        container.innerHTML = '';
        availableSymptoms.forEach(sym => {
            const label = document.createElement('label');
            label.className = 'symptom-item';
            label.innerHTML = `<input type="checkbox" value="${sym}"> ${sym}`;
            container.appendChild(label);
        });
    } catch(e) {
        console.error("Could not load symptoms", e);
    }
}

let latestTextPrediction = null;

document.getElementById('predict-text-btn').addEventListener('click', async () => {
    const checkboxes = document.querySelectorAll('#symptoms-container input[type="checkbox"]:checked');
    const selected = Array.from(checkboxes).map(cb => cb.value);
    
    if (selected.length === 0) return alert("Select at least one symptom");

    const btn = document.getElementById('predict-text-btn');
    btn.innerHTML = 'Predicting...';
    try {
        const res = await fetch(`${API_BASE}/predict/symptoms`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({symptoms: selected, username: currentUsername})
        });
        const data = await res.json();
        if (data.predictions && data.predictions.length > 0) {
            const top = data.predictions[0];
            latestTextPrediction = {
                disease: top.disease,
                accuracy: top.probability,
                symptoms: selected,
                details: top.details
            };
            
            document.getElementById('text-results').classList.remove('hidden');
            document.getElementById('text-pred-title').innerText = top.disease;
            document.getElementById('text-pred-acc').innerText = `${(top.probability * 100).toFixed(2)}% Confidence`;
            
            // Build the Graph
            const labels = data.predictions.map(p => p.disease);
            const probs = data.predictions.map(p => p.probability * 100);
            renderChart('predictionChart', labels, probs);

            document.getElementById('text-pred-details').innerHTML = `
                <p><strong id="lbl-desc">Description:</strong> <span id="translatable-desc">${top.details.description}</span></p>
                <p><strong id="lbl-causes">Causes:</strong> <span id="translatable-causes">${top.details.causes}</span></p>
                <p><strong id="lbl-prev">Prevention:</strong> <span id="translatable-prev">${top.details.prevention}</span></p>
                <p style="color:var(--danger)"><strong id="lbl-prec">Precautions:</strong> <span id="translatable-prec">${top.details.precautions || 'N/A'}</span></p>
                <p style="color:var(--success)"><strong id="lbl-treat">Treatment:</strong> <span id="translatable-treat">${top.details.treatment}</span></p>
            `;
        }
    } catch(e) {
        alert("Error predicting.");
    }
    btn.innerHTML = 'Predict Disease';
});

/* PDF Report Logic */
async function downloadReport(predData) {
    if (!predData) return;
    try {
        const res = await fetch(`${API_BASE}/report`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: currentUsername || "Patient",
                ...predData
            })
        });
        
        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentUsername || "Patient"}_Medical_Report.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } else {
            alert("Report generation failed.");
        }
    } catch(e) {
        alert("Error generating report.");
    }
}

document.getElementById('download-text-report').addEventListener('click', () => {
    downloadReport(latestTextPrediction);
});

/* Translation Logic */
document.getElementById('translate-text-btn').addEventListener('click', async () => {
    const lang = document.getElementById('text-lang-select').value;
    if (lang === 'en') return; // Skip if english
    
    if(!latestTextPrediction) return;

    try {
        const elementsToTranslate = [
            { id: 'translatable-desc', text: latestTextPrediction.details.description },
            { id: 'translatable-causes', text: latestTextPrediction.details.causes },
            { id: 'translatable-prev', text: latestTextPrediction.details.prevention },
            { id: 'translatable-prec', text: latestTextPrediction.details.precautions || 'N/A' },
            { id: 'translatable-treat', text: latestTextPrediction.details.treatment },
            { id: 'text-pred-title', text: latestTextPrediction.disease},
            { id: 'lbl-top-pred', text: "Top Prediction:" },
            { id: 'lbl-desc', text: "Description:" },
            { id: 'lbl-causes', text: "Causes:" },
            { id: 'lbl-prev', text: "Prevention:" },
            { id: 'lbl-prec', text: "Precautions:" },
            { id: 'lbl-treat', text: "Treatment:" },
        ];

        for (let el of elementsToTranslate) {
            const res = await fetch(`${API_BASE}/translate`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ text: el.text, target_lang: lang })
            });
            const data = await res.json();
            if (data.translated_text) {
                document.getElementById(el.id).innerText = data.translated_text;
            }
        }
    } catch(e) {
        alert('Translation failed.');
    }
});


/* ---------------- IMAGE PREDICTION ---------------- */
let latestImagePrediction = null;
let webcamStream = null;

const webcamVideo = document.getElementById('webcam-video');
const webcamCanvas = document.getElementById('webcam-canvas');
const startCameraBtn = document.getElementById('start-camera-btn');
const capturePhotoBtn = document.getElementById('capture-photo-btn');
const stopCameraBtn = document.getElementById('stop-camera-btn');

function stopCamera() {
    if (webcamStream) {
        webcamStream.getTracks().forEach(track => track.stop());
        webcamStream = null;
    }
    webcamVideo.srcObject = null;
    webcamVideo.classList.add('hidden');
    capturePhotoBtn.classList.add('hidden');
    stopCameraBtn.classList.add('hidden');
    startCameraBtn.classList.remove('hidden');
}

startCameraBtn.addEventListener('click', async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support webcam capture.");
        return;
    }

    try {
        webcamStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' },
            audio: false
        });
        webcamVideo.srcObject = webcamStream;
        webcamVideo.classList.remove('hidden');
        capturePhotoBtn.classList.remove('hidden');
        stopCameraBtn.classList.remove('hidden');
        startCameraBtn.classList.add('hidden');
    } catch (e) {
        alert("Could not open webcam. Please allow camera permission and try again.");
    }
});

capturePhotoBtn.addEventListener('click', () => {
    if (!webcamStream) return;

    const width = webcamVideo.videoWidth;
    const height = webcamVideo.videoHeight;
    if (!width || !height) {
        alert("Camera is still loading. Try again in a moment.");
        return;
    }

    webcamCanvas.width = width;
    webcamCanvas.height = height;
    webcamCanvas.getContext('2d').drawImage(webcamVideo, 0, 0, width, height);

    webcamCanvas.toBlob(blob => {
        if (!blob) {
            alert("Could not capture photo.");
            return;
        }

        const file = new File([blob], `webcam-skin-image-${Date.now()}.jpg`, { type: 'image/jpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);

        const fileInput = document.getElementById('skin-image-upload');
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change'));
        stopCamera();
    }, 'image/jpeg', 0.92);
});

stopCameraBtn.addEventListener('click', stopCamera);

document.getElementById('skin-image-upload').addEventListener('change', function() {
    if (this.files && this.files.length > 0) {
        document.getElementById('file-name-display').innerText = this.files[0].name;
        // Hide previous results the moment a new image is selected
        document.getElementById('image-results').classList.add('hidden');
    }
});

document.getElementById('predict-image-btn').addEventListener('click', async () => {
    const fileInput = document.getElementById('skin-image-upload');
    if (!fileInput.files || fileInput.files.length === 0) {
        return alert("Please upload an image first.");
    }

    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('username', currentUsername || '');

    const btn = document.getElementById('predict-image-btn');
    btn.innerHTML = 'Analyzing...';
    
    // Clear previous prediction while analyzing
    document.getElementById('image-results').classList.add('hidden');
    document.getElementById('image-pred-title').innerText = '--';
    document.getElementById('image-pred-acc').innerText = '0%';
    document.getElementById('image-pred-bar').style.width = '0%';
    document.getElementById('image-pred-details').innerHTML = '';
    
    try {
        const res = await fetch(`${API_BASE}/predict/image`, {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        
        if (!res.ok) {
            alert(`Image analysis failed: ${data.error || 'Server error.'}`);
            btn.innerHTML = 'Analyze Image';
            return;
        }
        
        if (data.disease) {
            latestImagePrediction = {
                disease: data.disease,
                accuracy: data.confidence,
                symptoms: ["Skin Lesion details from image"],
                details: data.details
            };

            document.getElementById('image-results').classList.remove('hidden');
            document.getElementById('image-pred-title').innerText = data.disease;
            document.getElementById('image-pred-acc').innerText = `${(data.confidence * 100).toFixed(2)}% Confidence`;
            
            setTimeout(() => {
                document.getElementById('image-pred-bar').style.width = `${data.confidence * 100}%`;
            }, 100);

            document.getElementById('image-pred-details').innerHTML = `
                <p><strong id="lbl-img-desc">Diagnosis Detail:</strong> <span id="img-desc">${data.details.description}</span></p>
                <p><strong id="lbl-img-prev">Prevention:</strong> <span id="img-prev">${data.details.prevention}</span></p>
                <p style="color:var(--danger)"><strong id="lbl-img-prec">Precautions:</strong> <span id="img-prec">${data.details.precautions || 'N/A'}</span></p>
                <p style="color:var(--success)"><strong id="lbl-img-treat">Action required:</strong> <span id="img-treat">${data.details.treatment}</span></p>
            `;
        }
    } catch(e) {
        console.error('Image prediction request failed:', e);
        alert("Error analyzing image. Make sure the backend server is running and reachable at http://127.0.0.1:5000");
    }
    btn.innerHTML = 'Analyze Image';
});

document.getElementById('download-image-report').addEventListener('click', () => {
    downloadReport(latestImagePrediction);
});

/* Image Translation Logic */
document.getElementById('translate-image-btn').addEventListener('click', async () => {
    const lang = document.getElementById('image-lang-select').value;
    if (lang === 'en') return;
    
    if(!latestImagePrediction) return;

    try {
        const elementsToTranslate = [
            { id: 'img-desc', text: latestImagePrediction.details.description },
            { id: 'img-prev', text: latestImagePrediction.details.prevention },
            { id: 'img-prec', text: latestImagePrediction.details.precautions || 'N/A' },
            { id: 'img-treat', text: latestImagePrediction.details.treatment },
            { id: 'image-pred-title', text: latestImagePrediction.disease},
            { id: 'lbl-img-desc', text: "Diagnosis Detail:" },
            { id: 'lbl-img-prev', text: "Prevention:" },
            { id: 'lbl-img-prec', text: "Precautions:" },
            { id: 'lbl-img-treat', text: "Action required:" }
        ];

        for (let el of elementsToTranslate) {
            const res = await fetch(`${API_BASE}/translate`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ text: el.text, target_lang: lang })
            });
            const data = await res.json();
            if (data.translated_text) {
                document.getElementById(el.id).innerText = data.translated_text;
            }
        }
    } catch(e) {
        alert('Translation failed.');
    }
});

/* ---------------- VOICE PREDICTION ---------------- */
const recordBtn = document.getElementById('voice-record-btn');
const statusTxt = document.getElementById('recording-status');
const transcriptionBox = document.getElementById('voice-transcription-box');
let detectedSymptomsFromVoice = [];

recordBtn.addEventListener('click', () => {
    if (!window.webkitSpeechRecognition) {
        alert("Your browser does not support Speech Recognition. Try Chrome or Edge.");
        return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = function() {
        recordBtn.style.color = 'var(--danger)';
        statusTxt.innerText = "Listening...";
        statusTxt.style.color = 'var(--danger)';
        transcriptionBox.innerText = '...';
        document.getElementById('voice-results').classList.add('hidden');
    };

    recognition.onresult = async function(event) {
        const speechResult = event.results[0][0].transcript;
        transcriptionBox.innerText = speechResult;
        statusTxt.innerText = "Processing Text...";
        statusTxt.style.color = 'var(--primary-color)';
        
        // Send to backend text mapping
        try {
            const res = await fetch(`${API_BASE}/predict/voice`, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({text: speechResult})
            });
            const data = await res.json();
            
            if (data.matched_symptoms && data.matched_symptoms.length > 0) {
                detectedSymptomsFromVoice = data.matched_symptoms;
                document.getElementById('voice-results').classList.remove('hidden');
                document.getElementById('voice-detected-symptoms').innerText = detectedSymptomsFromVoice.join(", ");
                statusTxt.innerText = "Symptoms Identified!";
            } else {
                statusTxt.innerText = "No clear medical symptoms found in speech. Try again.";
            }
        } catch(e) {
            console.error("Voice processing failed.");
        }
        
        recordBtn.style.color = 'inherit';
    };

    recognition.onerror = function(event) {
        statusTxt.innerText = "Error occurred in recognition: " + event.error;
        recordBtn.style.color = 'inherit';
    };

    recognition.start();
});

document.getElementById('analyze-voice-symptoms-btn').addEventListener('click', async () => {
    if(detectedSymptomsFromVoice.length === 0) return;
    
    // Auto check the symptom checkboxes in the Text menu and open it
    closeModal('voice-modal');
    openModal('text-modal');
    
    const checkboxes = document.querySelectorAll('#symptoms-container input[type="checkbox"]');
    checkboxes.forEach(cb => {
        cb.checked = detectedSymptomsFromVoice.includes(cb.value);
    });
    
    // Trigger predict
    document.getElementById('predict-text-btn').click();
});
