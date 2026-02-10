document.addEventListener('DOMContentLoaded', () => {
    // --- 1. GLOBAL NAVIGATION LOGIC ---
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    function navigateTo(pageId) {
        // 1. Hide all pages
        pages.forEach(page => {
            page.style.display = 'none';
            page.classList.remove('active');
        });
        // 2. Remove active class from nav items
        navItems.forEach(item => item.classList.remove('active'));

        // 3. Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.style.display = 'block';
            setTimeout(() => targetPage.classList.add('active'), 10);
        }

        // 4. Highlight Nav Item
        const activeNav = document.querySelector(`.nav-item[data-page="${pageId}"]`);
        if (activeNav) activeNav.classList.add('active');

        
        localStorage.setItem('studyMate_activePage', pageId);

        // 5. Trigger updates when entering pages
        if (pageId === 'dashboard') loadDashboardData();
        if (pageId === 'tasks') renderTasks();
        if (pageId === 'subjects') renderSubjects();
        if (pageId === 'notes') renderNotes();
        if (pageId === 'progress') renderProgressPage();
        if (pageId === 'timer') updateTimerDisplay();
    }

    // Add Click Listeners to Sidebar
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const pageId = item.getAttribute('data-page');
            navigateTo(pageId);
        });
    });

    // --- 2. DASHBOARD LOGIC ---

    function loadDashboardData() {
        // --- 1. NEW DAY CHECK (RESET LOGIC) ---
        const lastActiveDate = localStorage.getItem('studyMate_lastActiveDate');
        const todayDate = new Date().toDateString(); // e.g., "Wed Dec 31 2025"

        if (lastActiveDate !== todayDate) {
            // It is a new day! Reset the counter.
            localStorage.setItem('studyMate_todayTime', '0');
            localStorage.setItem('studyMate_lastActiveDate', todayDate);
        }
        // A. Update Date & Greeting
        const greetingEl = document.getElementById('dashboard-greeting');
        const dateEl = document.getElementById('dashboard-date');
        const userName = localStorage.getItem('studyMate_username') || 'Student';

        const now = new Date();
        const hour = now.getHours();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

        let timeGreeting = 'Good Morning';
        if (hour >= 12 && hour < 17) timeGreeting = 'Good Afternoon';
        else if (hour >= 17) timeGreeting = 'Good Evening';

        if (greetingEl) greetingEl.textContent = `${timeGreeting}, ${userName}!`;
        if (dateEl) dateEl.textContent = now.toLocaleDateString('en-US', options);

    
        const tasks = JSON.parse(localStorage.getItem('studyMate_tasks')) || JSON.parse(localStorage.getItem('tasks')) || [];
        const subjects = JSON.parse(localStorage.getItem('studyMate_subjects')) || JSON.parse(localStorage.getItem('subjects')) || [];

        const todayMinutes = parseInt(localStorage.getItem('studyMate_todayTime')) || 0;
        const hours = Math.floor(todayMinutes / 60);
        const mins = todayMinutes % 60;

        const pendingCount = tasks.filter(t => !t.completed).length;

        const pendingEl = document.getElementById('dashboard-pending-count');
        const subjectEl = document.getElementById('dashboard-subject-count');
        const timeEl = document.getElementById('dashboard-study-time'); // Make sure your HTML has this ID

        if (pendingEl) pendingEl.textContent = pendingCount;
        if (subjectEl) subjectEl.textContent = subjects.length;
        if (timeEl) timeEl.textContent = `${hours}h ${mins}m`;

        // B. Populate Right Sidebar
        const taskListEl = document.getElementById('dashboard-task-list');
        if (taskListEl) {
            taskListEl.innerHTML = ''; // Clear existing

            // Get top 3 pending tasks
            const pendingTasks = tasks.filter(t => !t.completed).slice(0, 3);

            if (pendingTasks.length === 0) {
                // Empty State
                taskListEl.innerHTML = `
                    <div style="text-align: center; padding: 20px; color: var(--text-muted);">
                        <p style="font-size: 14px;">No pending tasks.</p>
                    </div>`;
            } else {
                pendingTasks.forEach(task => {
                    const taskHTML = `
                        <div class="task-item">
                            <div class="task-checkbox" style="border-color: var(--primary-color)"></div>
                            <div class="task-content">
                                <div class="task-title" style="font-size: 14px; font-weight: 600;">${task.name}</div>
                                <span class="task-subject" style="font-size: 12px; color: gray;">${task.subject}</span>
                            </div>
                        </div>
                    `;
                    taskListEl.innerHTML += taskHTML;
                });
            }
        }
        renderChart();
    }

    // --- 3. SHORTCUT BUTTONS ---
    const btnNewTask = document.getElementById('btn-new-task');
    const btnStartTimer = document.getElementById('btn-start-timer');
    const btnAddNote = document.getElementById('btn-add-note');

    if (btnNewTask) {
        btnNewTask.addEventListener('click', () => {
            navigateTo('tasks');
            setTimeout(() => {
                const addTaskBtn = document.querySelector('.add-task-btn');
                if (addTaskBtn) addTaskBtn.click();
            }, 100);
        });
    }

    if (btnStartTimer) {
        btnStartTimer.addEventListener('click', () => navigateTo('timer'));
    }

    if (btnAddNote) {
        btnAddNote.addEventListener('click', () => {
            navigateTo('notes');
            setTimeout(() => {
                const addNoteBtn = document.querySelector('.add-note-btn');
                if (addNoteBtn) addNoteBtn.click();
            }, 100);
        });
    }


    // --- 4. PROFILE & THEME LOGIC ---
    const updateProfileUI = () => {
        name = localStorage.getItem('studyMate_username') || 'Student';
        const nameEl = document.getElementById('user-name');
        const imgEl = document.getElementById('profile-img');

        if (nameEl) nameEl.textContent = name;
        if (imgEl) imgEl.src = `https://ui-avatars.com/api/?name=${name}&background=3b82f6&color=fff&bold=true&length=1`;
    };

    const editBtn = document.getElementById('edit-name-btn');
    if (editBtn) {
        editBtn.addEventListener('click', () => {
            const currentName = document.getElementById('user-name').textContent;
            const newName = prompt("Enter your name:", currentName);
            if (newName && newName.trim()) {
                localStorage.setItem('studyMate_username', newName.trim());
                updateProfileUI();
                loadDashboardData(); 
            }
        });
    }

    // --- 5. INITIAL LOAD ---
    let savedName = localStorage.getItem('studyMate_username');

    if (!savedName) {
        let inputName = prompt("Welcome to StudyMate! What is your name?");

        if (inputName && inputName.trim() !== "") {
            savedName = inputName.trim();
        } else {
            savedName = "Student";
        }

        localStorage.setItem('studyMate_username', savedName);
    }

    loadDashboardData();
    updateProfileUI();
    if (sessionStorage.getItem('studyMate_sessionActive')) {
        const savedPage = localStorage.getItem('studyMate_activePage') || 'dashboard';
        navigateTo(savedPage);
    } else {
        sessionStorage.setItem('studyMate_sessionActive', 'true'); // Mark session as active
        navigateTo('dashboard');
    }
});


