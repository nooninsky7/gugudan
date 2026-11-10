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
  rewardCoupon: '맛있는 아이스크림 먹기 🍦',
  selectedDans: [2, 3, 4, 5, 6, 7, 8, 9],
  wrongProblems: [],
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
    questionStartTime: 0
  },
  rhythmTrainer: {
    dan: 2,
    direction: 'forward', // 'forward' | 'reverse'
    isPlaying: false,
    currentIndex: 0,
    orderList: [1, 2, 3, 4, 5, 6, 7, 8, 9],
    stepTimer: null,
    revealTimer: null
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

  const soundBtn = document.getElementById('btn-sound-toggle');
  if (soundBtn) {
    soundBtn.addEventListener('click', () => sounds.toggle());
  }
});

function loadSavedData() {
  const savedStars = localStorage.getItem('gugudan_total_stars');
  if (savedStars) state.stars = parseInt(savedStars, 10) || 0;

  const savedStamps = localStorage.getItem('gugudan_stamps');
  if (savedStamps) {
    try {
      state.stamps = JSON.parse(savedStamps) || [];
    } catch (e) {
      state.stamps = [];
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

  updateUserBadge();
  updateHeaderStampCount();
  updateWrongReviewBtn();
}

function saveUserData() {
  localStorage.setItem('gugudan_total_stars', state.stars);
  localStorage.setItem('gugudan_stamps', JSON.stringify(state.stamps));
  localStorage.setItem('gugudan_reward_coupon', state.rewardCoupon);
  localStorage.setItem('gugudan_wrong_problems', JSON.stringify(state.wrongProblems));
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

  // 중앙에 또렷한 시작 버튼 표시 (흐림 블러 없음!)
  const overlay = document.getElementById('game-start-overlay');
  if (overlay) overlay.style.display = 'flex';
}

function startCurrentGamePlay() {
  const overlay = document.getElementById('game-start-overlay');
  if (overlay) overlay.style.display = 'none';

  sounds.playFanfare();
  state.currentGame.isStarted = true;
  state.currentGame.questionStartTime = Date.now();
  startTimerGauge();
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

  // 기존 타이머 정지 후 대기 상태로 재시작!
  if (state.currentGame.timerInterval) clearInterval(state.currentGame.timerInterval);
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
    if (!activeScreen || activeScreen.id !== 'screen-game') return;

    if (e.key >= '0' && e.key <= '9') {
      pressKey(parseInt(e.key, 10));
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      pressKey('clear');
    } else if (e.key === 'Enter' || e.key === ' ') {
      submitAnswer();
    }
  });
}

