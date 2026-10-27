/**
 * Interactive Date Invitation Application for Saiii 💕
 * Modules:
 * 1. Step Navigation & Transitions
 * 2. October 2026 Calendar Generator (Oct 28, 29, 30 only)
 * 3. Time Slots & Curfew Validation (Oct 30 after 6pm restriction)
 * 4. Ambient Floating Hearts Canvas
 * 5. Celebration Confetti Canvas
 * 6. Cute Audio Melodies (Web Audio API - offline & zero-dependency)
 * 7. Date Pass Summary & WhatsApp Integration
 */

// Application State
const state = {
  currentStep: 1,
  selectedDate: null,    // { year: 2026, month: 10, day: 28|29|30, dateString: '...' }
  selectedTime: null,    // e.g. "5:00 PM"
  selectedTimeMinutes: null, // minutes from midnight (e.g. 17:00 = 1020)
  meetingLocation: '',
  sweetNote: '',
  audioPlaying: false
};

// Available Golden Days
const VALID_DAYS = [28, 29, 30];
const CURFEW_DAY = 30;
const CURFEW_MINUTES = 18 * 60; // 6:00 PM = 1080 minutes

// DOM Elements
const elements = {
  // Steps
  step1: document.getElementById('step1'),
  step2: document.getElementById('step2'),
  step3: document.getElementById('step3'),
  step4: document.getElementById('step4'),

  // Step 1 Buttons
  btnYes: document.getElementById('btnYes'),
  btnNo: document.getElementById('btnNo'),

  // Step 2 Calendar & Time
  calendarGrid: document.getElementById('calendarGrid'),
  selectedDayBanner: document.getElementById('selectedDayBanner'),
  selectedDayText: document.getElementById('selectedDayText'),
  timeSection: document.getElementById('timeSection'),
  timeSlotsContainer: document.getElementById('timeSlotsContainer'),
  customTimeInput: document.getElementById('customTimeInput'),
  btnConfirmCustomTime: document.getElementById('btnConfirmCustomTime'),
  btnBackToStep1: document.getElementById('btnBackToStep1'),
  btnToStep3: document.getElementById('btnToStep3'),

  // Step 3 Preferences
  meetingLocation: document.getElementById('meetingLocation'),
  quickLocationChips: document.getElementById('quickLocationChips'),
  sweetNote: document.getElementById('sweetNote'),
  btnBackToStep2: document.getElementById('btnBackToStep2'),
  btnToStep4: document.getElementById('btnToStep4'),

  // Step 4 Confirmation Pass
  ticketDate: document.getElementById('ticketDate'),
  ticketTime: document.getElementById('ticketTime'),
  ticketLocation: document.getElementById('ticketLocation'),
  ticketNoteBox: document.getElementById('ticketNoteBox'),
  ticketNoteText: document.getElementById('ticketNoteText'),
  btnShareWhatsApp: document.getElementById('btnShareWhatsApp'),
  btnAddToCalendar: document.getElementById('btnAddToCalendar'),
  btnStartOver: document.getElementById('btnStartOver'),

  // Modals
  homeCurfewModal: document.getElementById('homeCurfewModal'),
  btnCloseCurfewModal: document.getElementById('btnCloseCurfewModal'),
  noResponseModal: document.getElementById('noResponseModal'),
  btnChangeMindYes: document.getElementById('btnChangeMindYes'),
  btnCloseNoModal: document.getElementById('btnCloseNoModal'),

  // Audio Toggle
  bgMusicToggle: document.getElementById('bgMusicToggle')
};

// Standard Time Slot List
const DEFAULT_TIME_SLOTS = [
  { label: '11:00 AM', minutes: 11 * 60 },
  { label: '12:30 PM', minutes: 12.5 * 60 },
  { label: '02:00 PM', minutes: 14 * 60 },
  { label: '03:30 PM', minutes: 15.5 * 60 },
  { label: '04:30 PM', minutes: 16.5 * 60 },
  { label: '05:30 PM', minutes: 17.5 * 60 },
  { label: '06:00 PM', minutes: 18 * 60 },
  { label: '06:30 PM', minutes: 18.5 * 60 },
  { label: '07:30 PM', minutes: 19.5 * 60 },
  { label: '08:30 PM', minutes: 20.5 * 60 }
];