// 6. Right Side CHART LOGIC

function renderChart() {
    const chartSvg = document.querySelector('.right-chart svg');
    if (!chartSvg) return;

    // 0. Setup Tooltip (Create once)
    let tooltip = document.getElementById('chart-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'chart-tooltip';
        document.body.appendChild(tooltip);
    }

    // 1. Get Data
    const history = JSON.parse(localStorage.getItem('studyMate_history')) || {};
    const dataPoints = [];
    const labels = [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const val = history[key] || 0;

        dataPoints.push(val);
        labels.push(days[d.getDay()]);
    }

    // 2. X-Axis Labels
    const xAxisContainer = document.querySelector('.x-axis');
    if (xAxisContainer) {
        xAxisContainer.innerHTML = '';
        xAxisContainer.style.position = 'relative';
        xAxisContainer.style.height = '20px';
        xAxisContainer.style.display = 'block';

        labels.forEach((day, index) => {
            const labelSpan = document.createElement('span');
            labelSpan.textContent = day;
            labelSpan.style.position = 'absolute';
            labelSpan.style.bottom = '0';
            labelSpan.style.fontSize = '11px';
            labelSpan.style.color = 'var(--text-muted)';
            labelSpan.style.fontWeight = '500';

            const percent = (index / 6) * 100;
            labelSpan.style.left = `${percent}%`;

            if (index === 0) labelSpan.style.transform = 'translateX(0%)';
            else if (index === 6) labelSpan.style.transform = 'translateX(-100%)';
            else labelSpan.style.transform = 'translateX(-50%)';

            xAxisContainer.appendChild(labelSpan);
        });
    }

    // 3. Coordinates
    const width = 300;
    const height = 150;
    const maxVal = Math.max(...dataPoints, 10);

    const points = dataPoints.map((val, index) => {
        const x = (index / 6) * width;
        const y = height - ((val / maxVal) * (height - 20));
        return { x, y, val };
    });

    // 4. Draw Paths (Using the Helper Functions below)
    const linePathCmd = svgPath(points, bezierCommand);
    const areaPathCmd = `${linePathCmd} L ${width},${height} L 0,${height} Z`;

    const paths = chartSvg.querySelectorAll('path');
    if (paths.length >= 2) {
        paths[0].setAttribute('d', areaPathCmd);
        paths[1].setAttribute('d', linePathCmd);
    }

    // 5. DRAW INTERACTIVE DOTS
    const oldDots = chartSvg.querySelectorAll('circle');
    oldDots.forEach(dot => dot.remove());

    points.forEach((point, index) => {
        const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        dot.setAttribute("cx", point.x);
        dot.setAttribute("cy", point.y);
        dot.setAttribute("class", "chart-dot");

        // Hover Events
        dot.addEventListener('mouseenter', (e) => {
            const rect = dot.getBoundingClientRect();
            tooltip.style.left = `${rect.left + window.scrollX}px`;
            tooltip.style.top = `${rect.top + window.scrollY - 30}px`; // Adjusted top to sit above mouse
            tooltip.style.opacity = '1';
            tooltip.textContent = `${point.val} mins`;
        });

        dot.addEventListener('mouseleave', () => {
            tooltip.style.opacity = '0';
        });

        chartSvg.appendChild(dot);
    });

    // 6. Y-Axis
    const yLabels = document.querySelectorAll('.y-axis-labels span');
    if (yLabels.length >= 3) {
        yLabels[0].textContent = maxVal + 'm';
        yLabels[1].textContent = Math.round(maxVal / 2) + 'm';
        yLabels[2].textContent = '0m';
    }
}

// --- MATH HELPERS FOR SMOOTH CURVES

const line = (pointA, pointB) => {
    const lengthX = pointB.x - pointA.x;
    const lengthY = pointB.y - pointA.y;
    return {
        length: Math.sqrt(Math.pow(lengthX, 2) + Math.pow(lengthY, 2)),
        angle: Math.atan2(lengthY, lengthX)
    };
};

const controlPoint = (current, previous, next, reverse) => {
    const p = previous || current;
    const n = next || current;
    const smoothing = 0.2;
    const o = line(p, n);
    const angle = o.angle + (reverse ? Math.PI : 0);
    const length = o.length * smoothing;
    const x = current.x + Math.cos(angle) * length;
    const y = current.y + Math.sin(angle) * length;
    return { x, y };
};

const bezierCommand = (point, i, a) => {
    const cps = controlPoint(a[i - 1], a[i - 2], point);
    const cpe = controlPoint(point, a[i - 1], a[i + 1], true);
    return `C ${cps.x},${cps.y} ${cpe.x},${cpe.y} ${point.x},${point.y}`;
};

const svgPath = (points, command) => {
    const d = points.reduce((acc, point, i, a) =>
        i === 0 ? `M ${point.x},${point.y}` : `${acc} ${command(point, i, a)}`
        , '');
    return d;
};


