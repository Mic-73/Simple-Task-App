// Simple todo app with localStorage persistence (extracted from taskSite.html)
// Uses dateUtils.js for date/time parsing and validation
// Assumes dateUtils is loaded as window.dateUtils
// Use dateUtils from window (browser)
const dateUtils = window.dateUtils;
const STORAGE_KEY = 'simple_app_tasks_v1';
const taskInput = document.getElementById('taskInput');
const urgencyInput = document.getElementById('urgencyInput');
const dateInput = document.getElementById('dateInput');
const timeInput = document.getElementById('timeInput');
const ampmSelect = document.getElementById('ampmSelect');
const urgencyError = document.getElementById('urgencyError');
const dateError = document.getElementById('dateError');
const timeError = document.getElementById('timeError');
const minuteInput = document.getElementById('minuteInput');
const minuteError = document.getElementById('minuteError');
const addBtn = document.getElementById('addBtn');
const taskList = document.getElementById('taskList');
const empty = document.getElementById('empty');
const clearAll = document.getElementById('clearAll');

let tasks = load();

// Normalize any existing stored dates to M/D/YYYY (remove leading zeros)
function normalizeExistingDates() {
    const re = /^(0?[1-9]|1[0-2])\/(0?[1-9]|[12][0-9]|3[01])\/(\d{4})$/;
    let changed = false;
    tasks.forEach(t => {
        if (t && t.date) {
            const m = re.exec(t.date);
            if (m) {
                const normalized = `${parseInt(m[1],10)}/${parseInt(m[2],10)}/${m[3]}`;
                if (t.date !== normalized) { t.date = normalized; changed = true; }
            }
        }
    });
    if (changed) save();
}

normalizeExistingDates();

