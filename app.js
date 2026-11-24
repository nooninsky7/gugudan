/**
 * 신나는 구구단 탐험대 (Gugudan Adventure)
 * 버그 전면 박멸 & 완벽 검증된 학습 스크립트
 */

// --- 1. 오디오 합성기 (Web Audio API) ---
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('gugudan_sound_muted') === 'true';
    this.updateSoundBtn();
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.muted = !this.muted;
    localStorage.setItem('gugudan_sound_muted', this.muted);
    this.updateSoundBtn();
    if (!this.muted) {
      this.playBeep(440, 0.1);
    }
  }

  updateSoundBtn() {
    const btn = document.getElementById('btn-sound-toggle');
    if (btn) btn.textContent = this.muted ? '🔇' : '🔊';
  }

  playTone(freq, duration, type = 'sine', gainVal = 0.15) {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  }

  playBeep(freq = 520, duration = 0.05) {
    this.playTone(freq, duration, 'triangle', 0.08);
  }

  playCorrect() {
    if (this.muted) return;
    this.init();
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      setTimeout(() => {
        this.playTone(freq, 0.22, 'triangle', 0.18);
      }, i * 65);
    });
  }

  playWrong() {
    if (this.muted) return;
    this.init();
    this.playTone(330, 0.12, 'sawtooth', 0.08);
    setTimeout(() => {
      this.playTone(260, 0.2, 'sawtooth', 0.08);
    }, 100);
  }

  playStamp() {
    if (this.muted) return;
    this.init();
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.25);

      gain.gain.setValueAtTime(0.4, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.25);
    } catch (e) {}
  }

  playFanfare() {
    if (this.muted) return;
    this.init();
    const fanfareNotes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 523.25, d: 0.12, t: 140 },
      { f: 523.25, d: 0.12, t: 280 },
      { f: 659.25, d: 0.3,  t: 420 },
      { f: 783.99, d: 0.5,  t: 700 }
    ];
    fanfareNotes.forEach(n => {
      setTimeout(() => {
        this.playTone(n.f, n.d, 'triangle', 0.22);
      }, n.t);
    });
  }
}

const sounds = new SoundManager();

// --- 2. 콘페티(폭죽 파티클) 시스템 ---
class ConfettiEffect {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x = window.innerWidth / 2, y = window.innerHeight / 3, count = 50) {
    const colors = ['#FF5722', '#FFCA28', '#42A5F5', '#66BB6A', '#AB47BC', '#EC407A'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3.5,
        size: Math.random() * 9 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1,
        decay: Math.random() * 0.02 + 0.012,
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 12
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  megaBurst() {
    // 7단계 연속 초대형 축하 폭죽 세레모니 (신기록 달성용!)
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.burst(w * 0.5, h * 0.45, 90);
    setTimeout(() => this.burst(w * 0.25, h * 0.35, 80), 200);
    setTimeout(() => this.burst(w * 0.75, h * 0.35, 80), 400);
    setTimeout(() => this.burst(w * 0.4, h * 0.25, 95), 600);
    setTimeout(() => this.burst(w * 0.6, h * 0.25, 95), 800);
    setTimeout(() => this.burst(w * 0.2, h * 0.4, 85), 1000);
    setTimeout(() => this.burst(w * 0.8, h * 0.4, 85), 1200);
    setTimeout(() => this.burst(w * 0.5, h * 0.3, 120), 1400);
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22;
      p.life -= p.decay;
      p.rotation += p.rotSpeed;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.life;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}

let confetti = null;

// --- 3. 애플리케이션 상태 관리 ---
const state = {
  stars: 0,
  stamps: [],
  stampProgress: {
    rhythm: 0,
    speed: 0,
    reverse: 0,
    missing: 0,
    order: 0,
    subtraction: 0
  },
  rewardCoupon: '맛있는 아이스크림 먹기 🍦',
  selectedDans: [2, 3, 4, 5, 6, 7, 8, 9],
  wrongProblems: [],
  records: {}, // 모드/단수별 1~5위 시간 기록 보관함
  lastCompletedMode: 'speed',
  currentGame: {
    mode: 'speed', // 'speed', 'reverse', 'missing', 'order', 'review'
    questions: [],
    currentIndex: 0,
    currentInput: '',
    correctCount: 0,
    combo: 0,
    maxCombo: 0,
    currentWrongInRound: [],
    timerInterval: null,
    timeLeftPercent: 100,
    questionStartTime: 0,
    roundStartTime: 0,
    liveTimerInterval: null,
    isStarted: false
  },
  rhythmTrainer: {
    dan: 2,
    direction: 'forward', // 'forward' | 'reverse'
    isPlaying: false,
    currentIndex: 0,
    orderList: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    stepTimer: null,
    revealTimer: null,
    isRevealed: false,
    startTime: 0,
    liveTimerInterval: null
  }
};

// 레벨 정의
const LEVELS = [
  { stars: 0, title: '구구단 새싹 🌱', avatar: '🐥' },
  { stars: 20, title: '구구단 탐험가 🎒', avatar: '🐰' },
  { stars: 50, title: '구구단 닌자 ⚔️', avatar: '🦊' },
  { stars: 100, title: '구구단 마법사 🧙‍♂️', avatar: '🦁' },
  { stars: 200, title: '구구단 드래곤 마스터 👑', avatar: '🐲' }
];

// --- 4. 초기화 및 저장소 로드 ---
document.addEventListener('DOMContentLoaded', () => {
  confetti = new ConfettiEffect('confetti-canvas');
  loadSavedData();
  setupDanChips();
  setupKeyboardListener();
  setupRhythmScreenListener();

  const soundBtn = document.getElementById('btn-sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => sounds.toggle());
  }
});

function loadSavedData() {
  const savedStars = localStorage.getItem('gugudan_total_stars');
  if (savedStars) state.stars = parseInt(savedStars, 10) || 0;

  // [사용자 요청 반영] 테스트 기록 전체 리셋 및 스탬프 8개 원복 1회 자동 마이그레이션
  const RESET_TEST_FLAG = 'gugudan_reset_records_stamps_v2';
  if (!localStorage.getItem(RESET_TEST_FLAG)) {
    localStorage.removeItem('gugudan_time_records');
    state.records = {};

    state.stamps = [
      { type: 'gold', title: '100점 만점', date: '구구단 달인' },
      { type: 'normal', title: '참 잘했어요', date: '2단 완주' },
      { type: 'normal', title: '아주 훌륭해요', date: '3단 완주' },
      { type: 'gold', title: '100점 만점', date: '4단 완주' },
      { type: 'normal', title: '참 잘했어요', date: '5단 완주' },
      { type: 'normal', title: '우수 훈련', date: '순간 반응' },
      { type: 'gold', title: '참 잘했어요', date: '거꾸로 도전' },
      { type: 'normal', title: '아주 훌륭해요', date: '구구단 탐정' }
    ];
    localStorage.setItem('gugudan_stamps', JSON.stringify(state.stamps));
    localStorage.setItem(RESET_TEST_FLAG, 'true');
  } else {
    const savedStamps = localStorage.getItem('gugudan_stamps');
    if (savedStamps) {
      try {
        state.stamps = JSON.parse(savedStamps) || [];
      } catch (e) {
        state.stamps = [];
      }
    }

    const savedRecords = localStorage.getItem('gugudan_time_records');
    if (savedRecords) {
      try {
        state.records = JSON.parse(savedRecords) || {};
      } catch (e) {
        state.records = {};
      }
    }
  }

  const savedCoupon = localStorage.getItem('gugudan_reward_coupon');
  if (savedCoupon) state.rewardCoupon = savedCoupon;

  // 다시풀기(오답 노트) 리셋 반영: 기존에 쌓인 테스트 오답 자동 초기화
  if (!localStorage.getItem('gugudan_wrong_reset_v1')) {
    localStorage.removeItem('gugudan_wrong_problems');
    localStorage.setItem('gugudan_wrong_reset_v1', 'true');
    state.wrongProblems = [];
  } else {
    const savedWrongs = localStorage.getItem('gugudan_wrong_problems');
    if (savedWrongs) {
      try {
        state.wrongProblems = JSON.parse(savedWrongs) || [];
      } catch (e) {
        state.wrongProblems = [];
      }
    }
  }

  const savedStampProgress = localStorage.getItem('gugudan_stamp_progress');
  if (savedStampProgress) {
    try {
      state.stampProgress = Object.assign({ rhythm: 0, speed: 0, reverse: 0, missing: 0, order: 0, subtraction: 0 }, JSON.parse(savedStampProgress));
    } catch (e) {
      state.stampProgress = { rhythm: 0, speed: 0, reverse: 0, missing: 0, order: 0, subtraction: 0 };
    }
  } else {
    state.stampProgress = { rhythm: 0, speed: 0, reverse: 0, missing: 0, order: 0, subtraction: 0 };
  }

  updateUserBadge();
  updateHeaderStampCount();
  updateWrongReviewBtn();
  updateHomeBestTags();
  updateStampProgressUI();
}

function updateStampProgressUI() {
  const p = state.stampProgress || { rhythm: 0, speed: 0, reverse: 0, missing: 0, order: 0, subtraction: 0 };

  // 1. 리듬 구구단 (목표 4세트 완주)
  const rhythmEl = document.getElementById('home-stamp-rhythm');
  if (rhythmEl) {
    const cur = p.rhythm || 0;
    rhythmEl.textContent = `💮 도장까지 ${cur}/4세트`;
    if (cur >= 3) rhythmEl.classList.add('almost');
    else rhythmEl.classList.remove('almost');
  }

  // 2. 마법의 0 뺄셈 특훈 (목표 3세트 완료)
  const subEl = document.getElementById('home-stamp-subtraction');
  if (subEl) {
    const cur = p.subtraction || 0;
    subEl.textContent = `💮 도장까지 ${cur}/3세트`;
    if (cur >= 2) subEl.classList.add('almost');
    else subEl.classList.remove('almost');
  }

  // 3. 하단 4개 항목 (목표 3세트 완료)
  const modes = ['speed', 'reverse', 'missing', 'order'];
  modes.forEach(m => {
    const el = document.getElementById(`home-stamp-${m}`);
    if (el) {
      const cur = p[m] || 0;
      el.textContent = `💮 도장 ${cur}/3세트`;
      if (cur >= 2) el.classList.add('almost');
      else el.classList.remove('almost');
    }
  });

  renderStampProgressDashboard();
}

function renderStampProgressDashboard() {
  const dash = document.getElementById('stamp-progress-dashboard');
  if (!dash) return;
  const p = state.stampProgress || { rhythm: 0, speed: 0, reverse: 0, missing: 0, order: 0, subtraction: 0 };

  const items = [
    { name: '🎶 리듬 외우기', cur: p.rhythm || 0, max: 4, unit: '세트' },
    { name: '🪄 0 뺄셈 특훈', cur: p.subtraction || 0, max: 3, unit: '세트' },
    { name: '⚡ 순간 반응', cur: p.speed || 0, max: 3, unit: '세트' },
    { name: '🔄 거꾸로 도전', cur: p.reverse || 0, max: 3, unit: '세트' },
    { name: '🕵️ 구구 탐정', cur: p.missing || 0, max: 3, unit: '세트' },
    { name: '🌱 순서대로', cur: p.order || 0, max: 3, unit: '세트' }
  ];

  dash.innerHTML = items.map(it => {
    const isFull = it.cur >= it.max;
    return `
      <div class="stamp-prog-item">
        <span class="stamp-prog-name">${it.name}</span>
        <span class="stamp-prog-val ${isFull ? 'done' : ''}">${it.cur} / ${it.max}${it.unit}</span>
      </div>
    `;
  }).join('');
}

function saveUserData() {
  localStorage.setItem('gugudan_total_stars', state.stars);
  localStorage.setItem('gugudan_stamps', JSON.stringify(state.stamps));
  localStorage.setItem('gugudan_stamp_progress', JSON.stringify(state.stampProgress));
  localStorage.setItem('gugudan_reward_coupon', state.rewardCoupon);
  localStorage.setItem('gugudan_wrong_problems', JSON.stringify(state.wrongProblems));
}

// --- 4-1. 시간 기록 및 Top 5 랭킹 시스템 ---
function getRecords(key) {
  if (!state.records[key]) state.records[key] = [];
  return state.records[key];
}

function saveRecord(key, timeSec) {
  if (!state.records[key]) state.records[key] = [];
  const list = state.records[key];
  
  const parsedTime = parseFloat(timeSec.toFixed(1));
  const prevBest = list.length > 0 ? list[0].time : Infinity;
  const isNewFirst = parsedTime < prevBest || list.length === 0;

  list.push({
    time: parsedTime,
    date: new Date().toLocaleDateString('ko-KR')
  });

  // 짧은 시간 순서대로(오름차순) 정렬: 1위가 가장 짧은 시간
  list.sort((a, b) => a.time - b.time);

  // 상위 5개만 유지
  state.records[key] = list.slice(0, 5);

  localStorage.setItem('gugudan_time_records', JSON.stringify(state.records));

  const rank = state.records[key].findIndex(r => r.time === parsedTime) + 1;
  const isTop5 = rank >= 1 && rank <= 5;

  return {
    isNewFirst,
    isTop5,
    rank,
    records: state.records[key],
    prevBest
  };
}

function getModeTitle(mode) {
  const map = {
    speed: '순간 반응 팡팡',
    reverse: '거꾸로 도전',
    missing: '구구단 탐정',
    order: '차근차근 순서대로',
    review: '오답 다시 풀기'
  };
  return map[mode] || mode;
}

function getDanLabel(danKey) {
  return danKey === 'all' ? '전체' : `${danKey}단`;
}

function updateHomeBestTags() {
  const modes = ['speed', 'reverse', 'missing', 'order'];
  modes.forEach(mode => {
    const el = document.getElementById(`home-best-${mode}`);
    if (el) {
      let best = Infinity;
      // 'all' 포함 모든 단수 중 최고 기록 검색
      const keys = [`quiz_${mode}_all`];
      for (let d = 2; d <= 9; d++) keys.push(`quiz_${mode}_${d}`);
      keys.forEach(k => {
        const recs = getRecords(k);
        if (recs.length > 0 && recs[0].time < best) best = recs[0].time;
      });

      if (best < Infinity) {
        el.textContent = `👑 1위: ${best}초`;
        el.classList.add('has-record');
      } else {
        el.textContent = `👑 1위: —`;
        el.classList.remove('has-record');
      }
    }
  });

  const rhythmEl = document.getElementById('home-best-rhythm');
  if (rhythmEl) {
    let best = Infinity;
    for (let d = 2; d <= 9; d++) {
      ['forward', 'reverse'].forEach(dir => {
        const recs = getRecords(`rhythm_${d}_${dir}`);
        if (recs.length > 0 && recs[0].time < best) best = recs[0].time;
      });
    }
    if (best < Infinity) {
      rhythmEl.textContent = `👑 1위: ${best}초`;
      rhythmEl.classList.add('has-record');
    } else {
      rhythmEl.textContent = `👑 1위: —`;
      rhythmEl.classList.remove('has-record');
    }
  }
}

function updateUserBadge() {
  let currentLevel = LEVELS[0];
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (state.stars >= LEVELS[i].stars) {
      currentLevel = LEVELS[i];
      break;
    }
  }

  const avatar = document.getElementById('user-avatar');
  const title = document.getElementById('user-title');
  const stars = document.getElementById('total-stars');
  if (avatar) avatar.textContent = currentLevel.avatar;
  if (title) title.textContent = currentLevel.title;
  if (stars) stars.textContent = state.stars;
}

function updateHeaderStampCount() {
  const countSpan = document.getElementById('header-stamp-count');
  if (countSpan) {
    const cur = state.stamps.length % 20;
    countSpan.textContent = `(${cur}/20)`;
  }
}

function updateWrongReviewBtn() {
  const wrap = document.getElementById('wrong-review-wrap') || document.getElementById('btn-wrong-review');
  const countSpan = document.getElementById('wrong-count');
  if (!wrap || !countSpan) return;

  if (state.wrongProblems && state.wrongProblems.length > 0) {
    wrap.style.display = 'flex';
    countSpan.textContent = state.wrongProblems.length;
  } else {
    wrap.style.display = 'none';
  }
}

function resetWrongProblems(event, skipConfirm = false) {
  if (event) event.stopPropagation();
  if (skipConfirm || confirm('틀린 문제 다시 풀기 목록을 모두 리셋할까요?')) {
    state.wrongProblems = [];
    localStorage.removeItem('gugudan_wrong_problems');
    updateWrongReviewBtn();
  }
}

// --- 5. 단 선택 칩 핸들러 ---
function setupDanChips() {
  const container = document.getElementById('dan-chips');
  if (!container) return;
  const chips = container.querySelectorAll('.dan-chip');

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      sounds.playBeep(480, 0.05);
      const danVal = chip.getAttribute('data-dan');

      if (danVal === 'all') {
        chips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        state.selectedDans = [2, 3, 4, 5, 6, 7, 8, 9];
      } else {
        const allChip = container.querySelector('[data-dan="all"]');
        if (allChip) allChip.classList.remove('active');

        chip.classList.toggle('active');

        const activeChips = Array.from(chips).filter(c => c.classList.contains('active') && c.getAttribute('data-dan') !== 'all');
        if (activeChips.length === 0) {
          if (allChip) allChip.classList.add('active');
          state.selectedDans = [2, 3, 4, 5, 6, 7, 8, 9];
        } else {
          state.selectedDans = activeChips.map(c => parseInt(c.getAttribute('data-dan'), 10));
        }
      }
    });
  });
}