// SUBJECTS PAGE LOGIC
let subjects = JSON.parse(localStorage.getItem('subjects')) || [];
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let notes = JSON.parse(localStorage.getItem('notes')) || [];

// Function to Save Data
function saveData() {
    localStorage.setItem('subjects', JSON.stringify(subjects));
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('notes', JSON.stringify(notes));

    // Whenever we save, we usually want to update the UI
    renderSubjects();
    renderTasks();
    renderNotes();
    renderProgressPage();
    updateDropdowns(); 

    loadDashboardData();
}


const subjectContainer = document.querySelector('#subjects .card-container');
const addSubjectModal = document.querySelector('#subjects .popup-card');
const addSubjectBtn = document.querySelector('.add-subject-btn');
const cancelSubjectBtn = document.querySelector('#subjects .cancel-btn');
const saveSubjectBtn = document.querySelector('#subjects .save-btn');
const subjectNameInput = document.getElementById('subject-name');
const modalTitle = document.querySelector('.popup-card-header h2'); // Select the header to change text
const colorOptions = document.querySelectorAll('.color');

let selectedColor = 'blue'; // Default
let editingSubjectIndex = null; 

// 1. Open "Add Subject" Modal
if (addSubjectBtn) {
    addSubjectBtn.addEventListener('click', () => {
        editingSubjectIndex = null; // Reset edit mode
        modalTitle.innerText = "Add Subject"; // Reset title

        // Reset Inputs
        subjectNameInput.value = '';
        selectedColor = 'blue';
        updateColorSelection(); 

        addSubjectModal.style.display = 'flex';
        subjectNameInput.focus();
    });
}

// 2. Close Modal
if (cancelSubjectBtn) {
    cancelSubjectBtn.addEventListener('click', () => {
        addSubjectModal.style.display = 'none';
    });
}

// 3. Color Selection Logic
colorOptions.forEach(color => {
    color.addEventListener('click', () => {
        selectedColor = color.classList[1]; 
        updateColorSelection();
    });
});

// Helper: Visually update the selected color circle
function updateColorSelection() {
    colorOptions.forEach(c => {
        c.classList.remove('selected');
        if (c.classList.contains(selectedColor)) {
            c.classList.add('selected');
        }
    });
}

// 4. Render Subjects
function renderSubjects() {
    if (!subjectContainer) return;
    subjectContainer.innerHTML = '';

    subjects.forEach((subject, index) => {
        const card = document.createElement('div');
        card.classList.add('subject-card');

        card.innerHTML = `
            <div class="color-strip ${subject.color}"></div>
            <div class="content">
                <div class="subject-name">${subject.name}</div>
                <div class="time-studied">${subject.timeStudied || '0m'} studied</div>
            </div>
            <div class="action-area">
                <div class="edit-btn" onclick="editSubject(${index})">
                    <img src="svgIcons/edit.svg" alt="edit">
                </div>
                <div class="delete-btn" onclick="deleteSubject(${index})">
                    <img src="svgIcons/delete.svg" alt="delete">
                </div>
            </div>
        `;
        subjectContainer.appendChild(card);
    });
}

// 5. Global Edit Function (Triggered by HTML onclick)
window.editSubject = function (index) {
    editingSubjectIndex = index; 
    const subjectToEdit = subjects[index];

    // Populate Data
    modalTitle.innerText = "Edit Subject";
    subjectNameInput.value = subjectToEdit.name;
    selectedColor = subjectToEdit.color;
    updateColorSelection(); 

    // Open Modal
    addSubjectModal.style.display = 'flex';
};

// 6. Save Button (Handles BOTH Add and Edit)
if (saveSubjectBtn) {
    saveSubjectBtn.addEventListener('click', () => {
        const name = subjectNameInput.value.trim();

        if (name) {
            if (editingSubjectIndex !== null) {
                // --- UPDATE EXISTING ---
                subjects[editingSubjectIndex].name = name;
                subjects[editingSubjectIndex].color = selectedColor;
            } else {
                // --- ADD NEW ---
                const newSubject = {
                    name: name,
                    color: selectedColor,
                    timeStudied: '0m'
                };
                subjects.push(newSubject);
            }

            addSubjectModal.style.display = 'none'; // Close
            saveData(); // Save & Render
        } else {
            alert("Please enter a subject name");
        }
    });
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && addSubjectModal.style.display === 'flex') {
        saveSubjectBtn.click();
    }
});

// 7. Delete Subject
window.deleteSubject = function (index) {
    if (confirm("Are you sure? This will delete associated tasks.")) {
        subjects.splice(index, 1);
        saveData();
    }
};

// Initialize
renderSubjects();


// TASKS PAGE LOGIC

function updateDropdowns() {
    // 1. Filter Dropdowns (Task Page)
    const filterSelect = document.getElementById('filter-subject');
    if (filterSelect) {
        // ... (Keep existing filter logic) ...
        const currentVal = filterSelect.value;
        filterSelect.innerHTML = `<option value="all">All Subjects</option>`;
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.name;
            option.innerText = subject.name;
            filterSelect.appendChild(option);
        });
        if (currentVal) filterSelect.value = currentVal;
    }

    // 2. Input Dropdowns (Task Modal + Timer + NEW Note Modal)
    const inputSelects = document.querySelectorAll('#task-subject-select, .subject-select, #note-subject-select');

    inputSelects.forEach(select => {
        const currentVal = select.value;
        select.innerHTML = '';

        const defaultOption = document.createElement('option');
        defaultOption.value = "";
        defaultOption.innerText = "Select Subject";
        defaultOption.disabled = true;
        defaultOption.selected = true;
        select.appendChild(defaultOption);

        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.name;
            option.innerText = subject.name;
            select.appendChild(option);
        });

        if (currentVal) select.value = currentVal;
    });
}

const tasksContainer = document.querySelector('.tasks-container');
const addTaskModal = document.querySelector('.add-task-popup');
const addTaskBtn = document.querySelector('.add-task-btn');

