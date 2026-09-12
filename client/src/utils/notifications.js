// Handles browser notification permission + loud, distinct audible chimes
// for journey milestones. Uses the Web Audio API to synthesize tones so no
// external sound files are needed (and nothing to fail to load).

const STORAGE_KEY = 'wmb_notifications_enabled';

let audioCtx = null;
const getAudioCtx = () => {
  if (!audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    audioCtx = new Ctx();
  }
  return audioCtx;
};

// Plays one or more short tones in sequence. `notes` is an array of
// { freq, duration } in Hz/seconds. Gain is set high (0.9) so it's clearly
// audible - each note has a quick attack/decay envelope so it doesn't click.
function playTones(notes) {
  try {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    let startTime = ctx.currentTime;
    notes.forEach(({ freq, duration = 0.18 }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(ctx.destination);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.9, startTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
      startTime += duration + 0.06;
    });
  } catch {
    // Web Audio unsupported or blocked - notification still shows visually.
  }
}

const CHIMES = {
  start: () => playTones([{ freq: 880, duration: 0.16 }, { freq: 1175, duration: 0.22 }]),
  milestone: () => playTones([{ freq: 660, duration: 0.16 }, { freq: 660, duration: 0.16 }]),
  arriving: () => playTones([{ freq: 988, duration: 0.14 }, { freq: 1319, duration: 0.14 }, { freq: 1568, duration: 0.24 }]),
  reroute: () => playTones([{ freq: 784, duration: 0.16 }, { freq: 587, duration: 0.22 }]),
};

export function areNotificationsEnabled() {
  return localStorage.getItem(STORAGE_KEY) === 'true' && typeof Notification !== 'undefined' && Notification.permission === 'granted';
}

export async function enableNotifications() {
  if (typeof Notification === 'undefined') return false;
  const permission = await Notification.requestPermission();
  const granted = permission === 'granted';
  localStorage.setItem(STORAGE_KEY, granted ? 'true' : 'false');
  return granted;
}

export function disableNotifications() {
  localStorage.setItem(STORAGE_KEY, 'false');
}

// Fires a browser notification (if permitted) and always plays the sound,
// since the sound is the part people are most likely to actually notice.
export function notify(title, body, chime = 'milestone') {
  (CHIMES[chime] || CHIMES.milestone)();

  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    try {
      new Notification(title, { body, icon: undefined, tag: `wmb-${chime}-${Date.now()}` });
    } catch {
      // Some browsers (mobile Safari) don't support the Notification constructor directly - sound already played.
    }
  }
}