// --- 6. 문제 생성 엔진 (모드별 완벽 분리 & 검증) ---
function generateQuestions(mode) {
  const questions = [];
  const dans = state.selectedDans.length > 0 ? state.selectedDans : [2, 3, 4, 5, 6, 7, 8, 9];

  if (mode === 'speed') {
    // 1. 순간 반응 팡팡: 선택된 단에서 랜덤 10문제 (정답: 곱셈 결과)
    for (let i = 0; i < 10; i++) {
      const num1 = dans[Math.floor(Math.random() * dans.length)];
      const num2 = Math.floor(Math.random() * 9) + 1;
      questions.push({
        num1,
        num2,
        expected: num1 * num2,
        blankType: 'ans'
      });
    }
  } else if (mode === 'reverse') {
    // 2. 거꾸로 도전: 9부터 1까지 거꾸로 내려가는 문제! (절대 셔플 금지!)
    // 선택된 단 중 1개 단을 선택하여 9➔1 순서로 9문제 출제
    const targetDan = dans[Math.floor(Math.random() * dans.length)];
    for (let num2 = 9; num2 >= 1; num2--) {
      questions.push({
        num1: targetDan,
        num2: num2,
        expected: targetDan * num2,
        blankType: 'ans'
      });
    }
  } else if (mode === 'missing') {
    // 3. 구구단 탐정 (빈칸 채우기): 7 × ? = 56 또는 ? × 8 = 56
    // 정답은 빈칸에 들어가는 한 자리 수(1~9)입니다!
    for (let i = 0; i < 10; i++) {
      const num1 = dans[Math.floor(Math.random() * dans.length)];
      const num2 = Math.floor(Math.random() * 9) + 1;
      const blankPosition = Math.random() > 0.5 ? 'num2' : 'num1';
      questions.push({
        num1,
        num2,
        expected: blankPosition === 'num2' ? num2 : num1,
        blankType: blankPosition
      });
    }
  } else if (mode === 'order') {
    // 4. 차근차근 순서대로: 1부터 9까지 순서대로 9문제!
    const targetDan = dans[Math.floor(Math.random() * dans.length)];
    for (let num2 = 1; num2 <= 9; num2++) {
      questions.push({
        num1: targetDan,
        num2: num2,
        expected: targetDan * num2,
        blankType: 'ans'
      });
    }
  } else if (mode === 'review') {
    // 5. 오답 다시 풀기
    const list = [...state.wrongProblems].sort(() => Math.random() - 0.5);
    const limit = Math.min(list.length, 10);
    for (let i = 0; i < limit; i++) {
      const item = list[i];
      questions.push({
        num1: item.num1,
        num2: item.num2,
        expected: item.num1 * item.num2,
        blankType: 'ans'
      });
    }
  }

  return questions;
}

// --- 7. 게임 시작 및 진행 ---
function startGame(mode) {
  if (mode === 'review' && state.wrongProblems.length === 0) {
    alert('오답 노트가 비어있어요! 참 잘했어요 👏');
    return;
  }

  sounds.playBeep(600, 0.08);

  const questions = generateQuestions(mode);
  if (!questions || questions.length === 0) return;

  state.currentGame = {
    mode,
    questions,
    currentIndex: 0,
    currentInput: '',
    correctCount: 0,
    combo: 0,
    maxCombo: 0,
    currentWrongInRound: [],
    timerInterval: null,
    timeLeftPercent: 100,
    questionStartTime: 0,
    isStarted: false // 시작 버튼 누르기 전까지 대기!
  };

  switchScreen('screen-game');
  updateIngameDanTabs();

  // 첫 번째 문제 화면을 또렷하게 렌더링해두고 (타이머는 아직 돌지 않음)
  loadQuestion(false);

  // 상단 스톱워치 초기화 및 현재 모드/단수 1위 기록 표시
  const stopwatchEl = document.getElementById('game-stopwatch');
  if (stopwatchEl) stopwatchEl.textContent = '⏱️ 0.0초';
  updateGameBestRecordTag();

  // 중앙에 또렷한 시작 버튼 표시 (흐림 블러 없음!)
  const overlay = document.getElementById('game-start-overlay');
  if (overlay) overlay.style.display = 'flex';
}

function startCurrentGamePlay() {
  const overlay = document.getElementById('game-start-overlay');
  if (overlay) overlay.style.display = 'none';

  sounds.playFanfare();
  state.currentGame.isStarted = true;
  state.currentGame.roundStartTime = Date.now();
  state.currentGame.questionStartTime = Date.now();

  if (state.currentGame.liveTimerInterval) clearInterval(state.currentGame.liveTimerInterval);
  state.currentGame.liveTimerInterval = setInterval(updateGameLiveTimer, 100);
  updateGameLiveTimer();

  startTimerGauge();
}

function updateGameLiveTimer() {
  const el = document.getElementById('game-stopwatch');
  if (!el || !state.currentGame || !state.currentGame.isStarted) return;
  const sec = ((Date.now() - state.currentGame.roundStartTime) / 1000).toFixed(1);
  el.textContent = `⏱️ ${sec}초`;
}

function updateGameBestRecordTag() {
  const g = state.currentGame;
  if (!g) return;
  const tag = document.getElementById('game-best-record-tag');
  if (!tag) return;
  const danKey = state.selectedDans.length === 1 ? state.selectedDans[0].toString() : 'all';
  const recs = getRecords(`quiz_${g.mode}_${danKey}`);
  if (recs.length > 0) {
    tag.textContent = `👑 1위: ${recs[0].time}초`;
  } else {
    tag.textContent = `👑 1위: 도전!`;
  }
}