const taskTitleInput = document.getElementById('task-name');
const taskSubjectSelect = document.getElementById('task-subject-select'); // Updated ID
const taskDateInput = document.getElementById('due-date-calender');
const filterStatus = document.getElementById('all-tasks');
const filterSubject = document.getElementById('filter-subject'); // The dropdown for Subject filtering
const saveTaskBtn = document.getElementById("save-task-btn");
const cancelTaskBtn = document.getElementById("cancel-task-btn");

// 1. Show/Hide Modal
if (addTaskBtn) {
    addTaskBtn.addEventListener('click', () => {
        updateDropdowns(); // Ensure dropdown is fresh
        addTaskModal.style.display = 'flex';
        taskTitleInput.value = '';
        taskSubjectSelect.value = ''; // Reset select

        const today = new Date().toISOString().split('T')[0]; // Get "YYYY-MM-DD"
        if (taskDateInput) {
            taskDateInput.min = today; // Set the minimum allowed date
            taskDateInput.value = today; // Optional: Default to today
        }
    });
}

if (cancelTaskBtn) {
    cancelTaskBtn.addEventListener('click', () => {
        addTaskModal.style.display = 'none';
    });
}


// 2. Render Tasks
function renderTasks() {
    if (!tasksContainer) return;
    tasksContainer.innerHTML = '';

    // Get Filter Values
    const statusFilter = filterStatus ? filterStatus.value : 'all-tasks';
    const subjectFilter = filterSubject ? filterSubject.value : 'all';

    // Filter Logic
    const filteredTasks = tasks.filter(task => {
        const statusMatch =
            statusFilter === 'all-tasks' ? true :
                statusFilter === 'pending-tasks' ? !task.completed :
                    statusFilter === 'completed-tasks' ? task.completed : true;

        const subjectMatch =
            subjectFilter === 'all' ? true :
                task.subject === subjectFilter;

        return statusMatch && subjectMatch;
    });

    // Render Logic
    filteredTasks.forEach((task, index) => {
        // 1. Find the subject object to get its color
        const subjectObj = subjects.find(s => s.name === task.subject);

        // 2. Get the color class (default to 'blue' if subject deleted/not found)
        const colorClass = subjectObj ? subjectObj.color : 'blue';

        const card = document.createElement('div');
        card.classList.add('task-card');

        const isChecked = task.completed ? 'checked' : '';
        const textStyle = task.completed ? 'text-decoration: line-through; color: gray;' : '';

        // 3. Inject the variable ${colorClass} into the class list below
        card.innerHTML = `
            <div class="first-row">
                <div class="left">
                    <input type="checkbox" class="custom-checkbox" id="task-${index}" ${isChecked} onchange="toggleTask(${tasks.indexOf(task)})">
                    <label for="task-${index}" class="task-name" style="cursor: pointer; ${textStyle}">
                        ${task.name}
                    </label>
                </div>
                <div class="delete-btn" onclick="deleteTask(${tasks.indexOf(task)})">
                    <img src="svgIcons/delete.svg" alt="delete">
                </div>
            </div>
            <div class="second-row">
                <span class="subject-badge ${colorClass}">${task.subject}</span>
            </div>
            <div class="third-row">
                <p class="due-date">Due: ${task.date}</p>
            </div>
        `;
        tasksContainer.appendChild(card);
    });

    updateProgress();
}

// 3. Add New Task
if (saveTaskBtn) {
    saveTaskBtn.addEventListener('click', () => {
        const title = taskTitleInput.value.trim();
        const subject = taskSubjectSelect.value;
        const date = taskDateInput.value;

        if (title && subject && date) {
            const newTask = {
                name: title,
                subject: subject,
                date: date,
                completed: false
            };

            tasks.push(newTask);
            addTaskModal.style.display = 'none';
            saveData();
            loadDashboardData();
        } else {
            alert("Please fill in all fields (Title, Subject, Date)");
        }
    });
}

// 4. Global Functions (Delete & Toggle)
window.deleteTask = function (index) {
    if (confirm("Delete this task?")) {
        tasks.splice(index, 1);
        saveData();
        renderTasks();
    }
};

window.toggleTask = function (index) {
    tasks[index].completed = !tasks[index].completed;
    saveData(); // Re-render happens inside saveData
    renderTasks();
};

// 5. Update Progress Bar (Top of Task Page)
function updateProgress() {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);

    const progressText = document.querySelector('.progress-info');
    const progressFill = document.querySelector('.progress-child');

    if (progressText) progressText.innerText = `Progress: ${percent}% completed`;
    if (progressFill) progressFill.style.width = `${percent}%`;
}

// 6. Listen for Filters
if (filterStatus) filterStatus.addEventListener('change', renderTasks);
if (filterSubject) filterSubject.addEventListener('change', renderTasks);

// Initial Render
renderTasks();
updateDropdowns(); // Run once on load to fill filters





// TIMER PAGE LOGIC

const timeDisplay = document.querySelector('.time');
const timerCircle = document.querySelector('.actual-progress');
const timerSelect = document.querySelector('.subject-select');
const modeButtons = document.querySelectorAll('.mode-btn');
const startBtn = document.querySelector('.action-btn.start');
const pauseBtn = document.querySelector('.action-btn.pause');
const resetBtn = document.querySelector('.action-btn.reset');


const currentSessionStat = document.querySelector('#timer .stat-box:nth-child(1) .stat-time');
const lastSessionStat = document.querySelector('#timer .stat-box:nth-child(2) .stat-time');

let timerInterval = null;
let totalSeconds = 25 * 60;
let secondsLeft = totalSeconds;
let isRunning = false;
let currentMode = 'Study';

// 1. Initialize Display
function updateTimerDisplay() {
    // A. Handle Text
    const roundedSeconds = Math.max(0, Math.ceil(secondsLeft));
    const minutes = Math.floor(roundedSeconds / 60);
    const seconds = roundedSeconds % 60;

    if (timeDisplay) timeDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

    // B. Handle Ring 
    let percent = (secondsLeft / totalSeconds) * 100;

    // Clamp logic to prevent visual bugs at 0 or 100
    if (percent < 0) percent = 0;
    if (percent > 100) percent = 100;

    // Calculate degrees
    const degrees = (percent / 100) * 360;

    if (timerCircle) {
        timerCircle.style.background = `conic-gradient(var(--primary-color) ${degrees}deg, transparent calc(${degrees}deg + 0.5deg))`;
    }
}