// --- 10. 결과 화면 & 스탬프 쾅! 애니메이션 ---
function finishGame() {
  const g = state.currentGame;
  if (g.timerInterval) clearInterval(g.timerInterval);

  switchScreen('screen-result');

  document.getElementById('res-correct').textContent = g.correctCount;
  document.getElementById('res-total').textContent = g.questions.length;
  document.getElementById('res-stars').textContent = g.correctCount + (g.maxCombo >= 3 ? 2 : 0);
  document.getElementById('res-max-combo').textContent = g.maxCombo;

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

  applyStampToResult(stampType, stampTitle, stampSub);

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

function applyStampToResult(stampType, stampTitle, stampSub) {
  const stampEl = document.getElementById('result-stamp');
  const stampMain = document.getElementById('stamp-main-text');
  const stampDate = document.getElementById('stamp-date-text');

  if (stampEl) stampEl.className = 'stamp-seal' + (stampType === 'gold' ? ' gold' : '');
  if (stampMain) stampMain.textContent = stampTitle;
  if (stampDate) stampDate.textContent = stampSub;

  setTimeout(() => {
    if (stampEl) stampEl.classList.add('stamped');
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
}

// --- 11. 칭찬 스탬프판 모달 시스템 ---
function openStampModal() {
  sounds.playBeep(620, 0.05);
  renderStampBoard();
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
  startGame(state.currentGame.mode);
}

function goHome() {
  sounds.playBeep(480, 0.05);
  stopRhythmTimer();
  switchScreen('screen-home');
  updateUserBadge();
  updateHeaderStampCount();
  updateWrongReviewBtn();
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

    sounds.playFanfare();

    const playBtn = document.getElementById('btn-rhythm-play');
    if (playBtn) {
      playBtn.textContent = '⏸ 일시정지';
      playBtn.className = 'ctrl-btn btn-play-pause';
    }

    const banner = document.getElementById('rhythm-status-msg');
    if (banner) {
      banner.innerHTML = `⚡ 굵고 크게 커지는 식을 보고, <strong>3초 안에 답을 먼저 말해보세요!</strong>`;
    }

    startRhythmStep();
  } else {
    toggleRhythmPlay();
  }
}

function exitRhythmToHome() {
  stopRhythmTimer();
  goHome();
}

function selectRhythmDan(dan) {
  sounds.playBeep(520, 0.04);
  state.rhythmTrainer.dan = dan;
  updateRhythmDanTabs();
  setupRhythmOrderList();
  renderRhythmBoard();
  showRhythmReadyState();
}

function setRhythmDirection(dir) {
  sounds.playBeep(520, 0.04);
  state.rhythmTrainer.direction = dir;
  updateRhythmDirectionButtons();
  setupRhythmOrderList();
  renderRhythmBoard();
  showRhythmReadyState();
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

  updateRhythmStepCounter();

  const idx = rt.currentIndex;
  const num2 = rt.orderList[idx];
  const dan = rt.dan;
  const expected = dan * num2;

  const currentRow = document.getElementById(`r-row-${idx}`);
  if (currentRow) {
    currentRow.classList.add('active');
    const ansSlot = document.getElementById(`r-ans-${idx}`);
    if (ansSlot) ansSlot.innerHTML = `<span class="thinking-dots">?</span>`;
  }

  sounds.playTone(480, 0.06, 'triangle', 0.08);

  // 3초 대기 후 정답 공개
  rt.revealTimer = setTimeout(() => {
    if (!rt.isPlaying) return;

    if (currentRow) {
      currentRow.classList.add('revealed');
      const ansSlot = document.getElementById(`r-ans-${idx}`);
      if (ansSlot) ansSlot.textContent = expected;
      sounds.playCorrect();
    }

    // 1.1초 후 다음 줄 이동
    rt.stepTimer = setTimeout(() => {
      if (!rt.isPlaying) return;

      if (currentRow) {
        currentRow.classList.remove('active');
        currentRow.classList.add('done');
      }

      rt.currentIndex++;
      startRhythmStep();
    }, 1100);

  }, 3000);
}

function stopRhythmTimer() {
  const rt = state.rhythmTrainer;
  if (rt.stepTimer) clearTimeout(rt.stepTimer);
  if (rt.revealTimer) clearTimeout(rt.revealTimer);
}

function toggleRhythmPlay() {
  const rt = state.rhythmTrainer;
  const btn = document.getElementById('btn-rhythm-play');

  if (rt.isPlaying) {
    rt.isPlaying = false;
    stopRhythmTimer();
    if (btn) {
      btn.textContent = '▶ 계속 재생';
      btn.className = 'ctrl-btn btn-play-pause btn-rhythm-main-act';
    }
  } else {
    rt.isPlaying = true;
    if (btn) {
      btn.textContent = '⏸ 일시정지';
      btn.className = 'ctrl-btn btn-play-pause';
    }
    startRhythmStep();
  }
}

function restartRhythm() {
  stopRhythmTimer();
  state.rhythmTrainer.currentIndex = 0;
  setupRhythmOrderList();
  renderRhythmBoard();
  showRhythmReadyState();
}

function finishRhythmDan() {
  stopRhythmTimer();
  state.rhythmTrainer.isPlaying = false;

  const dan = state.rhythmTrainer.dan;

  const lastIdx = state.rhythmTrainer.orderList.length - 1;
  const lastRow = document.getElementById(`r-row-${lastIdx}`);
  if (lastRow) {
    lastRow.classList.remove('active');
    lastRow.classList.add('done');
  }

  sounds.playFanfare();

  // 4연속 대형 폭죽 연출
  confetti.burst(window.innerWidth / 2, window.innerHeight * 0.45, 75);
  setTimeout(() => confetti.burst(window.innerWidth * 0.25, window.innerHeight * 0.35, 70), 250);
  setTimeout(() => confetti.burst(window.innerWidth * 0.75, window.innerHeight * 0.35, 70), 500);
  setTimeout(() => confetti.burst(window.innerWidth / 2, window.innerHeight * 0.25, 95), 800);

  state.stars += 3;
  saveUserData();
  updateUserBadge();

  const banner = document.getElementById('rhythm-status-msg');
  if (banner) {
    banner.innerHTML = `🎉 <strong>[ ${dan}단 ] 완주 대성공!</strong> 9문제 모두 멋지게 완성했어요! ⭐ +3 획득!`;
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