// 퀴즈 화면 안에서 실시간으로 단을 변경하는 함수
function changeGameDan(dan) {
  sounds.playBeep(520, 0.05);

  if (dan === 'all') {
    state.selectedDans = [2, 3, 4, 5, 6, 7, 8, 9];
  } else {
    state.selectedDans = [parseInt(dan, 10)];
  }

  // 메인 화면 칩과 동기화
  const mainChips = document.querySelectorAll('#dan-chips .dan-chip');
  mainChips.forEach(chip => {
    const val = chip.getAttribute('data-dan');
    if (dan === 'all') {
      if (val === 'all') chip.classList.add('active');
      else chip.classList.remove('active');
    } else {
      if (val === dan.toString()) chip.classList.add('active');
      else chip.classList.remove('active');
    }
  });

  updateIngameDanTabs();
  updateGameBestRecordTag();

  // 기존 타이머 정지 후 대기 상태로 재시작!
  if (state.currentGame.timerInterval) clearInterval(state.currentGame.timerInterval);
  if (state.currentGame.liveTimerInterval) clearInterval(state.currentGame.liveTimerInterval);
  startGame(state.currentGame.mode);
}

function updateIngameDanTabs() {
  const tabs = document.querySelectorAll('.ingame-dan-btn');
  const isAll = state.selectedDans.length >= 8;
  const singleDan = state.selectedDans.length === 1 ? state.selectedDans[0] : null;

  tabs.forEach(btn => {
    const dataDan = btn.getAttribute('data-dan');
    if (dataDan === 'all') {
      if (isAll) btn.classList.add('active');
      else btn.classList.remove('active');
    } else {
      const danNum = parseInt(dataDan, 10);
      if (!isAll && singleDan === danNum) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    }
  });
}

function loadQuestion(startTimer = true) {
  const g = state.currentGame;
  if (g.currentIndex >= g.questions.length) {
    finishGame();
    return;
  }

  g.currentInput = '';
  const feedbackMsg = document.getElementById('feedback-msg');
  if (feedbackMsg) {
    feedbackMsg.textContent = '';
    feedbackMsg.className = 'feedback-msg';
  }

  const hintCard = document.getElementById('hint-smart-card');
  if (hintCard) hintCard.style.display = 'none';

  const q = g.questions[g.currentIndex];

  // 진행률 표시
  const progressPercent = (g.currentIndex / g.questions.length) * 100;
  const pBar = document.getElementById('game-progress-bar');
  if (pBar) pBar.style.width = `${progressPercent}%`;

  const qCounter = document.getElementById('question-counter');
  if (qCounter) qCounter.textContent = `${g.currentIndex + 1} / ${g.questions.length}`;

  // 모드별 명확한 제목 라벨
  const modeLabels = {
    speed: '⚡ 순간 반응 팡팡 (랜덤 10문제)',
    reverse: `🔄 거꾸로 도전 (${q.num1}단: 9 ➔ 1)`,
    missing: '🕵️ 구구단 탐정 (빈칸 ❓을 찾아라!)',
    order: `🌱 차근차근 순서대로 (${q.num1}단: 1 ➔ 9)`,
    review: '🩹 오답 다시 풀기'
  };
  const modeInd = document.getElementById('game-mode-indicator');
  if (modeInd) modeInd.textContent = modeLabels[g.mode] || '구구단 퀴즈';

  // 수식 렌더링
  renderExpression(q);

  // 똑똑한 힌트 세팅
  setupSmartHints(q);

  if (startTimer && g.isStarted) {
    g.questionStartTime = Date.now();
    startTimerGauge();
  }
}

function renderExpression(q) {
  const box = document.getElementById('expression-box');
  if (!box) return;
  const product = q.num1 * q.num2;

  if (q.blankType === 'ans') {
    // 7 × 8 = [ ? ]
    box.innerHTML = `
      <span class="num-a">${q.num1}</span>
      <span class="op">×</span>
      <span class="num-b">${q.num2}</span>
      <span class="eq">=</span>
      <span class="answer-slot" id="disp-answer">?</span>
    `;
  } else if (q.blankType === 'num2') {
    // 7 × [ ? ] = 56
    box.innerHTML = `
      <span class="num-a">${q.num1}</span>
      <span class="op">×</span>
      <span class="answer-slot missing-slot" id="disp-answer">?</span>
      <span class="eq">=</span>
      <span class="num-b">${product}</span>
    `;
  } else if (q.blankType === 'num1') {
    // [ ? ] × 8 = 56
    box.innerHTML = `
      <span class="answer-slot missing-slot" id="disp-answer">?</span>
      <span class="op">×</span>
      <span class="num-b">${q.num2}</span>
      <span class="eq">=</span>
      <span class="num-b">${product}</span>
    `;
  }
}

function setupSmartHints(q) {
  const reverseText = document.getElementById('hint-reverse-text');
  if (reverseText) {
    reverseText.innerHTML = `앞뒤를 바꿔도 같아요! <strong>${q.num2} × ${q.num1} = ${q.num1 * q.num2}</strong>`;
  }

  const bridgeText = document.getElementById('hint-bridge-text');
  if (bridgeText) {
    if (q.num2 > 1) {
      const prevN2 = q.num2 - 1;
      const prevProd = q.num1 * prevN2;
      bridgeText.innerHTML = `${q.num1} × ${prevN2} = ${prevProd}에 <strong>${q.num1}을 한 번 더하면</strong> ${q.num1 * q.num2}!`;
    } else {
      bridgeText.innerHTML = `${q.num1}이 딱 1번 있으니까 바로 <strong>${q.num1}</strong>!`;
    }
  }

  const visual = document.getElementById('hint-visual');
  if (visual) {
    let html = `<div style="font-size:12px; font-weight:bold; color:#5E35B1; margin-bottom:4px;">
      ${q.num1}개씩 ${q.num2}줄 = 총 ${q.num1 * q.num2}개
    </div>`;

    for (let r = 0; r < q.num2; r++) {
      html += `<div class="hint-group-row">`;
      html += `<span class="hint-group-label">${r + 1}줄</span>`;
      for (let c = 0; c < q.num1; c++) {
        html += `<span class="hint-dot"></span>`;
      }
      html += `</div>`;
    }
    visual.innerHTML = html;
  }
}

function toggleHint() {
  const card = document.getElementById('hint-smart-card');
  if (!card) return;
  const isHidden = card.style.display === 'none';
  card.style.display = isHidden ? 'flex' : 'none';
  if (isHidden) sounds.playBeep(650, 0.05);
}

function startTimerGauge() {
  const gauge = document.getElementById('timer-gauge');
  if (!gauge) return;
  if (state.currentGame.timerInterval) {
    clearInterval(state.currentGame.timerInterval);
  }

  let timeLeft = 100;
  state.currentGame.timeLeftPercent = 100;
  gauge.style.width = '100%';
  gauge.style.backgroundColor = '#4CAF50';

  state.currentGame.timerInterval = setInterval(() => {
    timeLeft -= 1.15;
    if (timeLeft <= 0) {
      timeLeft = 0;
      clearInterval(state.currentGame.timerInterval);
      const feedback = document.getElementById('feedback-msg');
      if (feedback && feedback.textContent === '') {
        feedback.textContent = '천천히 생각해보세요 💭 답을 찾을 수 있어요!';
        feedback.className = 'feedback-msg';
      }
    }
    state.currentGame.timeLeftPercent = timeLeft;
    gauge.style.width = `${timeLeft}%`;
    if (timeLeft < 30) {
      gauge.style.backgroundColor = '#FF5252';
    } else if (timeLeft < 60) {
      gauge.style.backgroundColor = '#FFA726';
    }
  }, 100);
}

// --- 8. 키 입력 및 스마트 자동 제출 ---
function pressKey(key) {
  if (!state.currentGame.isStarted) return; // 시작 버튼 누르기 전에는 입력 방지!

  sounds.playBeep(580, 0.04);
  const g = state.currentGame;
  const disp = document.getElementById('disp-answer');
  if (!disp) return;

  if (key === 'clear') {
    g.currentInput = '';
    disp.textContent = '?';
    disp.classList.remove('filled');
    return;
  }

  if (g.currentInput.length >= 2) return;

  g.currentInput += key.toString();
  disp.textContent = g.currentInput;
  disp.classList.add('filled');

  const q = g.questions[g.currentIndex];
  // expected의 실제 자릿수 계산 (1자리인지 2자리인지)
  const targetLength = q.expected < 10 ? 1 : 2;

  // 자릿수가 다 채워지면 120ms 후 자동 제출!
  if (g.currentInput.length >= targetLength) {
    setTimeout(() => {
      if (g.currentInput.length >= targetLength) {
        submitAnswer();
      }
    }, 120);
  }
}

function submitAnswer() {
  const g = state.currentGame;
  if (!g.currentInput) return;

  if (g.timerInterval) clearInterval(g.timerInterval);

  const userAnswer = parseInt(g.currentInput, 10);
  const q = g.questions[g.currentIndex];
  const isCorrect = userAnswer === q.expected;

  const card = document.getElementById('quiz-card');
  const feedback = document.getElementById('feedback-msg');
  const elapsedSec = (Date.now() - g.questionStartTime) / 1000;

  if (isCorrect) {
    sounds.playCorrect();
    g.correctCount++;
    g.combo++;
    if (g.combo > g.maxCombo) g.maxCombo = g.combo;

    state.stars += (g.combo >= 3 ? 2 : 1);
    saveUserData();
    updateUserBadge();

    showComboBanner(g.combo);

    if (feedback) {
      if (elapsedSec <= 3.5) {
        feedback.textContent = `⚡ 번개 스피드! (${elapsedSec.toFixed(1)}초) 대단해요!`;
      } else {
        feedback.textContent = getEncouragementText(g.combo);
      }
      feedback.className = 'feedback-msg correct';
    }

    confetti.burst(window.innerWidth / 2, window.innerHeight * 0.4, 20);

    removeProblemFromWrongList(q.num1, q.num2);

    setTimeout(() => {
      g.currentIndex++;
      loadQuestion();
    }, 650);

  } else {
    sounds.playWrong();
    g.combo = 0;
    hideComboBanner();

    if (card) {
      card.classList.add('shake');
      setTimeout(() => card.classList.remove('shake'), 400);
    }

    if (feedback) {
      if (q.blankType === 'ans') {
        feedback.textContent = `아쉬워요! 정답은 [ ${q.expected} ] 이에요 💡`;
      } else if (q.blankType === 'num2') {
        feedback.textContent = `아쉬워요! 빈칸은 [ ${q.num2} ] 이에요 (${q.num1} × ${q.num2} = ${q.num1 * q.num2}) 💡`;
      } else {
        feedback.textContent = `아쉬워요! 빈칸은 [ ${q.num1} ] 이에요 (${q.num1} × ${q.num2} = ${q.num1 * q.num2}) 💡`;
      }
      feedback.className = 'feedback-msg wrong';
    }

    addProblemToWrongList(q.num1, q.num2);
    g.currentWrongInRound.push({ num1: q.num1, num2: q.num2, expected: q.expected });

    setTimeout(() => {
      g.currentIndex++;
      loadQuestion();
    }, 1600);
  }
}

