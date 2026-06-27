// Premium Telemetry and Sound Logic for Scuderia Ferrari x WEC Vista AF Corse

class EngineSynth {
  constructor() {
    this.ctx = null;
    this.started = false;
    this.lowOsc1 = null;
    this.lowOsc2 = null;
    this.gainNode = null;
    this.filterNode = null;
    this.idleGain = 0.12;
  }
  
  init() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();
    
    // Create nodes
    this.lowOsc1 = this.ctx.createOscillator();
    this.lowOsc2 = this.ctx.createOscillator();
    this.gainNode = this.ctx.createGain();
    this.filterNode = this.ctx.createBiquadFilter();
    
    // Low frequency oscillators for deep rumble
    this.lowOsc1.type = 'sawtooth';
    this.lowOsc1.frequency.setValueAtTime(45, this.ctx.currentTime); // V8 low rumble
    
    this.lowOsc2.type = 'triangle';
    this.lowOsc2.frequency.setValueAtTime(45.5, this.ctx.currentTime);
    
    // Filter out high frequencies to make it deep
    this.filterNode.type = 'lowpass';
    this.filterNode.frequency.setValueAtTime(110, this.ctx.currentTime);
    this.filterNode.Q.setValueAtTime(2.5, this.ctx.currentTime);
    
    // Gain Node
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime); // start silent
    
    // Connections
    this.lowOsc1.connect(this.filterNode);
    this.lowOsc2.connect(this.filterNode);
    this.filterNode.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);
    
    // Start oscillators
    this.lowOsc1.start();
    this.lowOsc2.start();
  }
  
  startEngine() {
    if (!this.ctx) this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    // Ignition sound: play starter motor
    this.playStarterMotor();
    
    // Fade in low rumble after 0.4s
    setTimeout(() => {
      if (this.gainNode && this.ctx) {
        this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(this.idleGain, this.ctx.currentTime + 0.3);
        this.started = true;
      }
    }, 450);
  }
  
  stopEngine() {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.cancelScheduledValues(this.ctx.currentTime);
      this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.2);
    }
    this.started = false;
  }
  
  playStarterMotor() {
    if (!this.ctx) return;
    // Pitch sweep starter sound
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(55, this.ctx.currentTime + 0.4);
    
    gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.4);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.4);
  }
  
  revEngine(targetFreq = 110, duration = 0.6) {
    if (!this.started || !this.ctx) return;
    
    const now = this.ctx.currentTime;
    
    // Ramp up frequency
    this.lowOsc1.frequency.cancelScheduledValues(now);
    this.lowOsc1.frequency.exponentialRampToValueAtTime(targetFreq, now + duration * 0.4);
    this.lowOsc1.frequency.exponentialRampToValueAtTime(45, now + duration);
    
    this.lowOsc2.frequency.cancelScheduledValues(now);
    this.lowOsc2.frequency.exponentialRampToValueAtTime(targetFreq + 0.5, now + duration * 0.4);
    this.lowOsc2.frequency.exponentialRampToValueAtTime(45.5, now + duration);
    
    // Ramp filter frequency (open filter for brighter rev sound)
    this.filterNode.frequency.cancelScheduledValues(now);
    this.filterNode.frequency.exponentialRampToValueAtTime(targetFreq * 2.5, now + duration * 0.4);
    this.filterNode.frequency.exponentialRampToValueAtTime(110, now + duration);
    
    // Slightly increase volume during rev
    this.gainNode.gain.cancelScheduledValues(now);
    this.gainNode.gain.linearRampToValueAtTime(this.idleGain * 1.6, now + duration * 0.4);
    this.gainNode.gain.linearRampToValueAtTime(this.idleGain, now + duration);
  }
  
  playInteractionChirp() {
    if (!this.ctx) return;
    // Clean, high-end mechanical click/switch feedback
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(10, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }
  
  playPartnerGlitch() {
    if (!this.ctx) return;
    // Premium mechanical transition noise sweep
    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.15; // 150ms
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2000, now);
      filter.frequency.exponentialRampToValueAtTime(600, now + 0.15);
      
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      
      noise.start();
      noise.stop(now + 0.15);
    } catch (e) {
      this.playInteractionChirp();
    }
  }
}

// Global Synthesizer instance
const synth = new EngineSynth();