// 2. Start
if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (isRunning) return;

        // Validation: Must have subject if in Study Mode
        if (currentMode === 'Study' && (!timerSelect.value || timerSelect.value === '')) {
            alert("Please select a subject first!");
            return;
        }

        isRunning = true;
        startBtn.style.opacity = "0.5";
        startBtn.style.cursor = "not-allowed";

        timerInterval = setInterval(() => {
            if (secondsLeft > 0) {
                secondsLeft--;
                updateTimerDisplay();

                // Update "Current Session" text live
                const timeSpent = totalSeconds - secondsLeft;
                const m = Math.floor(timeSpent / 60);
                if (currentSessionStat) currentSessionStat.innerText = `${m}m`;

                // DASHBOARD LIVE UPDATE (Every 60s)
                if (secondsLeft % 60 === 0) {
                    try {
                        let currentToday = parseInt(localStorage.getItem('studyMate_todayTime')) || 0;
                        localStorage.setItem('studyMate_todayTime', currentToday + 1);

                        const todayKey = new Date().toISOString().split('T')[0];
                        let history = JSON.parse(localStorage.getItem('studyMate_history')) || {};
                        history[todayKey] = (history[todayKey] || 0) + 1;
                        localStorage.setItem('studyMate_history', JSON.stringify(history));

                        if (typeof loadDashboardData === 'function') loadDashboardData();
                    } catch (e) {
                        console.log("Dashboard update error (ignoring to keep timer running)");
                    }
                }

            } else {
                finishSession();
            }
        }, 1000);
    });
}

// 3. Pause
if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.style.opacity = "1";
        startBtn.style.cursor = "pointer";
    });
}

// 4. Reset (SAFE MODE)
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        // A. Stop Everything First
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.style.opacity = "1";
        startBtn.style.cursor = "pointer";

        const timeSpent = totalSeconds - secondsLeft;
        if (timeSpent > 0) {
            try {
                saveSession(timeSpent);
            } catch (error) {
                console.error("Save failed, but resetting timer anyway:", error);
            }
        }

        // B. Force Time Reset based on Active Button
        const breakBtn = document.querySelectorAll('.mode-btn')[1]; // Index 1 is Break

        if (breakBtn && breakBtn.classList.contains('active')) {
            totalSeconds = 5 * 60;
            currentMode = 'Break';
        } else {
            totalSeconds = 25 * 60;
            currentMode = 'Study';
        }

        // C. Apply Reset to Visuals
        secondsLeft = totalSeconds;
        updateTimerDisplay();

        // D. Clear Session Stat
        if (currentSessionStat) currentSessionStat.innerText = "0m";
    });
}


// 5. Helper to Save Time
function saveSession(secondsStudied) {
    const minutesStudied = Math.floor(secondsStudied / 60);
    const timeString = `${minutesStudied}m`; // Create the string like "25m"

    // Update UI immediately
    if (lastSessionStat) lastSessionStat.innerText = timeString;

    localStorage.setItem('studyMate_lastSession', timeString);

    // Save to Subject Storage (Only if Studying)
    if (currentMode === 'Study') {
        const selectedSubjectName = timerSelect.value;
        const subjectIndex = subjects.findIndex(s => s.name === selectedSubjectName);

        if (subjectIndex !== -1) {
            let currentStr = subjects[subjectIndex].timeStudied || "0m";
            let currentMinutes = parseTimeArray(currentStr);
            let newTotal = currentMinutes + minutesStudied;

            subjects[subjectIndex].timeStudied = formatTime(newTotal);

            if (typeof saveData === 'function') saveData();
        }
    }
}

// 6. Finish
function finishSession() {
    clearInterval(timerInterval);
    isRunning = false;
    startBtn.style.opacity = "1";
    startBtn.style.cursor = "pointer";

    alert(`${currentMode} session complete!`);
    try {
        saveSession(totalSeconds);
    } catch (e) { console.log("Error saving session"); }

    // Auto Reset
    secondsLeft = totalSeconds;
    updateTimerDisplay();
    if (currentSessionStat) currentSessionStat.innerText = "0m";
}

// 7. Mode Switching
modeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        modeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const isStudy = btn === modeButtons[0];
        currentMode = isStudy ? 'Study' : 'Break';

        // Reset timer when switching modes
        clearInterval(timerInterval);
        isRunning = false;
        startBtn.style.opacity = "1";
        startBtn.style.cursor = "pointer";

        totalSeconds = isStudy ? 25 * 60 : 5 * 60;
        secondsLeft = totalSeconds;

        updateTimerDisplay();
        if (currentSessionStat) currentSessionStat.innerText = "0m";
    });
});

// Helpers
function parseTimeArray(timeStr) {
    let total = 0;
    if (timeStr.includes('h')) {
        const parts = timeStr.split('h');
        total += parseInt(parts[0]) * 60;
        if (parts[1]) total += parseInt(parts[1].replace('m', ''));
    } else {
        total += parseInt(timeStr.replace('m', ''));
    }
    return isNaN(total) ? 0 : total;
}

function formatTime(totalMinutes) {
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
}

// Initialize Timer Logic Visuals
if (currentSessionStat) currentSessionStat.innerText = "0m";
if (lastSessionStat) {
    const savedLast = localStorage.getItem('studyMate_lastSession');
    // If data exists, use it. If not, default to "-"
    lastSessionStat.innerText = savedLast ? savedLast : "-";
}
updateTimerDisplay();



// NOTE PAGE LOGIC
const notesContainer = document.querySelector('.notes-container');
const addNoteBtn = document.querySelector('.add-note-btn');
const addNoteModal = document.querySelector('.add-note-popup-card');
const searchNoteInput = document.querySelector('.search-notes-wrapper input');