function showComboBanner(combo) {
  const banner = document.getElementById('combo-banner');
  if (!banner) return;
  if (combo >= 2) {
    banner.innerHTML = `연속 정답! 🔥 x<span>${combo}</span>`;
    banner.classList.add('show');
  }
}

function hideComboBanner() {
  const banner = document.getElementById('combo-banner');
  if (banner) banner.classList.remove('show');
}

function getEncouragementText(combo) {
  const phrases = [
    '정답이에요! 참 잘했어요 👏',
    '와! 정말 멋져요! 🌟',
    '구구단 박사님 실력인데요?! 🚀',
    '완벽해요! 멋져요! 💖'
  ];
  if (combo >= 5) return '🔥 불꽃 콤보! 머릿속에서 답이 바로 튀어나와요!';
  if (combo >= 3) return '🌟 3연속 정답! 감을 제대로 잡았어요!';
  return phrases[Math.floor(Math.random() * phrases.length)];
}

function addProblemToWrongList(num1, num2) {
  const exists = state.wrongProblems.some(p => p.num1 === num1 && p.num2 === num2);
  if (!exists) {
    state.wrongProblems.push({ num1, num2 });
    saveUserData();
    updateWrongReviewBtn();
  }
}

function removeProblemFromWrongList(num1, num2) {
  state.wrongProblems = state.wrongProblems.filter(p => !(p.num1 === num1 && p.num2 === num2));
  saveUserData();
  updateWrongReviewBtn();
}

// --- 9. PC 키보드 지원 ---
function setupKeyboardListener() {
  window.addEventListener('keydown', (e) => {
    const activeScreen = document.querySelector('.screen.active');
    if (!activeScreen) return;

    if (activeScreen.id === 'screen-game') {
      if (e.key >= '0' && e.key <= '9') {
        pressKey(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        pressKey('clear');
      } else if (e.key === 'Enter' || e.key === ' ') {
        submitAnswer();
      }
    } else if (activeScreen.id === 'screen-subtraction') {
      if (e.key >= '0' && e.key <= '9') {
        pressSubKey(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        pressSubKey('clear');
      } else if (e.key === 'Enter' || e.key === ' ') {
        submitSubAnswer();
      }
    }
  });
}

// --- 10. 결과 화면 & 스탬프 쾅! 애니메이션 ---
function finishGame() {
  const g = state.currentGame;
  if (g.timerInterval) clearInterval(g.timerInterval);
  if (g.liveTimerInterval) clearInterval(g.liveTimerInterval);

  const elapsedSec = (Date.now() - (g.roundStartTime || Date.now())) / 1000;
  const danKey = state.selectedDans.length === 1 ? state.selectedDans[0].toString() : 'all';
  const recordKey = `quiz_${g.mode}_${danKey}`;
  const recResult = saveRecord(recordKey, elapsedSec);
  updateHomeBestTags();
  state.lastCompletedMode = g.mode;

  const rankCard = document.getElementById('result-top5-card');
  if (rankCard) rankCard.style.display = 'block';

  switchScreen('screen-result');

  document.getElementById('res-correct').textContent = g.correctCount;
  document.getElementById('res-total').textContent = g.questions.length;
  document.getElementById('res-stars').textContent = g.correctCount + (g.maxCombo >= 3 ? 2 : 0);
  document.getElementById('res-max-combo').textContent = g.maxCombo;

  const timeEl = document.getElementById('res-elapsed-time');
  if (timeEl) timeEl.textContent = `${elapsedSec.toFixed(1)}초`;

  const titleEl = document.getElementById('result-title');
  const subEl = document.getElementById('result-subtitle');
  const avatarEl = document.getElementById('result-avatar');

  const accuracy = g.correctCount / g.questions.length;
  let stampType = 'normal';
  let stampTitle = '참 잘했어요';
  let stampSub = `${g.correctCount}/${g.questions.length}`;

  if (accuracy === 1) {
    if (avatarEl) avatarEl.textContent = '👑';
    if (titleEl) titleEl.textContent = '100점 만점! 완벽해요!';
    if (subEl) subEl.textContent = '거침없이 팡팡 맞혔어요! 구구단 마스터!';
    stampType = 'gold';
    stampTitle = '참 잘했어요';
    stampSub = '100점 만점 💮';
  } else if (accuracy >= 0.7) {
    if (avatarEl) avatarEl.textContent = '🎉';
    if (titleEl) titleEl.textContent = '정말 잘했어요!';
    if (subEl) subEl.textContent = '실력이 쑥쑥 늘고 있어요! 조금만 더 하면 만점!';
    stampType = 'normal';
    stampTitle = '아주 훌륭해요';
    stampSub = '우수 훈련 👍';
  } else {
    if (avatarEl) avatarEl.textContent = '🌱';
    if (titleEl) titleEl.textContent = '좋은 도전이었어요!';
    if (subEl) subEl.textContent = '꾸준히 하면 머릿속에서 답이 바로 튀어나올 거예요!';
    stampType = 'normal';
    stampTitle = '멋진 도전';
    stampSub = '열정 칭찬 💪';
  }

  // [사용자 요청 반영] 하단 4개 항목: 3세트 완료 시 도장 1개 지급
  const isTargetMode = ['speed', 'reverse', 'missing', 'order'].includes(g.mode);
  let isEarnedBoardStamp = false;
  let bannerProgressMsg = '';

  if (isTargetMode) {
    state.stampProgress[g.mode] = (state.stampProgress[g.mode] || 0) + 1;
    const count = state.stampProgress[g.mode];
    if (count >= 3) {
      isEarnedBoardStamp = true;
      state.stampProgress[g.mode] = 0;
      bannerProgressMsg = `🎉 <strong>3세트 완주 대성공!</strong> 도장판에 도장이 쾅 찍혔어요! 💮 (3/3 완료)`;
    } else {
      bannerProgressMsg = `💮 도장판 도장까지: <strong>${count} / 3세트 완료</strong> (앞으로 ${3 - count}세트 더 풀면 도장 쾅!)`;
    }
  } else {
    isEarnedBoardStamp = true;
    bannerProgressMsg = `🎉 훈련 완료! 도장판에 도장이 쾅 찍혔어요! 💮`;
  }

  const progBanner = document.getElementById('res-stamp-progress-banner');
  if (progBanner) {
    progBanner.innerHTML = bannerProgressMsg;
    if (isEarnedBoardStamp) progBanner.classList.add('earned');
    else progBanner.classList.remove('earned');
  }

  const stampSubText = isEarnedBoardStamp ? '3세트 완주 💮' : `${state.stampProgress[g.mode] || 1}/3세트 달성`;
  applyStampToResult(stampType, stampTitle, stampSubText, isEarnedBoardStamp);

  // 1위 최고 신기록 갱신 시: 특대형 폭죽 + 보너스 도장 +1개 쾅!
  const alertEl = document.getElementById('res-record-alert');
  if (recResult.isNewFirst && g.correctCount > 0) {
    if (alertEl) {
      alertEl.style.display = 'block';
      alertEl.innerHTML = `👑 <strong>최고 신기록 달성 (${elapsedSec.toFixed(1)}초)!</strong> 1위 갱신으로 <strong>보너스 도장 +1개</strong> 쾅! 💮`;
    }
    state.stamps.push({
      type: 'gold',
      title: `👑 ${getModeTitle(g.mode)} 1위`,
      date: `${elapsedSec.toFixed(1)}초 (${getDanLabel(danKey)})`
    });
    saveUserData();
    updateHeaderStampCount();
    updateStampProgressUI();
    confetti.megaBurst();
  } else {
    if (alertEl) alertEl.style.display = 'none';
  }

  // 퀴즈 결과 화면 Top 5 랭킹 보드 표시
  renderResultTop5(recordKey, elapsedSec, recResult.isNewFirst);

  const wrongWrap = document.getElementById('result-wrong-list');
  const chipsContainer = document.getElementById('wrong-chips-container');
  if (wrongWrap && chipsContainer) {
    if (g.currentWrongInRound.length > 0) {
      wrongWrap.style.display = 'block';
      chipsContainer.innerHTML = g.currentWrongInRound.map(w =>
        `<span class="wrong-chip">${w.num1} × ${w.num2} = ${w.expected}</span>`
      ).join('');
    } else {
      wrongWrap.style.display = 'none';
    }
  }
}

function applyStampToResult(stampType, stampTitle, stampSub, isEarnedBoardStamp) {
  const stampEl = document.getElementById('result-stamp');
  const stampMain = document.getElementById('stamp-main-text');
  const stampDate = document.getElementById('stamp-date-text');

  if (stampEl) stampEl.className = 'stamp-seal' + (stampType === 'gold' ? ' gold' : '');
  if (stampMain) stampMain.textContent = stampTitle;
  if (stampDate) stampDate.textContent = stampSub;

  if (isEarnedBoardStamp) {
    setTimeout(() => {
      if (stampEl) {
        stampEl.classList.remove('preview-mode');
        stampEl.classList.add('stamped');
      }
      sounds.playStamp();
      sounds.playFanfare();
      confetti.burst(window.innerWidth / 2, window.innerHeight * 0.4, 65);
    }, 300);

    state.stamps.push({
      type: stampType,
      title: stampTitle,
      date: new Date().toLocaleDateString('ko-KR')
    });
    saveUserData();
    updateHeaderStampCount();
    updateStampProgressUI();
  } else {
    if (stampEl) {
      stampEl.classList.remove('stamped');
      stampEl.classList.add('preview-mode');
    }
    sounds.playFanfare();
    saveUserData();
    updateStampProgressUI();
  }
}

// --- 11. 칭찬 스탬프판 모달 시스템 ---
function openStampModal() {
  sounds.playBeep(620, 0.05);
  renderStampBoard();
  renderStampProgressDashboard();
  const modal = document.getElementById('stamp-modal');
  if (modal) modal.classList.add('open');
}

function closeStampModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('modal-close-btn')) return;
  sounds.playBeep(450, 0.05);
  const modal = document.getElementById('stamp-modal');
  if (modal) modal.classList.remove('open');
}

function renderStampBoard() {
  const grid = document.getElementById('stamp-board-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const totalSlots = 20;
  const currentStamps = state.stamps;
  const filledInCurrentPage = currentStamps.length % totalSlots;
  const isPageFull = (currentStamps.length > 0 && filledInCurrentPage === 0);
  const activeCount = isPageFull ? totalSlots : filledInCurrentPage;

  for (let i = 1; i <= totalSlots; i++) {
    const isStamped = i <= activeCount;
    const isMilestone = (i === 10 || i === 20);

    const slot = document.createElement('div');
    let classNames = 'stamp-slot';
    if (isMilestone) classNames += ' milestone';
    if (isStamped) classNames += ' stamped';

    let mark = `<span class="stamp-slot-num">${i}</span>`;
    if (isStamped) {
      mark += `<span class="stamp-slot-mark">${i === 20 ? '🎁' : (i === 10 ? '👑' : '💮')}</span>`;
    } else if (isMilestone) {
      mark += `<span style="font-size:16px;">${i === 20 ? '🎁' : '⭐'}</span>`;
    }

    slot.className = classNames;
    slot.innerHTML = mark;
    grid.appendChild(slot);
  }

  const claimBtn = document.getElementById('btn-claim-reward');
  const rewardMsg = document.getElementById('stamp-reward-msg');

  if (activeCount === 20) {
    if (claimBtn) claimBtn.style.display = 'block';
    if (rewardMsg) rewardMsg.textContent = '🎉 와아! 도장 20개를 모두 채웠어요! 부모님 선물을 열어보세요!';
  } else {
    if (claimBtn) claimBtn.style.display = 'none';
    if (rewardMsg) rewardMsg.textContent = `⭐ 도장 20개를 모으면 부모님 쿠폰이 열려요! (현재 ${activeCount} / 20)`;
  }
}

// --- 12. 부모님 보상 쿠폰함 모달 & 티켓 개봉 ---
function openCouponModal() {
  sounds.playBeep(620, 0.05);
  const modal = document.getElementById('coupon-modal');
  if (modal) modal.classList.add('open');
}

function closeCouponModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('modal-close-btn')) return;
  sounds.playBeep(450, 0.05);
  const modal = document.getElementById('coupon-modal');
  if (modal) modal.classList.remove('open');
}