document.addEventListener('DOMContentLoaded', () => {
  setupIgnition();
  setupTelemetrySimulation();
  setupCanvasChart();
  setupUIInteractions();
  setupDragAndDrop();
});

// Setup Engine Start Audio Button
function setupIgnition() {
  const ignitionBtn = document.getElementById('ignition-btn');
  const hudStatus = document.getElementById('engine-status');
  const statusDot = document.getElementById('status-dot');
  
  if (!ignitionBtn) return;
  
  ignitionBtn.addEventListener('click', () => {
    if (!synth.started) {
      synth.startEngine();
      ignitionBtn.classList.add('active');
      ignitionBtn.textContent = 'Engine Stop';
      if (hudStatus) {
        hudStatus.textContent = 'ACTIVE';
        hudStatus.style.color = 'var(--ferrari-red)';
      }
      if (statusDot) {
        statusDot.classList.add('active');
      }
      triggerVisualGlitch(document.querySelector('.hero-title'));
    } else {
      synth.stopEngine();
      ignitionBtn.classList.remove('active');
      ignitionBtn.textContent = 'Engine Start';
      if (hudStatus) {
        hudStatus.textContent = 'STANDBY';
        hudStatus.style.color = 'var(--text-gray)';
      }
      if (statusDot) {
        statusDot.classList.remove('active');
      }
    }
  });
}

// Telemetry Values State & Sim Loop
const telemetryState = {
  speed: 310,
  rpm: 6200,
  gear: 6,
  gforce: 2.8,
  tireTempFL: 92,
  tireTempFR: 94,
  tireTempRL: 98,
  tireTempRR: 97,
  lapTimeMs: 104250, // 1:44.250
  sector1: 27.84,
  sector2: 41.12,
  sector3: 35.29,
  throttle: 85,
  brake: 0,
};

function setupTelemetrySimulation() {
  const speedEl = document.getElementById('sim-speed');
  const rpmBarEl = document.getElementById('sim-rpm-bar');
  const gearEl = document.getElementById('sim-gear');
  const gforceEl = document.getElementById('sim-gforce');
  const tempFLEl = document.getElementById('sim-temp-fl');
  const tempFREl = document.getElementById('sim-temp-fr');
  const tempRLEl = document.getElementById('sim-temp-rl');
  const tempRREl = document.getElementById('sim-temp-rr');
  const throttleEl = document.getElementById('sim-throttle');
  const brakeEl = document.getElementById('sim-brake');
  
  setInterval(() => {
    // Dynamic racing simulation logic
    
    // Accelerating / Shifting simulation
    if (telemetryState.throttle > 50) {
      telemetryState.rpm += Math.floor(Math.random() * 250) + 100;
      telemetryState.speed += Math.random() > 0.3 ? 1 : 0;
      telemetryState.gforce = +(2.5 + Math.random() * 1.2).toFixed(2);
      
      // Shift gears at 8400 rpm
      if (telemetryState.rpm >= 8400) {
        if (telemetryState.gear < 8) {
          telemetryState.gear++;
          telemetryState.rpm = 6400; // drops after upshift
          synth.revEngine(130, 0.4); // trigger upshift sound pitch
        } else {
          // Maxed out gear 8, hover at top speed
          telemetryState.rpm = 8200 + Math.floor(Math.random() * 200);
          telemetryState.speed = 340 + Math.floor(Math.random() * 4);
        }
      }
    } else {
      // braking/deceleration simulation
      telemetryState.rpm -= Math.floor(Math.random() * 300) + 150;
      if (telemetryState.rpm < 5200) {
        if (telemetryState.gear > 5) {
          telemetryState.gear--;
          telemetryState.rpm = 7400; // spikes up on downshift
          synth.revEngine(145, 0.35); // downshift rev matching sound
        } else {
          telemetryState.rpm = 5200;
        }
      }
      telemetryState.speed -= Math.floor(Math.random() * 3) + 1;
      telemetryState.gforce = +(1.0 + Math.random() * 0.5).toFixed(2);
    }
    
    // Limit speed range
    if (telemetryState.speed > 346) telemetryState.speed = 346;
    if (telemetryState.speed < 280) telemetryState.speed = 280;
    
    // Simulate lap time increment
    telemetryState.lapTimeMs += 33; // ~30fps
    
    // Simulate dynamic throttle and brake action
    if (Math.random() > 0.95) {
      // Toggle braking corner
      if (telemetryState.throttle > 0) {
        telemetryState.throttle = 0;
        telemetryState.brake = 80 + Math.floor(Math.random() * 20);
      } else {
        telemetryState.throttle = 80 + Math.floor(Math.random() * 20);
        telemetryState.brake = 0;
      }
    }
    
    // Slowly fluctuate tire temperatures
    telemetryState.tireTempFL = +(90 + Math.sin(Date.now() / 15000) * 4 + Math.random() * 0.5).toFixed(1);
    telemetryState.tireTempFR = +(92 + Math.cos(Date.now() / 12000) * 3 + Math.random() * 0.5).toFixed(1);
    telemetryState.tireTempRL = +(96 + Math.sin(Date.now() / 20000) * 5 + Math.random() * 0.5).toFixed(1);
    telemetryState.tireTempRR = +(95 + Math.cos(Date.now() / 18000) * 4 + Math.random() * 0.5).toFixed(1);
    
    // Render to UI elements
    if (speedEl) speedEl.textContent = Math.round(telemetryState.speed);
    if (gearEl) gearEl.textContent = telemetryState.gear;
    if (gforceEl) gforceEl.textContent = telemetryState.gforce + ' G';
    if (tempFLEl) tempFLEl.textContent = telemetryState.tireTempFL + '°C';
    if (tempFREl) tempFREl.textContent = telemetryState.tireTempFR + '°C';
    if (tempRLEl) tempRLEl.textContent = telemetryState.tireTempRL + '°C';
    if (tempRREl) tempRREl.textContent = telemetryState.tireTempRR + '°C';
    if (throttleEl) throttleEl.textContent = telemetryState.throttle + '%';
    if (brakeEl) brakeEl.textContent = telemetryState.brake + '%';
    
    if (rpmBarEl) {
      const percentage = (telemetryState.rpm - 4000) / (9000 - 4000) * 100;
      rpmBarEl.style.width = Math.max(0, Math.min(100, percentage)) + '%';
    }
    
    // Digital clock on HUD
    const timeHud = document.getElementById('hud-time');
    if (timeHud) {
      const d = new Date();
      timeHud.textContent = d.toTimeString().split(' ')[0] + '.' + String(d.getMilliseconds()).padStart(3, '0');
    }
  }, 100);
}

