/* GlassKey Studio - JavaScript Logic */
let audioCtx = null;
let isSustainContinuous = false;
let selectedSong = null;
let autoPlayTimer = null;
let currentSongIndex = 0;
const activeOscillators = {};

// Song Database: Bollywood, Bhojpuri, Tollywood, Hollywood
const songDatabase = [
    {
        id: 'kesariya',
        title: 'Kesariya',
        movie: 'Brahmastra',
        category: 'bollywood',
        notes: [
            {note: 'G4', dur: 400}, {note: 'A4', dur: 400}, {note: 'B4', dur: 500},
            {note: 'A4', dur: 400}, {note: 'G4', dur: 400}, {note: 'E4', dur: 600},
            {note: 'G4', dur: 400}, {note: 'A4', dur: 400}, {note: 'B4', dur: 800}
        ]
    },
    {
        id: 'lolipop',
        title: 'Lolipop Lagelu',
        movie: 'Pawan Singh Hit',
        category: 'bhojpuri',
        notes: [
            {note: 'C5', dur: 350}, {note: 'C5', dur: 350}, {note: 'D5', dur: 350}, {note: 'C5', dur: 350},
            {note: 'A4', dur: 350}, {note: 'G4', dur: 500}, {note: 'A4', dur: 350}, {note: 'C5', dur: 700}
        ]
    },
    {
        id: 'naatu',
        title: 'Naatu Naatu',
        movie: 'RRR',
        category: 'tollywood',
        notes: [
            {note: 'E4', dur: 250}, {note: 'G4', dur: 250}, {note: 'A4', dur: 250}, {note: 'A4', dur: 250},
            {note: 'C5', dur: 350}, {note: 'A4', dur: 250}, {note: 'G4', dur: 250}, {note: 'E4', dur: 500}
        ]
    },
    {
        id: 'believer',
        title: 'Believer',
        movie: 'Imagine Dragons',
        category: 'hollywood',
        notes: [
            {note: 'A4', dur: 300}, {note: 'A4', dur: 300}, {note: 'C5', dur: 300}, {note: 'A4', dur: 300},
            {note: 'G4', dur: 300}, {note: 'F4', dur: 300}, {note: 'E4', dur: 600}
        ]
    },
    {
        id: 'kalhoho',
        title: 'Kal Ho Naa Ho',
        movie: 'Shah Rukh Khan',
        category: 'bollywood',
        notes: [
            {note: 'G4', dur: 400}, {note: 'E4', dur: 400}, {note: 'F4', dur: 400}, {note: 'G4', dur: 600},
            {note: 'C5', dur: 400}, {note: 'B4', dur: 400}, {note: 'A4', dur: 800}
        ]
    },
    {
        id: 'raataan',
        title: 'Raataan Lambiyan',
        movie: 'Shershaah',
        category: 'bollywood',
        notes: [
            {note: 'C5', dur: 400}, {note: 'B4', dur: 400}, {note: 'A4', dur: 400}, {note: 'G4', dur: 500},
            {note: 'F4', dur: 400}, {note: 'E4', dur: 400}, {note: 'D4', dur: 700}
        ]
    }
];

const pianoKeys = [
    { note: 'C4', freq: 261.63, type: 'white', key: 'a', label: 'A' },
    { note: 'C#4', freq: 277.18, type: 'black', key: 'w', label: 'W', left: 36 },
    { note: 'D4', freq: 293.66, type: 'white', key: 's', label: 'S' },
    { note: 'D#4', freq: 311.13, type: 'black', key: 'e', label: 'E', left: 90 },
    { note: 'E4', freq: 329.63, type: 'white', key: 'd', label: 'D' },
    { note: 'F4', freq: 349.23, type: 'white', key: 'f', label: 'F' },
    { note: 'F#4', freq: 369.99, type: 'black', key: 't', label: 'T', left: 198 },
    { note: 'G4', freq: 392.00, type: 'white', key: 'g', label: 'G' },
    { note: 'G#4', freq: 415.30, type: 'black', key: 'y', label: 'Y', left: 252 },
    { note: 'A4', freq: 440.00, type: 'white', key: 'h', label: 'H' },
    { note: 'A#4', freq: 466.16, type: 'black', key: 'u', label: 'U', left: 306 },
    { note: 'B4', freq: 493.88, type: 'white', key: 'j', label: 'J' },
    { note: 'C5', freq: 523.25, type: 'white', key: 'k', label: 'K' },
    { note: 'C#5', freq: 554.37, type: 'black', key: 'o', label: 'O', left: 414 },
    { note: 'D5', freq: 587.33, type: 'white', key: 'l', label: 'L' },
    { note: 'D#5', freq: 622.25, type: 'black', key: 'p', label: 'P', left: 468 },
    { note: 'E5', freq: 659.25, type: 'white', key: ';', label: ';' }
];

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// Render Songs Grid
function renderSongs(songs) {
    const grid = document.getElementById('song-results-grid');
    grid.innerHTML = '';

    if (songs.length === 0) {
        grid.innerHTML = '<div style="color:var(--text-secondary); grid-column: 1/-1;">No matching songs found. You can import any local .mid song below!</div>';
        return;
    }

    songs.forEach(song => {
        const card = document.createElement('div');
        card.className = `song-card ${selectedSong && selectedSong.id === song.id ? 'active' : ''}`;
        card.onclick = () => selectSong(song);

        card.innerHTML = `
            <div>
                <div class="song-title">${song.title}</div>
                <div class="song-meta">${song.movie}</div>
            </div>
            <span class="tag">${song.category}</span>
        `;
        grid.appendChild(card);
    });
}