// Add/Edit Inputs
const noteTitleInput = document.getElementById('note-title-input');
const noteSubjectSelect = document.getElementById('note-subject-select');
const noteContentInput = document.getElementById('note-content-input');
const saveNoteBtn = document.getElementById('save-note-btn');
const cancelNoteBtn = document.getElementById('cancel-note-btn');

// View Modal Elements
const viewModal = document.getElementById('view-note-modal');
const viewTitle = document.getElementById('view-title');
const viewSubject = document.getElementById('view-subject');
const viewDate = document.getElementById('view-date');
const viewContent = document.getElementById('view-content');
const closeViewBtn = document.getElementById('close-view-btn');

let editingNoteIndex = null;

// 1. Open Add Modal
if (addNoteBtn) {
    addNoteBtn.addEventListener('click', () => {
        updateDropdowns();
        editingNoteIndex = null;
        noteTitleInput.value = '';
        noteContentInput.value = '';
        noteSubjectSelect.value = '';
        addNoteModal.style.display = 'flex';
    });
}

// 2. Close Add Modal
if (cancelNoteBtn) {
    cancelNoteBtn.addEventListener('click', () => {
        addNoteModal.style.display = 'none';
    });
}

// 3. Render Notes
function renderNotes(searchTerm = '') {
    if (!notesContainer) return;
    notesContainer.innerHTML = '';

    const filteredNotes = notes.filter(note => {
        const term = searchTerm.toLowerCase();
        return note.title.toLowerCase().includes(term) ||
            note.content.toLowerCase().includes(term) ||
            note.subject.toLowerCase().includes(term);
    });

    filteredNotes.forEach((note) => {
        const realIndex = notes.indexOf(note);
        const subjectObj = subjects.find(s => s.name === note.subject);
        const colorClass = subjectObj ? subjectObj.color : 'blue';

        const card = document.createElement('div');
        card.classList.add('note-card');

        // --- CLICK EVENT TO VIEW NOTE ---
        card.onclick = (e) => {
            // Prevent opening if clicking Edit/Delete buttons
            if (e.target.closest('.edit-btn') || e.target.closest('.delete-btn')) return;
            viewNote(realIndex);
        };
        card.style.cursor = "pointer"; // Visual cue

        card.innerHTML = `
            <div class="first-row">
                <div class="left">
                    <h3 class="note-title">${note.title}</h3>
                </div>
                <div class="right">
                    <div class="edit-btn" onclick="editNote(${realIndex})">
                        <img src="svgIcons/edit.svg" alt="edit">
                    </div>
                    <div class="delete-btn" onclick="deleteNote(${realIndex})">
                        <img src="svgIcons/delete.svg" alt="delete">
                    </div>
                </div>
            </div>
            <div class="note-second-row">
                <span class="subject-badge ${colorClass}">${note.subject}</span>
                <span class="date" style="font-size: 12px; margin-left: 10px;">${note.date}</span>
            </div>
            <div class="note-third-row">
                <p>${note.content}</p>
            </div>
        `;
        notesContainer.appendChild(card);
    });
}

// 4. View Note Function
function viewNote(index) {
    const note = notes[index];
    const subjectObj = subjects.find(s => s.name === note.subject);
    const colorClass = subjectObj ? subjectObj.color : 'blue';

    // Populate Data
    viewTitle.innerText = note.title;
    viewContent.innerText = note.content;
    viewDate.innerText = note.date;

    // Style Badge
    viewSubject.innerText = note.subject;
    viewSubject.className = `subject-badge ${colorClass}`; // Reset classes

    // Show Modal
    viewModal.style.display = 'flex';
}

// Close View Modal
if (closeViewBtn) {
    closeViewBtn.addEventListener('click', () => {
        viewModal.style.display = 'none';
    });
}

// Close View Modal if clicking outside the card (Overlay click)
window.addEventListener('click', (e) => {
    if (e.target === viewModal) {
        viewModal.style.display = 'none';
    }
});

// 5. Save Note
if (saveNoteBtn) {
    saveNoteBtn.addEventListener('click', () => {
        const title = noteTitleInput.value.trim();
        const subject = noteSubjectSelect.value;
        const content = noteContentInput.value.trim();

        if (title && subject && content) {
            const currentDate = new Date().toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short'
            });

            if (editingNoteIndex !== null) {
                notes[editingNoteIndex] = { title, subject, content, date: currentDate };
            } else {
                notes.push({ title, subject, content, date: currentDate });
            }

            addNoteModal.style.display = 'none';
            saveData();
        } else {
            alert("Please fill in all fields");
        }
    });
}

// 6. Global Edit/Delete
window.editNote = function (index) {
    editingNoteIndex = index;
    const note = notes[index];
    updateDropdowns();
    noteTitleInput.value = note.title;
    noteSubjectSelect.value = note.subject;
    noteContentInput.value = note.content;
    addNoteModal.style.display = 'flex';
};

window.deleteNote = function (index) {
    if (confirm("Delete this note?")) {
        notes.splice(index, 1);
        saveData();
    }
};

// 7. Search
if (searchNoteInput) {
    searchNoteInput.addEventListener('input', (e) => {
        renderNotes(e.target.value);
    });
}

renderNotes();



// PROGRESS PAGE LOGIC
const progressPageContainer = document.querySelector('#progress');
const totalTimeEl = document.querySelector('.progress-card:nth-child(1) .progress-value');
const completedTasksEl = document.querySelector('.progress-value.completed-tasks');
const totalTasksEl = document.querySelector('.progress-value.total-tasks');
const activeSubjectsEl = document.querySelector('.progress-card:nth-child(3) .progress-value');
const subjectProgressContainer = document.querySelector('.subject-wise-progress-card');