// Canvas Live Telemetry Line Chart Draw
function setupCanvasChart() {
  const canvas = document.getElementById('telemetry-chart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  
  let width = canvas.offsetWidth;
  let height = canvas.offsetHeight;
  canvas.width = width;
  canvas.height = height;
  
  window.addEventListener('resize', () => {
    width = canvas.offsetWidth;
    height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;
  });
  
  const historyPoints = 120;
  const speedHistory = new Array(historyPoints).fill(150);
  const rpmHistory = new Array(historyPoints).fill(100);
  const throttleHistory = new Array(historyPoints).fill(50);
  
  function draw() {
    ctx.clearRect(0, 0, width, height);
    
    // Update histories
    speedHistory.push(telemetryState.speed);
    speedHistory.shift();
    
    rpmHistory.push(telemetryState.rpm);
    rpmHistory.shift();
    
    throttleHistory.push(telemetryState.throttle);
    throttleHistory.shift();
    
    // Draw background grids (very subtle gray lines)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 45) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i < height; i += 35) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }
    
    // Draw Throttle History line (Subtle Gray Outline)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(142, 142, 147, 0.3)';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < historyPoints; i++) {
      const x = (i / (historyPoints - 1)) * width;
      const val = throttleHistory[i]; // 0 - 100
      const y = height - (val / 100) * (height - 20) - 10;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Draw RPM History Line (Subtle White)
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1.75;
    for (let i = 0; i < historyPoints; i++) {
      const x = (i / (historyPoints - 1)) * width;
      const val = (rpmHistory[i] - 4000) / (9000 - 4000); // normalized 0-1
      const y = height - val * (height - 30) - 15;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Draw Speed History Line (Ferrari Rosso Corsa Glow)
    ctx.beginPath();
    ctx.strokeStyle = '#ef1a2d';
    ctx.lineWidth = 2.5;
    ctx.shadowBlur = 6;
    ctx.shadowColor = '#ef1a2d';
    for (let i = 0; i < historyPoints; i++) {
      const x = (i / (historyPoints - 1)) * width;
      const val = (speedHistory[i] - 280) / (350 - 280); // normalized 0-1
      const y = height - val * (height - 30) - 15;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    
    // Reset shadow values for next draw
    ctx.shadowBlur = 0;
    
    // Label Overlay info
    ctx.font = '9px Space Grotesk, sans-serif';
    ctx.fillStyle = '#ef1a2d';
    ctx.fillText('SPEED [RED]', 10, 15);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('RPM [WHT]', 85, 15);
    ctx.fillStyle = 'rgba(142, 142, 147, 0.6)';
    ctx.fillText('THROTTLE [GRY]', 150, 15);
    
    requestAnimationFrame(draw);
  }
  
  draw();
}

// Hover/Click interactive actions
function setupUIInteractions() {
  // General buttons sound feedback
  const buttons = document.querySelectorAll('button, a.btn-cyber, .footer-links a');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      synth.playInteractionChirp();
    });
    btn.addEventListener('mouseenter', () => {
      if (btn.id !== 'ignition-btn') {
        synth.playPartnerGlitch();
      }
    });
  });
  
  // Custom Widget Interactions: Hover rev engine
  const cyberCards = document.querySelectorAll('.cyber-card');
  cyberCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      synth.revEngine(125, 0.5);
      
      const title = card.querySelector('.widget-title');
      if (title) {
        triggerVisualGlitch(title);
      }
    });
  });
  
  // Luxury partner list cards sound feedback
  const luxuryCards = document.querySelectorAll('.luxury-partner-card');
  luxuryCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
      synth.playPartnerGlitch();
      const pLogo = card.querySelector('.partner-logo-placeholder');
      if (pLogo) triggerVisualGlitch(pLogo);
    });
  });
  
  // Interactive Custom Form submit handling
  const form = document.getElementById('cyber-sponsorship-form');
  const formStatus = document.getElementById('form-submit-status');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      synth.playInteractionChirp();
      setTimeout(() => {
        synth.revEngine(190, 1.0); // play smooth premium acceleration sound for success!
        if (formStatus) {
          formStatus.textContent = 'TRANSMISSION SENT SUCCESSFULLY. SCUDERIA COMMUNICATIONS TEAM WILL CONTACT YOU.';
          formStatus.style.color = 'var(--ferrari-red)';
          formStatus.classList.add('glitch-flash');
        }
        form.reset();
      }, 500);
    });
  }
}