/* ==========================================================================
   1. MODULE: STEP NAVIGATION & TRANSITIONS
   ========================================================================== */

function goToStep(stepNumber) {
  state.currentStep = stepNumber;

  const allSteps = [elements.step1, elements.step2, elements.step3, elements.step4];
  allSteps.forEach((stepEl, idx) => {
    if (idx + 1 === stepNumber) {
      stepEl.classList.add('active');
      stepEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      stepEl.classList.remove('active');
    }
  });

  if (stepNumber === 4) {
    populateTicket();
    triggerConfetti();
  }
}

/* ==========================================================================
   2. MODULE: OCTOBER 2026 CALENDAR GENERATOR
   ========================================================================== */

function initOctober2026Calendar() {
  elements.calendarGrid.innerHTML = '';

  // In October 2026:
  // Oct 1, 2026 is a Thursday (index 4: Sun=0, Mon=1, Tue=2, Wed=3, Thu=4)
  const firstDayOfWeek = 4;
  const totalDaysInOctober = 31;

  // Add empty placeholders for days before Oct 1
  for (let i = 0; i < firstDayOfWeek; i++) {
    const emptyCell = document.createElement('div');
    emptyCell.className = 'cal-day empty';
    elements.calendarGrid.appendChild(emptyCell);
  }

  // Populate days 1 to 31
  for (let day = 1; day <= totalDaysInOctober; day++) {
    const dayBtn = document.createElement('button');
    dayBtn.type = 'button';
    dayBtn.textContent = day;
    dayBtn.className = 'cal-day';
    dayBtn.setAttribute('data-day', day);

    // Only Oct 28, 29, 30 are available!
    if (VALID_DAYS.includes(day)) {
      dayBtn.classList.add('available');
      dayBtn.title = `Oct ${day}, 2026 - Available for our date! 💕`;
      dayBtn.addEventListener('click', () => selectCalendarDay(day, dayBtn));
    } else {
      dayBtn.classList.add('disabled');
      dayBtn.disabled = true;
      dayBtn.title = 'Not available';
    }

    elements.calendarGrid.appendChild(dayBtn);
  }
}

function selectCalendarDay(day, dayBtnElement) {
  // Clear previous selection
  document.querySelectorAll('.cal-day.available').forEach(el => el.classList.remove('selected'));
  dayBtnElement.classList.add('selected');

  const dayNames = {
    28: 'Wednesday',
    29: 'Thursday',
    30: 'Friday'
  };

  state.selectedDate = {
    year: 2026,
    month: 10,
    day: day,
    dayName: dayNames[day] || 'Day',
    display: `Oct ${day}, 2026 (${dayNames[day]})`
  };

  // Update banner
  if (day === CURFEW_DAY) {
    elements.selectedDayBanner.innerHTML = `
      <span class="banner-icon">📌</span>
      <span><strong>Oct 30, 2026 (Friday)</strong> selected! <em>(Note: I must go home by 6:00 PM! 🏡)</em></span>
    `;
  } else {
    elements.selectedDayBanner.innerHTML = `
      <span class="banner-icon">💖</span>
      <span><strong>Oct ${day}, 2026 (${dayNames[day]})</strong> selected! Perfect choice!</span>
    `;
  }

  // Reveal time slots
  renderTimeSlotsForDate(day);
  elements.timeSection.style.display = 'block';

  // Reset previously chosen time when switching dates
  state.selectedTime = null;
  state.selectedTimeMinutes = null;
  elements.btnToStep3.disabled = true;
}