function renderProgressPage() {
    if (!progressPageContainer) return;

    // --- 1. Calculate Statistics ---

    // A. Total Study Time
    let totalMinutes = 0;
    subjects.forEach(sub => {
        totalMinutes += parseTimeArray(sub.timeStudied || "0m");
    });
    if (totalTimeEl) totalTimeEl.innerText = formatTime(totalMinutes);

    // B. Task Counts
    const tasksComplete = tasks.filter(t => t.completed).length;
    if (completedTasksEl) completedTasksEl.innerText = tasksComplete;
    if (totalTasksEl) totalTasksEl.innerText = `/ ${tasks.length}`;

    // C. Active Subjects
    if (activeSubjectsEl) activeSubjectsEl.innerText = subjects.length;

    // --- 2. Render Subject Bars ---
    const existingBars = subjectProgressContainer.querySelectorAll('.each-progress');
    existingBars.forEach(bar => bar.remove());

    // Sort subjects by time studied (Highest first) for better UX
    const sortedSubjects = [...subjects].sort((a, b) => {
        return parseTimeArray(b.timeStudied || "0m") - parseTimeArray(a.timeStudied || "0m");
    });

    sortedSubjects.forEach(subject => {
        const subMinutes = parseTimeArray(subject.timeStudied || "0m");

        // Calculate Percentage (Avoid division by zero)
        let percent = 0;
        if (totalMinutes > 0) {
            percent = Math.round((subMinutes / totalMinutes) * 100);
        }

        // Get Color Variable (mapping your class names to vars if needed, 
        // or just relying on the class css variables)
        // Since we need to apply the color to the 'top-bar', we can simply 
        // give the top-bar the specific color class (e.g., 'blue') and 
        // ensure CSS handles '.top-bar.blue'

        const barDiv = document.createElement('div');
        barDiv.classList.add('each-progress');
        barDiv.innerHTML = `
            <div class="top-info">
                <span class="subject-info">${subject.name}: ${subject.timeStudied || "0m"}</span>
                <span class="total-percentage">${percent}%</span>
            </div>
            <div class="bottom-info">
                <div class="under-bar">
                    <div class="top-bar ${subject.color}" style="width: ${percent}%;"></div>
                </div>
            </div>
        `;
        subjectProgressContainer.appendChild(barDiv);
    });
    renderWeeklyBarChart();
}

// BAR CHART
function renderWeeklyBarChart() {
    const container = document.getElementById('weekly-bar-chart');
    if (!container) return;

    container.innerHTML = ''; 

    const history = JSON.parse(localStorage.getItem('studyMate_history')) || {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get Max Value for Scaling (so the tallest bar is 100%)
    const values = Object.values(history);
    const maxVal = Math.max(...values, 10); // Minimum scale 10 mins

    // Loop last 7 days
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateKey = d.toISOString().split('T')[0];
        const minutes = history[dateKey] || 0;
        const dayName = days[d.getDay()];

        // Calculate height percentage (max height 100px)
        const heightPercent = (minutes / maxVal) * 100;

        const barHTML = `
                <div class="bar-container">
                    <span class="bar-tooltip">${minutes > 0 ? minutes + 'm' : ''}</span>
                    <div class="bar" style="height: ${heightPercent}%;"></div>
                    <span class="bar-day">${dayName}</span>
                </div>
            `;
        container.innerHTML += barHTML;
    }
}

// Initial Render
renderProgressPage();


// DOWNLOAD REPORT LOGIC
const downloadBtn = document.getElementById('download-report-btn');

if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
        const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
        const subjects = JSON.parse(localStorage.getItem('subjects')) || [];

        // --- 1. CALCULATE TOTAL TIME ---
        let totalMinutes = 0;
        subjects.forEach(sub => {
            const timeStr = sub.timeStudied || "0m";
            // Parse string like "2h 30m" or "45m"
            if (timeStr.includes('h')) {
                const parts = timeStr.split('h');
                totalMinutes += parseInt(parts[0]) * 60;
                if (parts[1]) totalMinutes += parseInt(parts[1].replace('m', ''));
            } else {
                totalMinutes += parseInt(timeStr.replace('m', ''));
            }
        });

        // Format Total String (e.g. "5h 15m")
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        const grandTotalString = h > 0 ? `${h}h ${m}m` : `${m}m`;

        // --- 2. BUILD HTML TABLE ---
        let table = `
                <html xmlns:x="urn:schemas-microsoft-com:office:excel">
                <head>
                    <style>
                        table { border-collapse: collapse; width: 100%; }
                        th { 
                            font-weight: bold; 
                            background-color: #dbeafe; /* Light Blue */
                            border: 1px solid #000000; 
                            padding: 5px;
                            text-align: left;
                        }
                        td { 
                            border: 1px solid #cccccc; 
                            padding: 5px; 
                            text-align: left; /* Left align dates/numbers */
                        }
                        .title-row {
                            font-size: 14pt;
                            font-weight: bold;
                            color: #1e3a8a;
                            border: none;
                        }
                        .total-row {
                            font-weight: bold;
                            background-color: #f3f4f6; /* Light Gray */
                            border-top: 2px solid #000000;
                        }
                    </style>
                </head>
                <body>
            `;

        // --- SECTION A: SUBJECTS ---
        table += `<table>`;
        table += `<tr><td colspan="3" class="title-row">SUBJECTS SUMMARY</td></tr>`;
        table += `<tr><td colspan="3" style="border:none; height:10px;"></td></tr>`;

        table += `
                <tr>
                    <th>Subject Name</th>
                    <th>Total Time Studied</th>
                </tr>
            `;

        subjects.forEach(sub => {
            table += `
                    <tr>
                        <td>${sub.name}</td>
                        <td>${sub.timeStudied || '0m'}</td>
                    </tr>
                `;
        });

        // *** NEW: TOTAL ROW ***
        table += `
                <tr class="total-row">
                    <td>GRAND TOTAL:</td>
                    <td>${grandTotalString}</td>
                </tr>
            `;

        table += `</table><br><br>`;

        // --- SECTION B: TASKS ---
        table += `<table>`;
        table += `<tr><td colspan="4" class="title-row">TASKS LIST</td></tr>`;
        table += `<tr><td colspan="4" style="border:none; height:10px;"></td></tr>`;

        table += `
                <tr>
                    <th>Task Name</th>
                    <th>Task Subject</th>
                    <th>Due Date</th>
                    <th>Status</th>
                </tr>
            `;

        tasks.forEach(task => {
            const status = task.completed ? "Completed" : "Pending";
            const statusStyle = task.completed ? 'style="color:green; font-weight:bold;"' : 'style="color:red;"';

            table += `
                    <tr>
                        <td>${task.name}</td>
                        <td>${task.subject}</td>
                        <td>${task.date}</td>
                        <td ${statusStyle}>${status}</td>
                    </tr>
                `;
        });
        table += `</table></body></html>`;

        // --- 3. DOWNLOAD FILE ---
        const blob = new Blob([table], { type: 'application/vnd.ms-excel' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "StudyMate_Report.xls";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
    });
}