function filterSongs() {
    const query = document.getElementById('song-search-input').value.toLowerCase();
    const filtered = songDatabase.filter(s => s.title.toLowerCase().includes(query) || s.movie.toLowerCase().includes(query));
    renderSongs(filtered);
}

function filterCategory(cat) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (cat === 'all') {
        renderSongs(songDatabase);
    } else {
        renderSongs(songDatabase.filter(s => s.category === cat));
    }
}

function selectSong(song) {
    selectedSong = song;
    document.getElementById('now-playing-banner').innerText = `🎵 Selected: ${song.title} (${song.movie})`;
    renderSongs(songDatabase);
}

// Render Keyboard
function renderPiano() {
    const container = document.getElementById('piano');
    container.innerHTML = '';

    pianoKeys.forEach(kData => {
        const keyEl = document.createElement('div');
        keyEl.className = `key ${kData.type}`;
        keyEl.dataset.note = kData.note;

        if (kData.type === 'black' && kData.left) {
            keyEl.style.left = `${kData.left}px`;
        }

        keyEl.innerHTML = `<span class="key-label">${kData.label.toUpperCase()}<br><small>${kData.note}</small></span>`;

        keyEl.onmousedown = () => playNote(kData);
        keyEl.onmouseup = () => { if(!isSustainContinuous) stopNote(kData.note); };
        keyEl.onmouseleave = () => { if(!isSustainContinuous) stopNote(kData.note); };

        container.appendChild(keyEl);
    });
}

// Play Sound Logic
function playNote(kData) {
    initAudio();
    const note = kData.note;

    // If sound is already running and in continuous mode, don't restart
    if (activeOscillators[note] && isSustainContinuous) return;

    const waveform = document.getElementById('waveform-select').value;
    const masterVol = parseFloat(document.getElementById('volume-slider').value);

    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    osc.type = waveform;
    osc.frequency.setValueAtTime(kData.freq, audioCtx.currentTime);

    const now = audioCtx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(masterVol * 0.7, now + 0.05);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    osc.start(now);
    activeOscillators[note] = { osc, gainNode };

    // Update UI
    document.getElementById('note-display').innerText = note;
    const keyEl = document.querySelector(`[data-note="${note}"]`);
    if (keyEl) keyEl.classList.add('active');
}

function stopNote(note) {
    if (!activeOscillators[note]) return;
    const { osc, gainNode } = activeOscillators[note];
    const now = audioCtx.currentTime;

    gainNode.gain.cancelScheduledValues(now);
    gainNode.gain.setValueAtTime(gainNode.gain.value, now);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);

    osc.stop(now + 0.3);
    setTimeout(() => {
        delete activeOscillators[note];
    }, 300);

    const keyEl = document.querySelector(`[data-note="${note}"]`);
    if (keyEl) keyEl.classList.remove('active');
}

// Stop ALL audio manually
function stopAllAudio() {
    clearTimeout(autoPlayTimer);
    document.getElementById('auto-play-btn').innerText = "▶ Auto Play Song";

    Object.keys(activeOscillators).forEach(note => {
        try {
            activeOscillators[note].osc.stop();
        } catch(e){}
        delete activeOscillators[note];
    });

    document.querySelectorAll('.key').forEach(k => k.classList.remove('active'));
    document.getElementById('note-display').innerText = '🎹';
}

function toggleSustain() {
    isSustainContinuous = !isSustainContinuous;
    const btn = document.getElementById('sustain-btn');
    btn.classList.toggle('active', isSustainContinuous);
    btn.innerText = `Continuous Sound: ${isSustainContinuous ? 'ON (Stays Playing)' : 'Off'}`;

    if (!isSustainContinuous) {
        stopAllAudio();
    }
}

// Auto Play Selected Song Notes
function toggleAutoPlaySong() {
    if (!selectedSong) {
        alert("Pehle koi song search ya select karein!");
        return;
    }

    stopAllAudio();
    const btn = document.getElementById('auto-play-btn');
    btn.innerText = "⏸ Playing...";

    let delay = 0;
    selectedSong.notes.forEach((item, idx) => {
        autoPlayTimer = setTimeout(() => {
            const kData = pianoKeys.find(k => k.note === item.note);
            if (kData) {
                playNote(kData);
                setTimeout(() => {
                    if (!isSustainContinuous) stopNote(kData.note);
                }, item.dur * 0.8);
            }

            if (idx === selectedSong.notes.length - 1) {
                setTimeout(() => {
                    btn.innerText = "▶ Auto Play Song";
                }, item.dur);
            }
        }, delay);
        delay += item.dur;
    });
}

function setTheme(theme, btn) {
    document.body.setAttribute('data-theme', theme);
    document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
}

// Initialize on Load
window.onload = () => {
    renderSongs(songDatabase);
    renderPiano();
};