/* ==========================================================================
   3. MODULE: TIME SLOTS & CURFEW VALIDATION
   ========================================================================== */

function renderTimeSlotsForDate(day) {
  elements.timeSlotsContainer.innerHTML = '';

  DEFAULT_TIME_SLOTS.forEach(slot => {
    const pill = document.createElement('button');
    pill.type = 'button';
    pill.className = 'time-slot-pill';
    pill.setAttribute('data-minutes', slot.minutes);

    const isPastCurfew = (day === CURFEW_DAY && slot.minutes > CURFEW_MINUTES);

    if (isPastCurfew) {
      pill.classList.add('curfew-slot');
      pill.innerHTML = `
        <span>${slot.label}</span>
        <span class="time-curfew-tag">After 6 PM 🏠</span>
      `;
    } else {
      pill.innerHTML = `<span>${slot.label}</span>`;
    }

    pill.addEventListener('click', () => handleTimeSlotSelection(slot, day, pill));
    elements.timeSlotsContainer.appendChild(pill);
  });
}

function handleTimeSlotSelection(slot, day, pillElement) {
  // CRITICAL REQUIREMENT:
  // "after 6pm of oct30 it should not availble a popup notificationn should come sorry i will go to my home like that"
  if (day === CURFEW_DAY && slot.minutes > CURFEW_MINUTES) {
    showHomeCurfewModal();
    return;
  }

  // Valid selection
  document.querySelectorAll('.time-slot-pill').forEach(el => el.classList.remove('active'));
  pillElement.classList.add('active');

  state.selectedTime = slot.label;
  state.selectedTimeMinutes = slot.minutes;
  elements.btnToStep3.disabled = false;
}

function validateAndSetCustomTime() {
  const val = elements.customTimeInput.value;
  if (!val) {
    alert('Please pick a time first, Saiii! 💕');
    return;
  }

  if (!state.selectedDate) {
    alert('Please pick a date first! 💕');
    return;
  }

  const [hoursStr, minsStr] = val.split(':');
  const hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minsStr, 10);
  const totalMinutes = (hours * 60) + minutes;

  // Check Oct 30 curfew
  if (state.selectedDate.day === CURFEW_DAY && totalMinutes > CURFEW_MINUTES) {
    showHomeCurfewModal();
    return;
  }

  // Format nicely (12h with AM/PM)
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMins = minutes < 10 ? '0' + minutes : minutes;
  const formattedTime = `${displayHours}:${displayMins} ${ampm}`;

  // Clear active pills
  document.querySelectorAll('.time-slot-pill').forEach(el => el.classList.remove('active'));

  state.selectedTime = formattedTime;
  state.selectedTimeMinutes = totalMinutes;
  elements.btnToStep3.disabled = false;

  // Visual confirmation
  elements.selectedDayBanner.innerHTML = `
    <span class="banner-icon">⏰</span>
    <span>Date set: <strong>${state.selectedDate.display}</strong> at <strong>${formattedTime}</strong>! 🥰</span>
  `;
}

function showHomeCurfewModal() {
  elements.homeCurfewModal.classList.add('open');
}

function closeHomeCurfewModal() {
  elements.homeCurfewModal.classList.remove('open');
}

/* ==========================================================================
   4. MODULE: "NO" BUTTON & SWEET MODAL
   ========================================================================== */

function handleNoButtonClick() {
  elements.noResponseModal.classList.add('open');
}

function closeNoModal() {
  elements.noResponseModal.classList.remove('open');
}

// Optional playful slight evasion on desktop hover
let dodgeCount = 0;
elements.btnNo.addEventListener('mouseenter', () => {
  if (window.innerWidth > 600 && dodgeCount < 2) {
    const randomX = (Math.random() - 0.5) * 60;
    const randomY = (Math.random() - 0.5) * 40;
    elements.btnNo.style.transform = `translate(${randomX}px, ${randomY}px)`;
    dodgeCount++;
  }
});