function saveCouponSetting() {
  const checked = document.querySelector('input[name="coupon-choice"]:checked');
  if (!checked) return;

  if (checked.value === 'custom') {
    const customText = document.getElementById('coupon-custom-text').value.trim();
    if (!customText) {
      alert('직접 줄 선물의 내용을 적어주세요! (예: 동물원 가기)');
      return;
    }
    state.rewardCoupon = `🎁 ${customText}`;
  } else {
    state.rewardCoupon = checked.value;
  }

  saveUserData();
  sounds.playCorrect();
  alert(`보상 쿠폰이 [ ${state.rewardCoupon} ] (으)로 저장되었습니다!`);
  const modal = document.getElementById('coupon-modal');
  if (modal) modal.classList.remove('open');
}

function claimRewardCoupon() {
  closeStampModal();
  sounds.playFanfare();
  confetti.burst(window.innerWidth / 2, window.innerHeight * 0.4, 80);

  const ticketContent = document.getElementById('ticket-content-text');
  if (ticketContent) ticketContent.textContent = state.rewardCoupon;

  const rewardModal = document.getElementById('reward-open-modal');
  if (rewardModal) rewardModal.classList.add('open');
}

function closeRewardModal(e) {
  if (e && e.target !== e.currentTarget && !e.target.classList.contains('action-btn')) return;
  const rewardModal = document.getElementById('reward-open-modal');
  if (rewardModal) rewardModal.classList.remove('open');
}

function restartCurrentGame() {
  if (state.lastCompletedMode === 'subtraction') {
    startSubtractionGame(subState.level);
  } else {
    startGame(state.currentGame.mode);
  }
}

function goHome() {
  sounds.playBeep(480, 0.05);
  stopRhythmTimer();
  if (state.rhythmTrainer.liveTimerInterval) {
    clearInterval(state.rhythmTrainer.liveTimerInterval);
  }
  if (state.currentGame && state.currentGame.liveTimerInterval) {
    clearInterval(state.currentGame.liveTimerInterval);
  }
  switchScreen('screen-home');
  updateUserBadge();
  updateHeaderStampCount();
  updateWrongReviewBtn();
  updateHomeBestTags();
  updateStampProgressUI();
}

function confirmExitGame() {
  if (confirm('게임을 그만두고 처음 화면으로 돌아갈까요?')) {
    if (state.currentGame.timerInterval) clearInterval(state.currentGame.timerInterval);
    goHome();
  }
}

function switchScreen(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(screenId);
  if (target) target.classList.add('active');
}

// ========================================================
// --- 13. 구구단 외우기 (리듬 훈련 룸) ---
// ========================================================

function openRhythmScreen(dan = 2) {
  sounds.playBeep(650, 0.08);
  state.rhythmTrainer.dan = dan;
  state.rhythmTrainer.currentIndex = 0;
  state.rhythmTrainer.isPlaying = false;

  switchScreen('screen-rhythm');
  updateRhythmDanTabs();
  updateRhythmDirectionButtons();
  setupRhythmOrderList();
  renderRhythmBoard();

  showRhythmReadyState();
}

function showRhythmReadyState() {
  stopRhythmTimer();
  state.rhythmTrainer.isPlaying = false;
  state.rhythmTrainer.currentIndex = 0;
  state.rhythmTrainer.isRevealed = false;

  const timerBadge = document.getElementById('rhythm-live-timer');
  if (timerBadge) timerBadge.textContent = '⏱️ 0.0초';
  if (state.rhythmTrainer.liveTimerInterval) {
    clearInterval(state.rhythmTrainer.liveTimerInterval);
  }
  updateRhythmRankPanel();

  const playBtn = document.getElementById('btn-rhythm-play');
  if (playBtn) {
    playBtn.textContent = '▶ 시작하기';
    playBtn.className = 'ctrl-btn btn-play-pause btn-rhythm-main-act';
    playBtn.onclick = handleRhythmStartOrToggle;
  }

  const banner = document.getElementById('rhythm-status-msg');
  if (banner) {
    banner.innerHTML = `준비가 되면 <strong>[ ▶ 구구단 시작하기! ]</strong> 버튼을 눌러주세요!`;
  }

  const counter = document.getElementById('rhythm-step-counter');
  if (counter) counter.textContent = '0 / 9';

  const overlay = document.getElementById('rhythm-start-overlay');
  if (overlay) overlay.style.display = 'flex';
}

function handleRhythmStartOrToggle() {
  const rt = state.rhythmTrainer;
  const overlay = document.getElementById('rhythm-start-overlay');

  if (!rt.isPlaying && rt.currentIndex === 0) {
    if (overlay) overlay.style.display = 'none';
    rt.isPlaying = true;
    rt.startTime = Date.now();

    if (rt.liveTimerInterval) clearInterval(rt.liveTimerInterval);
    rt.liveTimerInterval = setInterval(updateRhythmLiveTimer, 100);
    updateRhythmLiveTimer();

    sounds.playFanfare();

    const playBtn = document.getElementById('btn-rhythm-play');
    if (playBtn) {
      playBtn.textContent = '⏸ 일시정지';
      playBtn.className = 'ctrl-btn btn-play-pause';
    }

    const banner = document.getElementById('rhythm-status-msg');
    if (banner) {
      banner.innerHTML = `🗣️ 소리내어 답을 먼저 외친 후, <strong>화면 아무 곳이나 터치</strong>하면 정답이 나타나요! ✨`;
    }

    startRhythmStep();
  } else {
    toggleRhythmPlay();
  }
}

function exitRhythmToHome() {
  stopRhythmTimer();
  if (state.rhythmTrainer.liveTimerInterval) {
    clearInterval(state.rhythmTrainer.liveTimerInterval);
  }
  goHome();
}

function selectRhythmDan(dan) {
  sounds.playBeep(520, 0.04);
  state.rhythmTrainer.dan = dan;
  updateRhythmDanTabs();
  setupRhythmOrderList();
  renderRhythmBoard();
  showRhythmReadyState();
  updateRhythmRankPanel();
}

function setRhythmDirection(dir) {
  sounds.playBeep(520, 0.04);
  state.rhythmTrainer.direction = dir;
  updateRhythmDirectionButtons();
  setupRhythmOrderList();
  renderRhythmBoard();
  showRhythmReadyState();
  updateRhythmRankPanel();
}