// SETTINGS PAGE LOGIC
const clearDataBtn = document.querySelector('.data-management-card .clear-data-btn');
const settingsModal = document.querySelector('.settings-popup-card');
const confirmClearBtn = document.querySelector('.settings-popup-card .clear-data-btn'); // The red one inside popup
const cancelClearBtn = document.querySelector('.settings-popup-card .cancel-btn');
const themeColorBtns = document.querySelectorAll('.theme-color');

// 1. Theme Color Picker

// Helper: Convert Hex to RGBA for shadows
// This takes a color like "#ff0000" and an opacity like 0.4 and returns "rgba(255, 0, 0, 0.4)"
const hexToRgba = (hex, alpha) => {
    let r = 0, g = 0, b = 0;
    // Handle 3-digit hex (e.g. #f00) vs 6-digit hex (e.g. #ff0000)
    if (hex.length === 4) {
        r = parseInt("0x" + hex[1] + hex[1]);
        g = parseInt("0x" + hex[2] + hex[2]);
        b = parseInt("0x" + hex[3] + hex[3]);
    } else if (hex.length === 7) {
        r = parseInt("0x" + hex[1] + hex[2]);
        g = parseInt("0x" + hex[3] + hex[4]);
        b = parseInt("0x" + hex[5] + hex[6]);
    }
    return `rgba(${r},${g},${b},${alpha})`;
};

// Check for saved preferences
const savedColor = localStorage.getItem('themeColor') || '#2563eb';
const savedShadow = localStorage.getItem('themeShadow') || 'rgba(37, 99, 235, 0.4)';
const savedThemeName = localStorage.getItem('studyMate_themeName') || 'blue'; // Default to blue

// Apply saved values immediately
document.documentElement.style.setProperty('--primary-color', savedColor);
document.documentElement.style.setProperty('--primary-shadow', savedShadow);

// Apply "Selected" class to the correct button
themeColorBtns.forEach(btn => {
    btn.classList.remove('selected');
    if (btn.classList.contains(savedThemeName)) {
        btn.classList.add('selected');
    }
});

// Update UI selection
themeColorBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove selected class from all
        themeColorBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        let newColor = '#2563eb'; // Default Blue
        let themeName = 'blue';

        // Map classes to Hex codes
        if (btn.classList.contains('blue')) { newColor = '#2563eb'; themeName = 'blue'; }
        if (btn.classList.contains('red')) { newColor = '#DC2626'; themeName = 'red'; }
        if (btn.classList.contains('green')) { newColor = '#16A34A'; themeName = 'green'; }
        if (btn.classList.contains('orange')) { newColor = '#EA580C'; themeName = 'orange'; }
        if (btn.classList.contains('purple')) { newColor = '#7C3AED'; themeName = 'purple'; }

        // Calculate the new shadow (0.4 opacity)
        const newShadow = hexToRgba(newColor, 0.4);

        // Apply to CSS Variables
        document.documentElement.style.setProperty('--primary-color', newColor);
        document.documentElement.style.setProperty('--primary-shadow', newShadow);

        // Save to Storage
        localStorage.setItem('themeColor', newColor);
        localStorage.setItem('themeShadow', newShadow);
        localStorage.setItem('studyMate_themeName', themeName);

        // Update Timer Circle immediately if visible
        if (typeof updateTimerDisplay === 'function') updateTimerDisplay();
    });
});

// 2. Clear Data Logic
if (clearDataBtn) {
    clearDataBtn.addEventListener('click', () => {
        // Open Warning Modal
        settingsModal.style.display = 'flex';
    });
}

if (cancelClearBtn) {
    cancelClearBtn.addEventListener('click', () => {
        settingsModal.style.display = 'none';
    });
}

if (confirmClearBtn) {
    confirmClearBtn.addEventListener('click', () => {
        // 1. Clear LocalStorage
        localStorage.clear();

        // 2. Reload Page (This resets everything to default arrays)
        location.reload();
    });
}

// Helper (Optional): Only needed if you want dynamic hover colors
function adjustBrightness(col, amt) {
    // This is a complex function to darken hex colors. 
    // For this level of project, we can skip strict hex math 
    // or just return the same color.
    return col;
}


// DARK MODE LOGIC

// 1. Select elements
const themeToggleBtn = document.querySelector('.darkmode-button'); // The container in Settings
const themeToggleBackside = document.querySelector('.backside'); // The visual toggle track
const sidebarThemeBtn = document.querySelector('.sidebar-footer div[title="theme toggle"]'); // Sidebar icon

// 2. Function to enable Dark Mode
function enableDarkMode() {
    document.body.setAttribute('data-theme', 'dark');
    if (themeToggleBackside) themeToggleBackside.classList.add('active'); // Animate toggle
    localStorage.setItem('theme', 'dark'); // Save preference
}

// 3. Function to disable Dark Mode (Light Mode)
function disableDarkMode() {
    document.body.removeAttribute('data-theme');
    if (themeToggleBackside) themeToggleBackside.classList.remove('active'); // Animate toggle
    localStorage.setItem('theme', 'light'); // Save preference
}

// 4. Check Local Storage on Load
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
    enableDarkMode();
}

// 5. Event Listener for Settings Page Toggle
if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });
}

// 6. Event Listener for Sidebar Icon (Optional: if you want sidebar moon to toggle it too)
if (sidebarThemeBtn) {
    sidebarThemeBtn.addEventListener('click', () => {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            disableDarkMode();
        } else {
            enableDarkMode();
        }
    });
}