/* ==========================================================================
   5. MODULE: PREFERENCES (WHERE WE MEET)
   ========================================================================== */

function initPreferences() {
  // Quick location suggestions
  const chips = elements.quickLocationChips ? elements.quickLocationChips.querySelectorAll('.loc-chip') : [];
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      elements.meetingLocation.value = chip.getAttribute('data-loc');
      state.meetingLocation = elements.meetingLocation.value;
    });
  });

  if (elements.meetingLocation) {
    elements.meetingLocation.addEventListener('input', (e) => {
      state.meetingLocation = e.target.value;
      // un-highlight chips if user types custom
      chips.forEach(c => c.classList.remove('active'));
    });
  }
}

/* ==========================================================================
   6. MODULE: TICKET GENERATION & INTEGRATIONS
   ========================================================================== */

function populateTicket() {
  elements.ticketDate.textContent = state.selectedDate ? state.selectedDate.display : 'Oct 28, 2026';
  elements.ticketTime.textContent = state.selectedTime || '5:00 PM';
  
  const loc = (elements.meetingLocation && elements.meetingLocation.value.trim()) || 'Our Special Spot 💕';
  elements.ticketLocation.textContent = loc;

  const note = elements.sweetNote.value.trim();
  if (note) {
    elements.ticketNoteText.textContent = `"${note}"`;
    elements.ticketNoteBox.style.display = 'block';
  } else {
    elements.ticketNoteBox.style.display = 'none';
  }
}

const NANDHINI_WHATSAPP_NUMBER = '916374439661';

function getWhatsAppUrl() {
  const dateStr = state.selectedDate ? state.selectedDate.display : 'our date';
  const timeStr = state.selectedTime || 'soon';
  const location = (elements.meetingLocation && elements.meetingLocation.value.trim()) || 'Our Special Spot 💕';
  const note = elements.sweetNote.value.trim();

  let message = `Hi Nandhini! 💖 It's confirmed! Our date is locked in! 🥰\n\n`;
  message += `📅 Date: ${dateStr}\n`;
  message += `⏰ Time: ${timeStr}\n`;
  message += `📍 Where We Meet: ${location}\n`;
  if (note) {
    message += `💌 My Note for You: "${note}"\n`;
  }
  message += `\nI can't wait to see you! 💕`;

  const encoded = encodeURIComponent(message);
  return `https://wa.me/${NANDHINI_WHATSAPP_NUMBER}?text=${encoded}`;
}

function shareOnWhatsApp() {
  const url = getWhatsAppUrl();
  window.open(url, '_blank');
}