// Small utility to animate glow pulse class
function triggerVisualGlitch(element) {
  if (!element) return;
  element.classList.add('glitch-flash');
  setTimeout(() => {
    element.classList.remove('glitch-flash');
  }, 300);
}

// Interactive Dashboard drag-and-drop customizer
function setupDragAndDrop() {
  const cards = document.querySelectorAll('.cyber-card[draggable="true"]');
  let dragSrcEl = null;

  cards.forEach(card => {
    card.addEventListener('dragstart', (e) => {
      dragSrcEl = card;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', card.innerHTML);
      card.style.opacity = '0.3';
      synth.playInteractionChirp();
    });

    card.addEventListener('dragover', (e) => {
      if (e.preventDefault) {
        e.preventDefault();
      }
      e.dataTransfer.dropEffect = 'move';
      return false;
    });

    card.addEventListener('dragenter', () => {
      card.classList.add('drag-over');
    });

    card.addEventListener('dragleave', () => {
      card.classList.remove('drag-over');
    });

    card.addEventListener('drop', (e) => {
      if (e.stopPropagation) {
        e.stopPropagation();
      }
      
      if (dragSrcEl !== card) {
        // Swap their relative positions in DOM
        const parent = card.parentNode;
        const dragSrcNext = dragSrcEl.nextSibling === card ? dragSrcEl : dragSrcEl.nextSibling;
        
        if (card.nextSibling === dragSrcEl) {
          parent.insertBefore(dragSrcEl, card);
        } else {
          parent.insertBefore(dragSrcEl, card.nextSibling);
          parent.insertBefore(card, dragSrcNext);
        }
        
        synth.playPartnerGlitch();
        synth.revEngine(140, 0.4);
      }
      return false;
    });

    card.addEventListener('dragend', () => {
      card.style.opacity = '1';
      cards.forEach(c => c.classList.remove('drag-over'));
    });
  });
}