function save(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function load(){ try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch(e){ return []; } }

// Helper: format a timestamp (ms since epoch) into a short local string
function formatTimestamp(ms) {
    try {
        const d = new Date(ms);
        return d.toLocaleString();
    } catch (e) {
        return String(ms);
    }
}

function render(){
    taskList.innerHTML = '';
    if (tasks.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    tasks.forEach((t, i) => {
            const li = document.createElement('li');

            const meta = document.createElement('div');
            meta.className = 'meta';

            const chk = document.createElement('input');
            chk.type = 'checkbox';
            chk.checked = !!t.done;
            chk.addEventListener('change', () => {
                tasks[i].done = chk.checked;
                save(); render();
            });

            const title = document.createElement('div');
            title.textContent = t.title;
            if (t.done) title.className = 'done';

            meta.appendChild(chk);
            meta.appendChild(title);

            // Add details (urgency, date/time, createdAt) next to the title
            const details = document.createElement('div');
            details.className = 'details';

            if (t.urgency !== null && t.urgency !== undefined) {
                const urgency = document.createElement('span');
                urgency.className = 'badge';
                urgency.textContent = `Urgency: ${t.urgency}`;
                details.appendChild(urgency);
            }

            // Show due date/time formatted as a localized pretty string.
            if (t.date || t.time) {
                const due = document.createElement('span');
                let pretty = '';
                if (t.dueTimestamp) {
                    try {
                        const d = new Date(t.dueTimestamp);
                        // localized date e.g. "Oct 26, 2025"
                        const dateStr = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                        // if time provided, include localized time e.g. "5:00 PM"
                        if (t.time !== null && t.time !== undefined) {
                            const timeStr = d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
                            pretty = `${dateStr} · ${timeStr}`;
                        } else {
                            pretty = dateStr;
                        }
                    } catch (e) {
                        // fallback to original stored date/time
                        let timeStrFallback = '';
                        if (t.time !== null && t.time !== undefined) {
                            const min = (t.minute !== null && t.minute !== undefined) ? String(t.minute).padStart(2, '0') : '00';
                            timeStrFallback = `${t.time}:${min}${t.ampm ? ' ' + t.ampm : ''}`;
                        }
                        pretty = [t.date || '', timeStrFallback].filter(Boolean).join(', ');
                    }
                } else {
                    let timeStrFallback = '';
                    if (t.time !== null && t.time !== undefined) {
                        const min = (t.minute !== null && t.minute !== undefined) ? String(t.minute).padStart(2, '0') : '00';
                        timeStrFallback = `${t.time}:${min}${t.ampm ? ' ' + t.ampm : ''}`;
                    }
                    pretty = [t.date || '', timeStrFallback].filter(Boolean).join(', ');
                }

                due.textContent = `Due: ${pretty}`;
                details.appendChild(due);
            }

            // If the task is done, mark the details as done too so they get crossed out
            if (t.done) details.classList.add('done');

            meta.appendChild(details);

            const actions = document.createElement('div');
            actions.className = 'actions';

            const del = document.createElement('button');
            del.textContent = 'Delete';
            del.className = 'btn-small ghost';
            del.style.background = 'transparent';
            del.addEventListener('click', () => {
                tasks.splice(i,1); save(); render();
            });

            actions.appendChild(del);

            li.appendChild(meta);
            li.appendChild(actions);
            taskList.appendChild(li);
        });
}


addBtn.addEventListener('click', () => {
    // clear previous errors and reset aria-invalid
    urgencyError.style.display = 'none';
    dateError.style.display = 'none';
    timeError.style.display = 'none';
    if (minuteError) minuteError.style.display = 'none';
    taskInput.setAttribute('aria-invalid', 'false');
    urgencyInput.setAttribute('aria-invalid', 'false');
    dateInput.setAttribute('aria-invalid', 'false');
    timeInput.setAttribute('aria-invalid', 'false');
    if (minuteInput) minuteInput.setAttribute('aria-invalid', 'false');

    const title = taskInput.value.trim();
    const urgencyRaw = urgencyInput.value.trim();
    const date = dateInput.value.trim();
    const timeRaw = timeInput.value.trim();
    const minuteRaw = minuteInput ? minuteInput.value.trim() : '';
    const ampm = ampmSelect ? ampmSelect.value : '';

    if (!title) {
        taskInput.setAttribute('aria-invalid', 'true');
        taskInput.focus();
        return;
    }

    // validate urgency (1-10)
    const urgencyNum = parseInt(urgencyRaw, 10);
    if (Number.isNaN(urgencyNum) || urgencyNum < 1 || urgencyNum > 10) {
        urgencyError.style.display = 'block';
        urgencyInput.setAttribute('aria-invalid', 'true');
        urgencyInput.focus();
        return;
    }

    // Use dateUtils to validate and build due date
    const result = dateUtils.validateAndBuildDue(date, timeRaw, minuteRaw, ampm);
    if (!result.ok) {
        if (result.error && result.error.toLowerCase().includes('date')) {
            dateError.style.display = 'block';
            dateInput.setAttribute('aria-invalid', 'true');
            dateInput.focus();
        } else if (result.error && result.error.toLowerCase().includes('time')) {
            timeError.style.display = 'block';
            timeInput.setAttribute('aria-invalid', 'true');
            timeInput.focus();
        } else if (result.error && result.error.toLowerCase().includes('minute')) {
            if (minuteError) minuteError.style.display = 'block';
            if (minuteInput) minuteInput.setAttribute('aria-invalid', 'true');
            if (minuteInput) minuteInput.focus();
        } else {
            // fallback: show date error
            dateError.style.display = 'block';
            dateInput.setAttribute('aria-invalid', 'true');
            dateInput.focus();
        }
        return;
    }

    // Extract normalized date and dueTimestamp from result
    const normalizedDate = result.normalizedDate;
    const dueDateObj = result.dueDateObj;
    const dueTimestamp = result.dueTimestamp;

    // Also parse time/minute for storage
    const timeParts = dateUtils.parseTimeParts(timeRaw, minuteRaw, ampm);
    let timeNum = null, minuteNum = null;
    if (timeParts) {
        timeNum = parseInt(timeRaw, 10);
        minuteNum = (minuteRaw !== '') ? parseInt(minuteRaw, 10) : 0;
    }

    tasks.unshift({
        title: title,
        urgency: urgencyNum,
        date: normalizedDate || null,
        time: timeNum,
        minute: (minuteRaw !== '' ? minuteNum : null),
        ampm: ampm || null,
        dueTimestamp: dueTimestamp || null,
        done: false,
        createdAt: Date.now()
    });

    taskInput.value = '';
    urgencyInput.value = '';
    dateInput.value = '';
    timeInput.value = '';
    if (minuteInput) minuteInput.value = '';
    if (ampmSelect) ampmSelect.value = 'am';

    save(); render();
    taskInput.focus();
});

taskInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addBtn.click();
});

clearAll.addEventListener('click', () => {
    if (!confirm('Remove all tasks?')) return;
    tasks = []; save(); render();
});

// initial render
render();