function downloadCalendarEvent() {
  if (!state.selectedDate || !state.selectedTime) return;

  const year = state.selectedDate.year;
  const month = String(state.selectedDate.month).padStart(2, '0');
  const day = String(state.selectedDate.day).padStart(2, '0');

  // Convert minutes into hours and minutes
  const totalMins = state.selectedTimeMinutes || (17 * 60);
  const startHours = Math.floor(totalMins / 60);
  const startMins = totalMins % 60;
  const endHours = Math.min(startHours + 2, 23);

  const startHourStr = String(startHours).padStart(2, '0');
  const startMinStr = String(startMins).padStart(2, '0');
  const endHourStr = String(endHours).padStart(2, '0');

  const dtStart = `${year}${month}${day}T${startHourStr}${startMinStr}00`;
  const dtEnd = `${year}${month}${day}T${endHourStr}${startMinStr}00`;
  const location = (elements.meetingLocation && elements.meetingLocation.value.trim()) || 'Our Special Spot';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Special Date Invitation//Saiii Date//EN',
    'BEGIN:VEVENT',
    `SUMMARY:💖 Date with Saiii`,
    `LOCATION:${location}`,
    `DESCRIPTION:Our special date! Meeting at: ${location}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Date-With-Saiii-${state.selectedDate.day}Oct2026.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/* ==========================================================================
   7. MODULE: AMBIENT FLOATING HEARTS CANVAS
   ========================================================================== */

function initHeartCanvas() {
  const canvas = document.getElementById('heartCanvas');
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const hearts = [];
  const heartColors = [
    'rgba(244, 63, 94, 0.4)',
    'rgba(251, 113, 133, 0.45)',
    'rgba(244, 114, 182, 0.35)',
    'rgba(225, 29, 72, 0.3)',
    'rgba(253, 164, 175, 0.5)'
  ];

  class Heart {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 30;
      this.size = Math.random() * 14 + 10;
      this.speedY = Math.random() * 0.8 + 0.4;
      this.speedX = (Math.random() - 0.5) * 0.6;
      this.opacity = Math.random() * 0.6 + 0.2;
      this.color = heartColors[Math.floor(Math.random() * heartColors.length)];
      this.rotation = (Math.random() - 0.5) * 0.5;
      this.rotSpeed = (Math.random() - 0.5) * 0.02;
    }

    update() {
      this.y -= this.speedY;
      this.x += this.speedX + Math.sin(this.y * 0.015) * 0.5;
      this.rotation += this.rotSpeed;
      if (this.y < -40) this.reset();
    }

    draw() {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.scale(this.size / 24, this.size / 24);
      ctx.fillStyle = this.color;
      ctx.beginPath();
      // Draw heart path
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(-12, -14, -24, 6, 0, 22);
      ctx.bezierCurveTo(24, 6, 12, -14, 0, 0);
      ctx.fill();
      ctx.restore();
    }
  }

  // Create 26 gentle floating hearts
  for (let i = 0; i < 26; i++) {
    hearts.push(new Heart());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    hearts.forEach(h => {
      h.update();
      h.draw();
    });
    requestAnimationFrame(animate);
  }
  animate();
}

/* ==========================================================================
   8. MODULE: CONFETTI CELEBRATION CANVAS
   ========================================================================== */

function triggerConfetti() {
  const canvas = document.getElementById('confettiCanvas');
  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles = [];
  const colors = ['#f43f5e', '#fb7185', '#fbbf24', '#f472b6', '#ffffff', '#e11d48'];

  for (let i = 0; i < 90; i++) {
    particles.push({
      x: width / 2,
      y: height / 2,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 14,
      vy: (Math.random() - 0.8) * 16,
      gravity: 0.35,
      alpha: 1,
      decay: Math.random() * 0.015 + 0.01,
      rotation: Math.random() * 360,
      isHeart: Math.random() > 0.4
    });
  }

  let animationFrame;
  function updateConfetti() {
    ctx.clearRect(0, 0, width, height);
    let activeParticles = 0;

    particles.forEach(p => {
      if (p.alpha > 0) {
        activeParticles++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.alpha -= p.decay;
        p.rotation += 4;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;

        if (p.isHeart) {
          ctx.beginPath();
          ctx.scale(p.size / 15, p.size / 15);
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(-6, -7, -12, 3, 0, 11);
          ctx.bezierCurveTo(12, 3, 6, -7, 0, 0);
          ctx.fill();
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      }
    });

    if (activeParticles > 0) {
      animationFrame = requestAnimationFrame(updateConfetti);
    } else {
      ctx.clearRect(0, 0, width, height);
      cancelAnimationFrame(animationFrame);
    }
  }

  updateConfetti();
}

/* ==========================================================================
   9. MODULE: SWEET CHORD SYNTHESIZER (Web Audio API)
   ========================================================================== */

let audioCtx = null;
let melodyInterval = null;

function toggleMusic() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContextClass();
  }

  if (state.audioPlaying) {
    stopMelody();
  } else {
    startMelody();
  }
}

function startMelody() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  state.audioPlaying = true;
  elements.bgMusicToggle.classList.add('playing');
  elements.bgMusicToggle.querySelector('.music-label').textContent = 'Melody Playing 🎶';

  // Romantic Pentatonic Progression (C Major / A Minor romantic notes)
  const notes = [
    [261.63, 329.63, 392.00, 523.25], // C Major
    [220.00, 261.63, 329.63, 440.00], // A Minor
    [349.23, 440.00, 523.25, 698.46], // F Major
    [392.00, 493.88, 587.33, 783.99]  // G Major
  ];

  let chordIdx = 0;
  playChord(notes[chordIdx]);

  melodyInterval = setInterval(() => {
    chordIdx = (chordIdx + 1) % notes.length;
    playChord(notes[chordIdx]);
  }, 2400);
}

function stopMelody() {
  state.audioPlaying = false;
  elements.bgMusicToggle.classList.remove('playing');
  elements.bgMusicToggle.querySelector('.music-label').textContent = 'Romantic Melodies';
  if (melodyInterval) clearInterval(melodyInterval);
}

function playChord(chordFrequencies) {
  if (!audioCtx || !state.audioPlaying) return;

  chordFrequencies.forEach((freq, idx) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Soft gentle attack & decay
    const now = audioCtx.currentTime + (idx * 0.12);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.0);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 2.1);
  });
}

/* ==========================================================================
   10. INITIALIZATION & EVENT LISTENERS
   ========================================================================== */

function setupEventListeners() {
  // Step 1: Proposal Actions
  elements.btnYes.addEventListener('click', () => {
    goToStep(2);
  });

  elements.btnNo.addEventListener('click', handleNoButtonClick);

  // Curfew Modal Close
  elements.btnCloseCurfewModal.addEventListener('click', closeHomeCurfewModal);
  elements.homeCurfewModal.addEventListener('click', (e) => {
    if (e.target === elements.homeCurfewModal) closeHomeCurfewModal();
  });

  // "No" Response Modal Actions
  elements.btnCloseNoModal.addEventListener('click', closeNoModal);
  elements.btnChangeMindYes.addEventListener('click', () => {
    closeNoModal();
    goToStep(2);
  });
  elements.noResponseModal.addEventListener('click', (e) => {
    if (e.target === elements.noResponseModal) closeNoModal();
  });

  // Step 2 Navigation
  elements.btnBackToStep1.addEventListener('click', () => goToStep(1));
  elements.btnToStep3.addEventListener('click', () => {
    if (!state.selectedDate || !state.selectedTime) {
      alert('Please choose both a date and time slot first! 💕');
      return;
    }
    goToStep(3);
  });

  // Custom Time Confirmation
  elements.btnConfirmCustomTime.addEventListener('click', validateAndSetCustomTime);

  // Step 3 Navigation
  elements.btnBackToStep2.addEventListener('click', () => goToStep(2));
  elements.btnToStep4.addEventListener('click', () => {
    goToStep(4);
    // Automatic direct message opening to Nandhini's WhatsApp (6374439661)
    shareOnWhatsApp();
  });

  // Step 4 Ticket Actions
  elements.btnShareWhatsApp.addEventListener('click', shareOnWhatsApp);
  elements.btnAddToCalendar.addEventListener('click', downloadCalendarEvent);
  elements.btnStartOver.addEventListener('click', () => {
    goToStep(1);
    elements.btnToStep3.disabled = true;
    document.querySelectorAll('.cal-day.available').forEach(el => el.classList.remove('selected'));
    document.querySelectorAll('.time-slot-pill').forEach(el => el.classList.remove('active'));
    elements.timeSection.style.display = 'none';
    elements.selectedDayBanner.innerHTML = `
      <span class="banner-icon">📌</span>
      <span>Please pick one of our available days above!</span>
    `;
  });

  // Audio Toggle
  elements.bgMusicToggle.addEventListener('click', toggleMusic);
}

// Bootstrap Application
document.addEventListener('DOMContentLoaded', () => {
  initOctober2026Calendar();
  initPreferences();
  initHeartCanvas();
  setupEventListeners();
});