function updateRhythmDanTabs() {
  const tabs = document.querySelectorAll('.r-dan-btn');
  tabs.forEach((btn, idx) => {
    const danVal = idx + 2;
    if (danVal === state.rhythmTrainer.dan) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

function updateRhythmDirectionButtons() {
  const btnFwd = document.getElementById('btn-dir-forward');
  const btnRev = document.getElementById('btn-dir-reverse');
  if (btnFwd && btnRev) {
    if (state.rhythmTrainer.direction === 'forward') {
      btnFwd.classList.add('active');
      btnRev.classList.remove('active');
    } else {
      btnFwd.classList.remove('active');
      btnRev.classList.add('active');
    }
  }
}

function setupRhythmOrderList() {
  if (state.rhythmTrainer.direction === 'forward') {
    state.rhythmTrainer.orderList = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  } else {
    state.rhythmTrainer.orderList = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  }
}

function setupRhythmScreenListener() {
  const rhythmScreen = document.getElementById('screen-rhythm');
  if (!rhythmScreen) return;

  // 태블릿/모바일/PC 어디서든 화면 전체 터치 인식
  rhythmScreen.addEventListener('click', (e) => {
    // 상단 바의 버튼들(홈, 단 선택, 방향, 일시정지) 및 시작 오버레이, 랭킹 패널 클릭은 제외
    if (e.target.closest('.rhythm-top-bar') || e.target.closest('.rhythm-start-overlay') || e.target.closest('.rhythm-rank-panel')) {
      return;
    }
    handleRhythmInteraction();
  });
}

function renderRhythmBoard() {
  const board = document.getElementById('rhythm-board');
  if (!board) return;
  board.innerHTML = '';

  const rt = state.rhythmTrainer;
  const dan = rt.dan;

  rt.orderList.forEach((num2, index) => {
    const row = document.createElement('div');
    row.className = 'rhythm-row';
    row.id = `r-row-${index}`;

    row.innerHTML = `
      <div class="rhythm-row-expr">
        <span>${dan}</span>
        <span class="op">×</span>
        <span>${num2}</span>
        <span>=</span>
      </div>
      <div class="rhythm-row-ans" id="r-ans-${index}">?</div>
    `;

    board.appendChild(row);
  });
}

function updateRhythmStepCounter() {
  const counter = document.getElementById('rhythm-step-counter');
  if (counter) {
    const cur = Math.min(state.rhythmTrainer.currentIndex + 1, 9);
    counter.textContent = `${cur} / 9`;
  }
}

function startRhythmStep() {
  const rt = state.rhythmTrainer;
  if (!rt.isPlaying) return;

  if (rt.currentIndex >= rt.orderList.length) {
    finishRhythmDan();
    return;
  }

  stopRhythmTimer();
  rt.isRevealed = false;

  updateRhythmStepCounter();

  const idx = rt.currentIndex;
  const num2 = rt.orderList[idx];
  const dan = rt.dan;

  const currentRow = document.getElementById(`r-row-${idx}`);
  if (currentRow) {
    currentRow.classList.remove('done', 'revealed');
    currentRow.classList.add('active');
    const ansSlot = document.getElementById(`r-ans-${idx}`);
    if (ansSlot) {
      ansSlot.innerHTML = `<span class="thinking-dots">?</span>`;
    }
  }

  sounds.playTone(480, 0.06, 'triangle', 0.08);

  // 4초 자동 공개 타이머는 제거하고, 아이가 손으로 터치할 때까지 대기
}

function handleRhythmInteraction() {
  const rt = state.rhythmTrainer;
  if (!rt.isPlaying) return;
  if (rt.currentIndex >= rt.orderList.length) return;

  const idx = rt.currentIndex;
  const num2 = rt.orderList[idx];
  const dan = rt.dan;
  const expected = dan * num2;
  const currentRow = document.getElementById(`r-row-${idx}`);
  const ansSlot = document.getElementById(`r-ans-${idx}`);

  if (!rt.isRevealed) {
    // [1번째 터치] 손으로 터치하면 정답이 짠! 나타남 & 딩동 소리
    rt.isRevealed = true;
    stopRhythmTimer();

    if (currentRow) {
      currentRow.classList.add('revealed');
    }
    if (ansSlot) {
      ansSlot.innerHTML = `<span class="answer-pop">${expected}</span>`;
    }
    sounds.playCorrect();

    // 0.8초 후 자동으로 다음 문제로 이동 (아이들이 눈으로 정답을 확인할 여유)
    // 쉬운 문제라 빨리 넘기고 싶으면 이 0.8초 사이에 한 번 더 터치하면 즉시 넘어감!
    rt.stepTimer = setTimeout(() => {
      advanceRhythmToNext();
    }, 800);
  } else {
    // [2번째 터치] 이미 정답이 공개된 상태에서 빠른 터치: 대기시간 없이 즉시 다음 문제로!
    advanceRhythmToNext();
  }
}

function advanceRhythmToNext() {
  const rt = state.rhythmTrainer;
  stopRhythmTimer();

  const idx = rt.currentIndex;
  const currentRow = document.getElementById(`r-row-${idx}`);
  if (currentRow) {
    currentRow.classList.remove('active');
    currentRow.classList.add('done');
  }

  rt.currentIndex++;
  if (rt.currentIndex >= rt.orderList.length) {
    finishRhythmDan();
  } else {
    startRhythmStep();
  }
}

function stopRhythmTimer() {
  const rt = state.rhythmTrainer;
  if (rt.stepTimer) {
    clearTimeout(rt.stepTimer);
    rt.stepTimer = null;
  }
  if (rt.revealTimer) {
    clearTimeout(rt.revealTimer);
    rt.revealTimer = null;
  }
}

function toggleRhythmPlay() {
  const rt = state.rhythmTrainer;
  const btn = document.getElementById('btn-rhythm-play');

  if (rt.isPlaying) {
    rt.isPlaying = false;
    stopRhythmTimer();
    if (rt.liveTimerInterval) clearInterval(rt.liveTimerInterval);
    rt.pausedAt = Date.now();

    if (btn) {
      btn.textContent = '▶ 계속하기';
      btn.className = 'ctrl-btn btn-play-pause btn-rhythm-main-act';
    }
    const banner = document.getElementById('rhythm-status-msg');
    if (banner) {
      banner.innerHTML = `⏸ 일시정지 상태입니다. <strong>[ ▶ 계속하기 ]</strong>를 누르면 이어집니다.`;
    }
  } else {
    rt.isPlaying = true;
    if (rt.pausedAt) {
      rt.startTime += (Date.now() - rt.pausedAt);
      rt.pausedAt = null;
    }
    if (rt.liveTimerInterval) clearInterval(rt.liveTimerInterval);
    rt.liveTimerInterval = setInterval(updateRhythmLiveTimer, 100);

    if (btn) {
      btn.textContent = '⏸ 일시정지';
      btn.className = 'ctrl-btn btn-play-pause';
    }
    const banner = document.getElementById('rhythm-status-msg');
    if (banner) {
      banner.innerHTML = `🗣️ 소리내어 답을 먼저 외친 후, <strong>화면 아무 곳이나 터치</strong>하면 정답이 나타나요! ✨`;
    }
    if (rt.isRevealed) {
      advanceRhythmToNext();
    }
  }
}

function restartRhythm() {
  stopRhythmTimer();
  state.rhythmTrainer.currentIndex = 0;
  state.rhythmTrainer.isRevealed = false;
  if (state.rhythmTrainer.liveTimerInterval) {
    clearInterval(state.rhythmTrainer.liveTimerInterval);
  }
  setupRhythmOrderList();
  renderRhythmBoard();
  showRhythmReadyState();
}

function updateRhythmLiveTimer() {
  const el = document.getElementById('rhythm-live-timer');
  if (!el || !state.rhythmTrainer.isPlaying) return;
  const sec = ((Date.now() - state.rhythmTrainer.startTime) / 1000).toFixed(1);
  el.textContent = `⏱️ ${sec}초`;
}

function finishRhythmDan() {
  stopRhythmTimer();
  state.rhythmTrainer.isPlaying = false;
  if (state.rhythmTrainer.liveTimerInterval) {
    clearInterval(state.rhythmTrainer.liveTimerInterval);
  }

  const elapsedSec = (Date.now() - (state.rhythmTrainer.startTime || Date.now())) / 1000;
  const timerBadge = document.getElementById('rhythm-live-timer');
  if (timerBadge) timerBadge.textContent = `⏱️ ${elapsedSec.toFixed(1)}초`;

  const dan = state.rhythmTrainer.dan;
  const dir = state.rhythmTrainer.direction;
  const dirText = dir === 'forward' ? '순서대로' : '거꾸로';
  const recordKey = `rhythm_${dan}_${dir}`;

  const recResult = saveRecord(recordKey, elapsedSec);
  updateRhythmRankPanel();
  updateHomeBestTags();

  const lastIdx = state.rhythmTrainer.orderList.length - 1;
  const lastRow = document.getElementById(`r-row-${lastIdx}`);
  if (lastRow) {
    lastRow.classList.remove('active');
    lastRow.classList.add('done');
  }

  state.stars += 3;
  let bannerRecordMsg = '';

  // [사용자 요청 반영] 리듬 구구단 4세트 완주 시 도장 1개 지급
  state.stampProgress.rhythm = (state.stampProgress.rhythm || 0) + 1;
  const rhythmCount = state.stampProgress.rhythm;
  const isRhythmStampEarned = rhythmCount >= 4;

  let rhythmStampMsg = '';
  if (isRhythmStampEarned) {
    state.stampProgress.rhythm = 0;
    state.stamps.push({
      type: 'gold',
      title: '리듬 4세트 완주',
      date: new Date().toLocaleDateString('ko-KR')
    });
    rhythmStampMsg = `<br><span style="color:#d84315; font-weight:900;">💮 <strong>축하합니다! 리듬구구단 4세트 완주 달성! 도장판에 도장 쾅!</strong> 💮 (4/4 완료)</span>`;
    sounds.playStamp();
  } else {
    rhythmStampMsg = `<br><span style="color:#e65100; font-weight:bold;">💮 도장 획득까지: <strong>${rhythmCount} / 4세트 완주</strong> (${4 - rhythmCount}세트 남음)</span>`;
  }

  if (recResult.isNewFirst) {
    // 👑 1위 신기록 갱신 시: 특대형 7단계 폭죽 + 보너스 도장 +1개 추가!
    confetti.megaBurst();
    sounds.playFanfare();

    state.stamps.push({
      type: 'gold',
      title: `👑 ${dan}단 최고기록!`,
      date: `${elapsedSec.toFixed(1)}초 (${dirText})`
    });

    bannerRecordMsg = ` 👑 <strong>최고 신기록 갱신 (${elapsedSec.toFixed(1)}초)! 1위 보너스 도장 +1개 쾅!</strong> 💮`;
  } else {
    // 일반 완주 4연속 폭죽
    confetti.burst(window.innerWidth / 2, window.innerHeight * 0.45, 75);
    setTimeout(() => confetti.burst(window.innerWidth * 0.25, window.innerHeight * 0.35, 70), 250);
    setTimeout(() => confetti.burst(window.innerWidth * 0.75, window.innerHeight * 0.35, 70), 500);
    setTimeout(() => confetti.burst(window.innerWidth / 2, window.innerHeight * 0.25, 95), 800);
    sounds.playFanfare();

    bannerRecordMsg = ` ⏱️ 완주 시간: <strong>${elapsedSec.toFixed(1)}초</strong>`;
  }

  saveUserData();
  updateUserBadge();
  updateHeaderStampCount();
  updateStampProgressUI();

  const banner = document.getElementById('rhythm-status-msg');
  if (banner) {
    banner.innerHTML = `🎉 <strong>[ ${dan}단 (${dirText}) ] 완주 대성공!</strong>${bannerRecordMsg} ⭐ +3 획득!${rhythmStampMsg}`;
  }

  const counter = document.getElementById('rhythm-step-counter');
  if (counter) counter.textContent = '9 / 9 (완료)';

  const playBtn = document.getElementById('btn-rhythm-play');
  if (playBtn) {
    playBtn.textContent = '🔄 다시 하기';
    playBtn.className = 'ctrl-btn btn-play-pause btn-rhythm-main-act';
    playBtn.onclick = restartRhythm;
  }
}

// 리듬 구구단 한쪽 구석 Top 5 패널 렌더링
function updateRhythmRankPanel() {
  const dan = state.rhythmTrainer.dan;
  const dir = state.rhythmTrainer.direction;
  const dirText = dir === 'forward' ? '순서대로' : '거꾸로';
  const key = `rhythm_${dan}_${dir}`;

  const titleEl = document.getElementById('r-rank-title');
  if (titleEl) titleEl.textContent = `${dan}단 (${dirText})`;

  const listEl = document.getElementById('r-rank-list');
  if (!listEl) return;

  const records = getRecords(key);
  const medals = ['🥇 1위', '🥈 2위', '🥉 3위', '4위', '5위'];
  let html = '';

  for (let i = 0; i < 5; i++) {
    if (records[i]) {
      const isFirst = i === 0;
      html += `
        <div class="r-rank-row ${isFirst ? 'rank-1' : ''}">
          <span class="r-rank-pos">${medals[i]}</span>
          <span class="r-rank-time">${records[i].time}초</span>
          <span class="r-rank-date">${records[i].date}</span>
        </div>
      `;
    } else {
      html += `
        <div class="r-rank-row empty">
          <span class="r-rank-pos">${medals[i]}</span>
          <span class="r-rank-time">—</span>
          <span class="r-rank-date">도전 대기 ✨</span>
        </div>
      `;
    }
  }
  listEl.innerHTML = html;
}

// 퀴즈 결과 화면의 Top 5 랭킹 보드 렌더링
function renderResultTop5(recordKey, currentSec, isNewFirst) {
  const container = document.getElementById('res-top5-list');
  const tagEl = document.getElementById('res-top5-mode-tag');
  if (!container) return;

  const records = getRecords(recordKey);
  const parts = recordKey.split('_'); // ['quiz', mode, danKey]
  const modeName = getModeTitle(parts[1]);
  const danName = getDanLabel(parts[2]);
  if (tagEl) tagEl.textContent = `[ ${modeName} - ${danName} ]`;

  let html = '';
  const medals = ['🥇 1위', '🥈 2위', '🥉 3위', '4위', '5위'];

  for (let i = 0; i < 5; i++) {
    if (records[i]) {
      const isCurrent = Math.abs(records[i].time - parseFloat(currentSec.toFixed(1))) < 0.05;
      const highlightClass = isCurrent ? 'highlight-new' : (i === 0 ? 'top-1' : '');
      html += `
        <div class="top5-item ${highlightClass}">
          <span class="top5-rank">${medals[i]}</span>
          <span class="top5-time">${records[i].time}초</span>
          <span class="top5-date">${records[i].date}${isCurrent ? ' (방금!)' : ''}</span>
        </div>
      `;
    } else {
      html += `
        <div class="top5-item empty">
          <span class="top5-rank">${medals[i]}</span>
          <span class="top5-time">—</span>
          <span class="top5-date">기록 도전 중 ✨</span>
        </div>
      `;
    }
  }
  container.innerHTML = html;
}

// ========================================================
// --- 14. 명예의 전당 (Top 5 랭킹) 모달 컨트롤러 ---
// ========================================================
let currentRankingTab = 'rhythm';
let currentRankingDan = '2';
let currentRankingRhythmDir = 'forward';

function openRankingModal() {
  const modal = document.getElementById('ranking-modal');
  if (modal) modal.classList.add('active');
  sounds.playBeep(520, 0.05);
  renderRankingModalContent();
}

function closeRankingModal(event) {
  if (event && event.target !== event.currentTarget) return;
  const modal = document.getElementById('ranking-modal');
  if (modal) modal.classList.remove('active');
}

function switchRankingTab(tab) {
  currentRankingTab = tab;
  sounds.playBeep(580, 0.04);

  const tabs = document.querySelectorAll('.r-tab-btn');
  tabs.forEach(btn => {
    if (btn.getAttribute('data-tab') === tab) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  renderRankingModalContent();
}

function setRankingDan(dan) {
  currentRankingDan = dan;
  sounds.playBeep(520, 0.04);
  renderRankingModalContent();
}

function setRankingRhythmDir(dir) {
  currentRankingRhythmDir = dir;
  sounds.playBeep(520, 0.04);
  renderRankingModalContent();
}

function renderRankingModalContent() {
  const filterContainer = document.getElementById('ranking-dan-filter');
  const top5Container = document.getElementById('ranking-top5-container');
  if (!filterContainer || !top5Container) return;

  if (currentRankingTab === 'rhythm') {
    let danHtml = '<div class="r-dan-chips-row">';
    for (let d = 2; d <= 9; d++) {
      const active = (currentRankingDan === d.toString()) ? 'active' : '';
      danHtml += `<button class="r-filter-chip ${active}" onclick="setRankingDan('${d}')">${d}단</button>`;
    }
    danHtml += '</div>';

    danHtml += `
      <div class="r-dir-chips-row" style="margin-top: 6px;">
        <button class="r-filter-chip ${currentRankingRhythmDir === 'forward' ? 'active' : ''}" onclick="setRankingRhythmDir('forward')">순서대로 (1➔9)</button>
        <button class="r-filter-chip ${currentRankingRhythmDir === 'reverse' ? 'active' : ''}" onclick="setRankingRhythmDir('reverse')">거꾸로 (9➔1)</button>
      </div>
    `;
    filterContainer.innerHTML = danHtml;

    const recordKey = `rhythm_${currentRankingDan}_${currentRankingRhythmDir}`;
    const dirText = currentRankingRhythmDir === 'forward' ? '순서대로' : '거꾸로';
    renderRankingModalList(recordKey, `리듬 구구단 [ ${currentRankingDan}단 (${dirText}) ]`);
  } else {
    let danHtml = '<div class="r-dan-chips-row">';
    const dans = ['all', '2', '3', '4', '5', '6', '7', '8', '9'];
    dans.forEach(d => {
      const label = d === 'all' ? '전체' : `${d}단`;
      const active = (currentRankingDan === d) ? 'active' : '';
      danHtml += `<button class="r-filter-chip ${active}" onclick="setRankingDan('${d}')">${label}</button>`;
    });
    danHtml += '</div>';
    filterContainer.innerHTML = danHtml;

    const recordKey = `quiz_${currentRankingTab}_${currentRankingDan}`;
    const modeName = getModeTitle(currentRankingTab);
    const danName = getDanLabel(currentRankingDan);
    renderRankingModalList(recordKey, `${modeName} [ ${danName} ]`);
  }
}

function renderRankingModalList(key, title) {
  const top5Container = document.getElementById('ranking-top5-container');
  if (!top5Container) return;

  const records = getRecords(key);
  const medals = ['🥇 1위', '🥈 2위', '🥉 3위', '4위', '5위'];

  let html = `<div class="rank-modal-header-tag">🏆 ${title} Top 5</div><div class="rank-modal-rows">`;
  for (let i = 0; i < 5; i++) {
    if (records[i]) {
      const isFirst = i === 0;
      html += `
        <div class="r-modal-row ${isFirst ? 'rank-1' : ''}">
          <span class="r-modal-pos">${medals[i]}</span>
          <span class="r-modal-time">⏱️ ${records[i].time}초</span>
          <span class="r-modal-date">📅 ${records[i].date}</span>
        </div>
      `;
    } else {
      html += `
        <div class="r-modal-row empty">
          <span class="r-modal-pos">${medals[i]}</span>
          <span class="r-modal-time">—</span>
          <span class="r-modal-date">기록 도전 중 ✨</span>
        </div>
      `;
    }
  }
  html += '</div>';
  top5Container.innerHTML = html;
}

function resetAllTimeRecords() {
  if (confirm('모든 단수와 모드의 시간 기록(Top 5)을 전부 초기화할까요?')) {
    state.records = {};
    localStorage.removeItem('gugudan_time_records');
    renderRankingModalContent();
    updateHomeBestTags();
    if (typeof updateRhythmRankPanel === 'function') updateRhythmRankPanel();
    alert('모든 시간 기록이 깨끗하게 초기화되었습니다! ✨');
  }
}

// =========================================================================
// --- 13. 마법의 0 뺄셈 특훈 시스템 (가운데 0 받아내림 마스터) ---
// =========================================================================

const subState = {
  level: 2, // 1: 100의 마법, 2: 가운데 0 변신, 3: 연속 0 끝판왕, 4: 실전 10문제
  questions: [],
  currentIndex: 0,
  currentInput: '',
  isHintActive: true, // 기본으로 힌트 활성화되어 아이에게 원리를 시각화
  correctCount: 0,
  startTime: 0,
  isProcessing: false
};

// 1. 화면 진입 및 단계 선택
function openSubtractionScreen(level = 2) {
  sounds.playBeep(580, 0.06);
  subState.level = level;
  switchScreen('screen-subtraction');
  updateSubLevelTabs();
  startSubtractionGame(level);
}

function selectSubLevel(level) {
  sounds.playBeep(520, 0.05);
  subState.level = level;
  updateSubLevelTabs();
  startSubtractionGame(level);
}

function updateSubLevelTabs() {
  const tabs = document.querySelectorAll('.sub-tab-btn');
  tabs.forEach(btn => {
    const lvl = parseInt(btn.getAttribute('data-level'), 10);
    if (lvl === subState.level) btn.classList.add('active');
    else btn.classList.remove('active');
  });

  const badge = document.getElementById('sub-level-badge');
  if (badge) {
    const titles = {
      1: '1단계: 100의 마법 (100 - XX)',
      2: '2단계: 가운데 0 변신 ⭐ (핵심 특훈)',
      3: '3단계: 연속 0 끝판왕 (1004 - 368)',
      4: '4단계: 실전 10문제 도전'
    };
    badge.textContent = titles[subState.level] || '마법의 0 뺄셈';
  }
}

function toggleMagicHint() {
  subState.isHintActive = !subState.isHintActive;
  sounds.playBeep(subState.isHintActive ? 640 : 440, 0.05);
  const statusEl = document.getElementById('hint-status-text');
  if (statusEl) {
    statusEl.textContent = subState.isHintActive ? '켜짐 💡' : '꺼짐 🔒';
  }
  renderSubQuestion();
}

function exitSubtractionToHome() {
  sounds.playBeep(480, 0.05);
  subState.isProcessing = false;
  goHome();
}

// 2. 0 뺄셈 문제 자동 생성기 (초등 교육과정 특화)
function generateSubProblems(level) {
  const list = [];
  const usedKeys = new Set();

  while (list.length < 10) {
    let top = 0;
    let bot = 0;

    let curLevel = level;
    if (level === 4) {
      // 4단계 실전: 1단계 2문항, 2단계 6문항, 3단계 2문항
      if (list.length < 2) curLevel = 1;
      else if (list.length < 8) curLevel = 2;
      else curLevel = 3;
    }

    if (curLevel === 1) {
      // 1단계: 100의 마법 (100, 200, 300, 400, 500, 600, 700, 800, 900 - XX)
      const hChoices = [100, 200, 300, 400, 500, 600, 700, 800, 900];
      top = hChoices[Math.floor(Math.random() * hChoices.length)];
      const botTens = Math.floor(Math.random() * 8) + 1; // 1~8
      const botOnes = Math.floor(Math.random() * 9) + 1; // 1~9
      bot = botTens * 10 + botOnes;
    } else if (curLevel === 2) {
      // 2단계: 가운데 0 변신 (X0X - XXX) [가장 중요한 핵심 특훈!]
      // 십의 자리가 0이고, 일의 자리는 반드시 받아내림이 발생하여 0이 9로 변신함!
      const topH = Math.floor(Math.random() * 8) + 2; // 2~9
      const topO = Math.floor(Math.random() * 7); // 0~6
      top = topH * 100 + topO;

      const botH = Math.floor(Math.random() * (topH - 1)) + 1; // 1 ~ topH-1
      const botT = Math.floor(Math.random() * 8) + 1; // 1~8
      const botO = Math.floor(Math.random() * (9 - topO)) + (topO + 1); // topO+1 ~ 9 (반드시 topO < botO)
      bot = botH * 100 + botT * 10 + botO;
    } else {
      // 3단계: 연속 0 끝판왕 (100X - XXX 또는 200X - XXX 또는 1000 - XXX)
      const topBase = Math.random() < 0.5 ? 1000 : 2000;
      const topO = Math.floor(Math.random() * 6); // 0~5
      top = topBase + topO;

      const botH = Math.floor(Math.random() * 7) + 2; // 2~8
      const botT = Math.floor(Math.random() * 8) + 1; // 1~8
      const botO = Math.floor(Math.random() * (9 - topO)) + (topO + 1); // topO+1 ~ 9
      bot = botH * 100 + botT * 10 + botO;
    }

    const key = `${top}-${bot}`;
    if (!usedKeys.has(key) && top > bot) {
      usedKeys.add(key);
      const diff = top - bot;
      const parsed = parseSubProblemData(top, bot, diff);
      list.push(parsed);
    }
  }

  return list;
}

// 3. 문제 단계별 자릿수 및 받아내림 변신 상세 분석
function parseSubProblemData(top, bot, ans) {
  const topStr = top.toString();
  const botStr = bot.toString();
  const len = topStr.length; // 3 또는 4

  const paddedBotStr = botStr.padStart(len, '0');
  const digitsTop = topStr.split('').map(d => parseInt(d, 10));
  const digitsBot = paddedBotStr.split('').map(d => parseInt(d, 10));

  // 받아내림 시뮬레이션
  const borrowBadge = new Array(len).fill(null);
  const isSlashed = new Array(len).fill(false);
  const intermediate10 = new Array(len).fill(false);
  const workingTop = [...digitsTop];

  for (let i = len - 1; i >= 0; i--) {
    if (workingTop[i] < digitsBot[i]) {
      // 왼쪽에서 빌려올 자리 탐색
      let k = i - 1;
      while (k >= 0 && workingTop[k] === 0) {
        k--;
      }

      if (k >= 0) {
        // k번째 자리에서 1 감소
        workingTop[k] -= 1;
        isSlashed[k] = true;
        borrowBadge[k] = workingTop[k];

        // k와 i 사이의 모든 0들은 10이 되었다가 1을 주어 9로 변신!
        for (let m = k + 1; m < i; m++) {
          workingTop[m] = 9;
          isSlashed[m] = true;
          borrowBadge[m] = 9;
          intermediate10[m] = true; // 10 -> 9 변신 시각화
        }

        // i번째 자리는 10을 받아 더해짐
        isSlashed[i] = true;
        borrowBadge[i] = workingTop[i] + 10;
        workingTop[i] += 10;
      }
    }
  }

  // 삐약이 말풍선 설명 문구 생성
  let explText = '';
  if (len === 3) {
    const oTop = digitsTop[2];
    const oBot = digitsBot[2];
    const tTop = digitsTop[1];
    const tBot = digitsBot[1];
    const hTop = digitsTop[0];
    const hBot = digitsBot[0];

    explText = `<strong>🐥 삐약이의 마법 설명:</strong><br>` +
      `① 일의 자리: <strong>${oTop}</strong>에서 ${oBot}을 뺄 수 없어서 옆집을 보니 <strong>0</strong>이에요!<br>` +
      `② 백의 자리 <strong>${hTop}</strong>에서 10을 빌려와 십의 자리가 10이 된 뒤, 일의 자리에 1을 주니까 <strong>0이 9로 변신</strong>해요! ✨<br>` +
      `③ 일의 자리: <strong>${borrowBadge[2]} − ${oBot} = ${ans % 10}</strong>, ` +
      `십의 자리: <strong>9 − ${tBot} = ${Math.floor((ans % 100) / 10)}</strong>, ` +
      `백의 자리: <strong>${borrowBadge[0]} − ${hBot} = ${Math.floor(ans / 100)}</strong>!`;
  } else {
    explText = `<strong>🐥 삐약이의 마법 설명:</strong><br>` +
      `연속 0의 마법! 앞자리에서 빌려올 때 가운데 있는 모든 <strong>0들은 전부 9</strong>로 변신하고, 맨 끝 일의 자리만 <strong>10을 더해줘요!</strong> ✨<br>` +
      `정답은 <strong>${ans}</strong>!`;
  }

  return {
    top,
    bot,
    ans,
    len,
    digitsTop,
    digitsBot,
    borrowBadge,
    isSlashed,
    intermediate10,
    explText
  };
}

// 4. 게임 시작 및 문제 로드
function startSubtractionGame(level = subState.level) {
  subState.level = level;
  subState.questions = generateSubProblems(level);
  subState.currentIndex = 0;
  subState.correctCount = 0;
  subState.currentInput = '';
  subState.startTime = Date.now();
  subState.isProcessing = false;

  renderSubQuestion();
}

function renderSubQuestion() {
  const q = subState.questions[subState.currentIndex];
  if (!q) return;

  // 카운터 갱신
  const counterEl = document.getElementById('sub-q-counter');
  if (counterEl) counterEl.textContent = `${subState.currentIndex + 1} / 10`;

  // 피드백 초기화
  const fbEl = document.getElementById('sub-feedback');
  if (fbEl) {
    fbEl.textContent = '';
    fbEl.className = 'sub-feedback';
  }

  // 자릿수 헤더 (천의 자리 표시 여부)
  const lblTh = document.getElementById('lbl-th');
  if (lblTh) {
    lblTh.style.display = q.len === 4 ? 'inline-block' : 'none';
  }

  // 1. 받아내림 변신 뱃지 줄
  const borrowRow = document.getElementById('sub-borrow-row');
  let borrowHtml = '<span class="op-space"></span>';
  for (let i = 0; i < q.len; i++) {
    const colClass = getColClass(i, q.len);
    if (subState.isHintActive && q.borrowBadge[i] !== null) {
      if (q.intermediate10[i]) {
        borrowHtml += `
          <div class="col-cell ${colClass}">
            <span class="borrow-badge intermediate-10">10</span>
            <span class="borrow-badge zero-to-nine">${q.borrowBadge[i]}</span>
          </div>`;
      } else {
        borrowHtml += `
          <div class="col-cell ${colClass}">
            <span class="borrow-badge">${q.borrowBadge[i]}</span>
          </div>`;
      }
    } else {
      borrowHtml += `<div class="col-cell ${colClass}"></div>`;
    }
  }
  if (borrowRow) borrowRow.innerHTML = borrowHtml;

  // 2. 위쪽 수 줄
  const topRow = document.getElementById('sub-top-row');
  let topHtml = '<span class="op-space"></span>';
  for (let i = 0; i < q.len; i++) {
    const colClass = getColClass(i, q.len);
    const slashedClass = (subState.isHintActive && q.isSlashed[i]) ? 'slashed' : '';
    topHtml += `
      <div class="digit-box col-cell ${colClass} ${slashedClass}">
        <span class="digit-val">${q.digitsTop[i]}</span>
      </div>`;
  }
  if (topRow) topRow.innerHTML = topHtml;

  // 3. 아래쪽 수 줄 (연산자 포함)
  const botRow = document.getElementById('sub-bottom-row');
  let botHtml = '<span class="op-sign">−</span>';
  for (let i = 0; i < q.len; i++) {
    const colClass = getColClass(i, q.len);
    const val = (i === 0 && q.digitsBot[i] === 0) ? '' : q.digitsBot[i];
    botHtml += `
      <div class="digit-box col-cell ${colClass}">
        <span class="digit-val">${val}</span>
      </div>`;
  }
  if (botRow) botRow.innerHTML = botHtml;

  // 4. 정답 입력 줄
  updateSubAnswerRow(q);

  // 5. 말풍선 안내 문구
  const bubbleContent = document.getElementById('bubble-content-text');
  if (bubbleContent) {
    if (subState.isHintActive) {
      bubbleContent.innerHTML = q.explText;
    } else {
      bubbleContent.innerHTML = `<strong>🐥 삐약이의 마법 비법:</strong><br>` +
        `가운데 <strong>0</strong>은 무조건 <strong>9</strong>로 변신하고, 맨 끝 일의 자리에는 <strong>10을 더해줘요!</strong> 머릿속으로 변신을 떠올려보세요 ✨<br>` +
        `(헷갈리면 언제든 상단의 <strong>[🪄 마법 힌트]</strong>를 누르면 변신이 짠! 나타나요)`;
    }
  }

  updateSubInputDisplay();
}

function getColClass(idx, len) {
  if (len === 4) {
    const classes = ['col-th', 'col-h', 'col-t', 'col-o'];
    return classes[idx] || '';
  } else {
    const classes = ['col-h', 'col-t', 'col-o'];
    return classes[idx] || '';
  }
}

function updateSubAnswerRow(q) {
  const ansRow = document.getElementById('sub-answer-row');
  if (!ansRow) return;

  const currentInputStr = subState.currentInput;
  const inputDigits = currentInputStr.split('');

  // 오른쪽 정렬하여 자릿수 채우기
  let ansHtml = '<span class="op-space"></span>';
  const startOffset = q.len - inputDigits.length;

  for (let i = 0; i < q.len; i++) {
    const colClass = getColClass(i, q.len);
    let digitChar = '?';
    let isFilled = false;

    if (i >= startOffset && inputDigits.length > 0) {
      digitChar = inputDigits[i - startOffset];
      isFilled = true;
    }

    ansHtml += `
      <div class="digit-box answer-box col-cell ${colClass} ${isFilled ? 'filled' : ''}" id="sub-ans-box-${i}">
        ${digitChar}
      </div>`;
  }

  ansRow.innerHTML = ansHtml;
}

// 5. 키패드 조작 및 정답 확인
function pressSubKey(key) {
  if (subState.isProcessing) return;
  sounds.playBeep(480, 0.04);

  if (key === 'clear') {
    subState.currentInput = subState.currentInput.slice(0, -1);
  } else if (typeof key === 'number') {
    const q = subState.questions[subState.currentIndex];
    const maxLen = q ? q.len : 4;
    if (subState.currentInput.length < maxLen) {
      subState.currentInput += key.toString();
    }
  }

  updateSubInputDisplay();
  const q = subState.questions[subState.currentIndex];
  if (q) updateSubAnswerRow(q);
}

function updateSubInputDisplay() {
  const inputEl = document.getElementById('sub-current-input');
  if (inputEl) {
    inputEl.textContent = subState.currentInput || '';
  }
}

function submitSubAnswer() {
  if (subState.isProcessing) return;
  if (!subState.currentInput) {
    sounds.playBeep(320, 0.08);
    return;
  }

  const q = subState.questions[subState.currentIndex];
  if (!q) return;

  const userNum = parseInt(subState.currentInput, 10);
  const fbEl = document.getElementById('sub-feedback');

  if (userNum === q.ans) {
    // 정답!
    subState.isProcessing = true;
    subState.correctCount++;
    sounds.playCorrect();

    // 힌트가 꺼져있었다면 정답일 때 마법 변신을 시각적으로 보여줌
    if (!subState.isHintActive) {
      subState.isHintActive = true;
      renderSubQuestion();
    }

    if (fbEl) {
      fbEl.textContent = '🎉 딩동댕! 마법의 0 뺄셈 대성공!';
      fbEl.className = 'sub-feedback correct';
    }

    // 1초 후 다음 문제
    setTimeout(() => {
      subState.isProcessing = false;
      subState.currentInput = '';
      subState.currentIndex++;

      if (subState.currentIndex >= subState.questions.length) {
        finishSubtractionGame();
      } else {
        renderSubQuestion();
      }
    }, 1100);

  } else {
    // 오답!
    sounds.playWrong();
    if (fbEl) {
      fbEl.textContent = '앗, 다시 한 번 볼까요? 🪄 마법 힌트의 변신을 살펴보세요!';
      fbEl.className = 'sub-feedback wrong';
    }

    // 오답 시 아이가 당황하지 않도록 자동으로 마법 힌트 켜주기
    if (!subState.isHintActive) {
      subState.isHintActive = true;
      renderSubQuestion();
    }

    // 입력값 리셋
    subState.currentInput = '';
    updateSubInputDisplay();
    updateSubAnswerRow(q);
  }
}

// 6. 10문제 완료 및 보상 처리 (도장, 별, 쿠폰 연동)
function finishSubtractionGame() {
  sounds.playFanfare();
  if (confetti) confetti.megaBurst();

  // 별점 10점 지급
  state.stars += 10;

  // 도장 진행도 +1
  state.stampProgress.subtraction = (state.stampProgress.subtraction || 0) + 1;
  const subCount = state.stampProgress.subtraction;
  let isEarnedBoardStamp = false;

  let stampProgressMsg = '';
  if (subCount >= 3) {
    isEarnedBoardStamp = true;
    state.stampProgress.subtraction = 0;
    state.stamps.push({
      type: 'gold',
      title: '0 뺄셈 특훈 완주',
      date: new Date().toLocaleDateString('ko-KR')
    });
    stampProgressMsg = '🎉 <strong>0 뺄셈 특훈 3세트 완주 대성공!</strong> 도장판에 도장이 쾅 찍혔어요! 💮';
  } else {
    stampProgressMsg = `💮 도장판 도장까지: <strong>${subCount} / 3세트 완료</strong> (앞으로 ${3 - subCount}세트 더 풀면 도장 쾅!)`;
  }

  saveUserData();
  updateUserBadge();
  updateHeaderStampCount();
  updateStampProgressUI();

  state.lastCompletedMode = 'subtraction';

  // 결과 화면 전환
  switchScreen('screen-result');

  document.getElementById('res-correct').textContent = subState.correctCount;
  document.getElementById('res-total').textContent = subState.questions.length;
  document.getElementById('res-stars').textContent = 10;
  document.getElementById('res-max-combo').textContent = subState.correctCount;

  const elapsedSec = ((Date.now() - subState.startTime) / 1000).toFixed(1);
  document.getElementById('res-elapsed-time').textContent = `${elapsedSec}초`;

  document.getElementById('result-title').textContent = '마법의 0 뺄셈 특훈 완료! 🪄';
  document.getElementById('result-subtitle').textContent = '0에서 빌려오는 받아내림을 멋지게 해냈어요!';

  const bannerEl = document.getElementById('res-stamp-progress-banner');
  if (bannerEl) bannerEl.innerHTML = stampProgressMsg;

  // 결과 화면 칭찬 도장 적용
  const stampSub = isEarnedBoardStamp ? '3세트 완주 💮' : `${subCount}/3세트 달성`;
  applyStampToResult('gold', '0 뺄셈 마스터', stampSub, isEarnedBoardStamp);

  // 랭킹 보드 숨기기 (구구단 전용 랭킹이므로)
  const rankCard = document.getElementById('result-top5-card');
  if (rankCard) rankCard.style.display = 'none';
}
