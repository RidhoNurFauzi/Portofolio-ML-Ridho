const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------
   BOOT LOADER — short "initializing" sequence before the
   page is revealed. Skipped instantly under reduced motion.
--------------------------------------------------------- */
(function bootLoader(){
  const loader = document.getElementById('bootLoader');
  if(!loader) return;
  const hudFrame = document.getElementById('hudFrame');
  const hudStatus = document.getElementById('hudStatusPanel');
  const revealHud = () => {
    if(hudFrame) hudFrame.classList.add('on');
    if(hudStatus) hudStatus.classList.add('on');
  };
  if(prefersReducedMotion){
    loader.classList.add('hidden');
    document.body.classList.add('booted');
    revealHud();
    return;
  }
  const fill = loader.querySelector('.boot-bar-fill');
  requestAnimationFrame(()=>{ if(fill) fill.style.width = '100%'; });
  const finish = () => {
    loader.classList.add('hidden');
    document.body.classList.add('booted');
    revealHud();
  };
  window.addEventListener('load', () => setTimeout(finish, 950));
  // safety net in case load event is slow/blocked
  setTimeout(finish, 2600);
})();

/* ---------------------------------------------------------
   HUD STATUS PANEL — a fake but live "session hash" plus a
   real uptime clock ticking since page load, for a robotic
   telemetry-readout feel.
--------------------------------------------------------- */
(function hudStatusPanel(){
  const idEl = document.getElementById('hudSession');
  const upEl = document.getElementById('hudUptime');
  if(!idEl && !upEl) return;
  if(idEl){
    const hexChars = '0123456789ABCDEF';
    idEl.textContent = Array.from({length:6}, () => hexChars[Math.floor(Math.random()*16)]).join('');
  }
  if(upEl){
    const start = performance.now();
    const tick = () => {
      const secs = Math.floor((performance.now() - start) / 1000);
      const m = String(Math.floor(secs/60)).padStart(2,'0');
      const s = String(secs%60).padStart(2,'0');
      upEl.textContent = `${m}:${s}`;
    };
    tick();
    if(!prefersReducedMotion) setInterval(tick, 1000);
  }
})();

/* ---------------------------------------------------------
   HEX DATA STRIPS — thin columns of shifting hex bytes along
   the hero's edges, echoing a live telemetry / data feed.
   Purely decorative and skipped under reduced motion.
--------------------------------------------------------- */
(function hexRain(){
  if(prefersReducedMotion) return;
  const left = document.getElementById('hexStripL');
  const right = document.getElementById('hexStripR');
  if(!left && !right) return;
  const hexChars = '0123456789ABCDEF';
  const lineCount = 20;
  function randByte(){
    return hexChars[Math.floor(Math.random()*16)] + hexChars[Math.floor(Math.random()*16)];
  }
  function fill(el){
    let text = '';
    for(let i = 0; i < lineCount; i++){ text += randByte() + '\n'; }
    el.textContent = text;
  }
  if(left) fill(left);
  if(right) fill(right);
  setInterval(()=>{
    if(left) fill(left);
    if(right) fill(right);
  }, 1500);
})();

/* ---------------------------------------------------------
   0a) TYPEWRITER — types out each terminal line in sequence.
   Falls back to showing full text instantly if the user
   prefers reduced motion.
--------------------------------------------------------- */
(function typewriterTerminal(){
  const lines = Array.from(document.querySelectorAll('.term-line'));
  if(!lines.length) return;

  if(prefersReducedMotion){
    lines.forEach(line => { line.textContent = line.dataset.text || line.textContent; });
    const cursor = document.querySelector('.term .cursor');
    if(cursor) cursor.style.display = 'inline-block';
    return;
  }

  let i = 0;
  function typeLine(){
    if(i >= lines.length) return;
    const line = lines[i];
    const text = line.dataset.text || '';
    line.textContent = '';
    let c = 0;
    const speed = 16;
    (function tick(){
      line.textContent = text.slice(0, c);
      c++;
      if(c <= text.length){
        setTimeout(tick, speed);
      } else {
        i++;
        if(i < lines.length){
          setTimeout(typeLine, 120);
        } else {
          const cursor = document.querySelector('.term .cursor');
          if(cursor) cursor.style.display = 'inline-block';
        }
      }
    })();
  }
  setTimeout(typeLine, 1350);
})();

/* ---------------------------------------------------------
   0a-2) GLITCH / SCRAMBLE REVEAL — the hero name resolves
   from random monospace characters into itself once the
   boot loader clears, echoing a model "converging".
--------------------------------------------------------- */
(function scrambleHeroName(){
  const target = document.getElementById('scrambleName');
  if(!target) return;
  const finalHTML = target.innerHTML;
  const finalText = target.textContent;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&_/\\<>01';

  if(prefersReducedMotion){
    return;
  }

  target.classList.add('scramble-ready');
  let frame = 0;
  const totalFrames = 22;
  let interval;

  function render(){
    frame++;
    const progress = frame / totalFrames;
    const revealCount = Math.floor(finalText.length * progress);
    let out = '';
    for(let i = 0; i < finalText.length; i++){
      const ch = finalText[i];
      if(ch === ' '){ out += ' '; continue; }
      if(i < revealCount){
        out += ch;
      } else {
        out += chars[Math.floor(Math.random() * chars.length)];
      }
    }
    target.textContent = out;
    if(frame >= totalFrames){
      clearInterval(interval);
      target.innerHTML = finalHTML;
    }
  }
  setTimeout(()=>{ interval = setInterval(render, 38); }, 1650);
})();

/* ---------------------------------------------------------
   0b) COUNT-UP — animates hero metric numbers from 0 to
   their target value once the hero is on screen.
--------------------------------------------------------- */
(function countUpMetrics(){
  const metricEls = document.querySelectorAll('.metric .v[data-target]');
  if(!metricEls.length) return;

  function animateValue(el){
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    if(prefersReducedMotion){
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }
    const duration = 1100;
    const start = performance.now();
    function step(now){
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = target * eased;
      el.textContent = current.toFixed(decimals) + suffix;
      if(progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  setTimeout(()=> metricEls.forEach(animateValue), 1900);
})();

/* ---------------------------------------------------------
   0c) HERO NEURAL NETWORK CANVAS — a slow, ambient graph of
   nodes and connecting edges behind the hero copy. Nodes now
   drift toward the cursor slightly for a "reactive" feel.
   Pauses entirely under prefers-reduced-motion (draws one
   static frame instead).
--------------------------------------------------------- */
(function neuralNetworkCanvas(){
  const canvas = document.getElementById('netCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero');
  let nodes = [];
  let w = 0, h = 0;
  let mouse = { x: -9999, y: -9999, active: false };

  function resize(){
    const rect = hero.getBoundingClientRect();
    w = canvas.width = rect.width;
    h = canvas.height = rect.height;
    const count = Math.min(46, Math.floor((w * h) / 26000));
    nodes = Array.from({length: count}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      r: Math.random() * 1.6 + 1
    }));
  }

  function draw(){
    ctx.clearRect(0, 0, w, h);
    const linkDist = 130;
    for(let i = 0; i < nodes.length; i++){
      const a = nodes[i];
      for(let j = i + 1; j < nodes.length; j++){
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < linkDist){
          ctx.strokeStyle = `rgba(94,234,212,${(1 - dist / linkDist) * 0.22})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
      if(mouse.active){
        const dx = a.x - mouse.x, dy = a.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 160){
          ctx.strokeStyle = `rgba(242,166,90,${(1 - dist / 160) * 0.35})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(242,166,90,0.55)';
      ctx.fill();
    });
  }

  function step(){
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if(mouse.active){
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        if(dist < 160 && dist > 0.01){
          n.x -= (dx / dist) * 0.28;
          n.y -= (dy / dist) * 0.28;
        }
      }
      if(n.x < 0 || n.x > w) n.vx *= -1;
      if(n.y < 0 || n.y > h) n.vy *= -1;
    });
    draw();
    if(!prefersReducedMotion) requestAnimationFrame(step);
  }

  resize();
  draw();
  if(!prefersReducedMotion) requestAnimationFrame(step);

  hero.addEventListener('mousemove', (e)=>{
    const rect = hero.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;
  });
  hero.addEventListener('mouseleave', ()=>{ mouse.active = false; });

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { resize(); draw(); }, 200);
  });
})();

/* ---------------------------------------------------------
   0d) NAV LOSS SPARKLINE — draws progressively as the user
   scrolls through the whole page, echoing the epoch/loss
   ticker with a small live line chart.
--------------------------------------------------------- */
(function lossSparkline(){
  const path = document.getElementById('lossPath');
  if(!path) return;
  const length = path.getTotalLength();
  path.style.strokeDasharray = length;
  path.style.strokeDashoffset = prefersReducedMotion ? 0 : length;

  if(prefersReducedMotion) return;

  let ticking = false;
  function update(){
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    path.style.strokeDashoffset = length * (1 - fraction);
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if(!ticking){
      requestAnimationFrame(update);
      ticking = true;
    }
  }, { passive: true });
  update();
})();

/* ---------------------------------------------------------
   0e) DETECTION-BOX CONFIDENCE COUNTER — counts the fake
   "confidence score" up each time a project card is hovered,
   echoing a computer-vision inference readout.
--------------------------------------------------------- */
(function detectConfidence(){
  document.querySelectorAll('.proj-card').forEach(card => {
    const confEl = card.querySelector('.conf');
    if(!confEl) return;
    const target = parseFloat(confEl.dataset.conf);
    let animating = false;
    card.addEventListener('mouseenter', () => {
      if(animating) return;
      animating = true;
      if(prefersReducedMotion){
        confEl.textContent = target.toFixed(2);
        animating = false;
        return;
      }
      const duration = 500;
      const start = performance.now();
      function step(now){
        const progress = Math.min((now - start) / duration, 1);
        confEl.textContent = (target * progress).toFixed(2);
        if(progress < 1){
          requestAnimationFrame(step);
        } else {
          animating = false;
        }
      }
      requestAnimationFrame(step);
    });
  });
})();

/* ---------------------------------------------------------
   0f) CUSTOM CURSOR GLOW — a soft ambient light and a small
   dot that follow the pointer, growing on interactive
   elements. Desktop / fine-pointer only.
--------------------------------------------------------- */
(function cursorGlow(){
  const isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(!isFinePointer || prefersReducedMotion) return;

  const glow = document.getElementById('cursorGlow');
  const dot = document.getElementById('cursorDot');
  if(!glow || !dot) return;

  let gx = window.innerWidth/2, gy = window.innerHeight/2;
  let tx = gx, ty = gy;

  window.addEventListener('mousemove', (e)=>{
    tx = e.clientX; ty = e.clientY;
    dot.style.transform = `translate(${tx}px, ${ty}px)`;
    glow.classList.add('on'); dot.classList.add('on');
  }, { passive:true });

  document.addEventListener('mouseleave', ()=>{ glow.classList.remove('on'); dot.classList.remove('on'); });

  function raf(){
    gx += (tx - gx) * 0.12;
    gy += (ty - gy) * 0.12;
    glow.style.transform = `translate(${gx}px, ${gy}px)`;
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  const hoverables = 'a, button, .btn, .cert-card, .proj-card, .pub-item, input, textarea, .tag, .social-link';
  document.querySelectorAll(hoverables).forEach(el=>{
    el.addEventListener('mouseenter', ()=> dot.classList.add('hovering'));
    el.addEventListener('mouseleave', ()=> dot.classList.remove('hovering'));
  });
})();

/* ---------------------------------------------------------
   0g) MAGNETIC BUTTONS — CTA buttons subtly pull toward the
   cursor within a small radius, and snap back on leave.
--------------------------------------------------------- */
(function magneticButtons(){
  if(prefersReducedMotion) return;
  const isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(!isFinePointer) return;

  document.querySelectorAll('.btn').forEach(btn=>{
    let raf = null;
    btn.addEventListener('mousemove', (e)=>{
      const rect = btn.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width/2;
      const relY = e.clientY - rect.top - rect.height/2;
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        btn.style.transform = `translate(${relX*0.22}px, ${relY*0.32}px)`;
      });
    });
    btn.addEventListener('mouseleave', ()=>{
      if(raf) cancelAnimationFrame(raf);
      btn.style.transform = '';
    });
  });
})();

/* ---------------------------------------------------------
   0h) 3D TILT — project & certification cards tilt toward
   the cursor and show a soft glare, then relax back flat.
--------------------------------------------------------- */
(function tiltCards(){
  if(prefersReducedMotion) return;
  const isFinePointer = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if(!isFinePointer) return;

  document.querySelectorAll('.proj-card, .cert-card').forEach(card=>{
    const glare = document.createElement('div');
    glare.className = 'tilt-glare';
    card.style.position = card.style.position || 'relative';
    card.appendChild(glare);

    const maxTilt = card.classList.contains('proj-card') ? 6 : 4;
    let raf = null;

    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rotY = (px - 0.5) * maxTilt * 2;
      const rotX = (0.5 - py) * maxTilt * 2;
      if(raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(()=>{
        card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-3px)`;
        glare.style.setProperty('--gx', (px*100) + '%');
        glare.style.setProperty('--gy', (py*100) + '%');
      });
    });
    card.addEventListener('mouseleave', ()=>{
      if(raf) cancelAnimationFrame(raf);
      card.style.transform = '';
    });
  });
})();

/* ---------------------------------------------------------
   0i) SCROLL PROGRESS BAR — thin bar under the nav showing
   how far through the page the reader has scrolled.
--------------------------------------------------------- */
(function scrollProgress(){
  const bar = document.getElementById('scrollProgress');
  if(!bar) return;
  let ticking = false;
  function update(){
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const fraction = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;
    bar.style.width = (fraction * 100) + '%';
    ticking = false;
  }
  window.addEventListener('scroll', ()=>{
    if(!ticking){ requestAnimationFrame(update); ticking = true; }
  }, { passive:true });
  update();
})();

/* ---------------------------------------------------------
   0j) BACK TO TOP — small floating button appears after the
   hero and scrolls smoothly back up.
--------------------------------------------------------- */
(function backToTop(){
  const btn = document.getElementById('backToTop');
  if(!btn) return;
  window.addEventListener('scroll', ()=>{
    btn.classList.toggle('show', window.scrollY > window.innerHeight * 0.9);
  }, { passive:true });
  btn.addEventListener('click', ()=>{
    window.scrollTo({ top:0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });
})();

function openPubModal(pdf, link){
  document.getElementById('pubModalPdf').href = pdf;
  document.getElementById('pubModalLink').href = link;
  document.getElementById('pubModal').classList.add('open');
}
function closePubModal(){
  document.getElementById('pubModal').classList.remove('open');
}
document.getElementById('pubModal').addEventListener('click', function(e){
  if(e.target === this) closePubModal();
});

// contact form (formspree)
const form = document.getElementById('contact-form');
const status = document.getElementById('form-status');
form.addEventListener('submit', async function(e){
  e.preventDefault();
  status.textContent = 'Mengirim...';
  try{
    const res = await fetch(form.action, {
      method:'POST',
      body:new FormData(form),
      headers:{ 'Accept':'application/json' }
    });
    if(res.ok){
      status.textContent = 'Pesan terkirim. Terima kasih!';
      form.reset();
    } else {
      status.textContent = 'Gagal mengirim. Coba lagi nanti.';
    }
  }catch(err){
    status.textContent = 'Gagal mengirim. Periksa koneksi Anda.';
  }
});

const sections = ['about','skills','education','certifications','projects','publications','contact'];
const lossValues = [1.85,1.42,1.03,0.71,0.38,0.15,0.04];
const navA = document.querySelectorAll('.navlinks a');
const railNodes = document.querySelectorAll('.rail .node');
const epochEl = document.getElementById('epochNum');
const lossEl = document.getElementById('lossVal');
const navPill = document.getElementById('navPill');

function moveNavPill(link){
  if(!navPill || !link) return;
  const navlinks = document.getElementById('navlinks');
  const linkRect = link.getBoundingClientRect();
  const parentRect = navlinks.getBoundingClientRect();
  navPill.style.width = linkRect.width + 'px';
  navPill.style.transform = `translateX(${linkRect.left - parentRect.left}px)`;
  navPill.classList.add('on');
}

/* ---------------------------------------------------------
   1) REVEAL (fade-in) — fires as soon as a section starts
   entering the viewport. Independent of section height, so
   tall sections (e.g. Projects with many cards) never get
   stuck at opacity:0 the way they did with a high area-based
   threshold. Also wires up staggered-child reveal by tagging
   direct children of grid/list containers as .stagger-child.
--------------------------------------------------------- */
document.querySelectorAll('.skills-grid, .cert-grid, .proj-grid, .pub-list, .timeline, .tag-row').forEach(container=>{
  Array.from(container.children).forEach(child => child.classList.add('stagger-child'));
});

const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    // Toggle instead of one-shot: the section (and its staggered
    // children, via the .reveal.in .stagger-child CSS rule) replays
    // its entrance animation every time it re-enters the viewport.
    entry.target.classList.toggle('in', entry.isIntersecting);
  });
}, { threshold: 0, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('section.reveal').forEach(sec => revealObserver.observe(sec));

/* ---------------------------------------------------------
   2) SCROLLSPY — updates nav / rail / epoch-loss ticker.
   Uses a small threshold based on the TOP of the section
   crossing a band near the middle of the screen, so it works
   consistently regardless of how tall each section is.
--------------------------------------------------------- */
const spyObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    const id = entry.target.id;
    const idx = sections.indexOf(id);
    if(entry.isIntersecting){
      navA.forEach(a=>{
        const isActive = a.dataset.target === id;
        a.classList.toggle('active', isActive);
        if(isActive) moveNavPill(a);
      });
      railNodes.forEach(n=>n.classList.toggle('active', n.dataset.target === id));
      if(idx > -1){
        epochEl.textContent = idx+1;
        lossEl.textContent = lossValues[idx].toFixed(2);
      }
    }
  });
}, { threshold: 0, rootMargin: '-45% 0px -45% 0px' }); // thin band near vertical center

document.querySelectorAll('section[id]').forEach(sec => spyObserver.observe(sec));

window.addEventListener('resize', ()=>{
  const active = document.querySelector('.navlinks a.active');
  if(active) moveNavPill(active);
});

/* ---------------------------------------------------------
   3) Skill bar fill-in when Skills section is visible
--------------------------------------------------------- */
const skillObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    const fills = entry.target.querySelectorAll('.fill');
    if(entry.isIntersecting){
      // Force a reflow before re-applying the width so the
      // width transition re-triggers even if it was already
      // sitting at data-w% from a previous pass.
      fills.forEach(f=>{ f.style.width = '0%'; void f.offsetWidth; });
      requestAnimationFrame(()=>{
        fills.forEach(f=>{ f.style.width = f.dataset.w + '%'; });
      });
    } else {
      fills.forEach(f=>{ f.style.width = '0%'; });
    }
  });
}, { threshold: 0.2 });
const skillsSection = document.getElementById('skills');
if(skillsSection) skillObserver.observe(skillsSection);

/* ---------------------------------------------------------
   4) Rail click navigation
--------------------------------------------------------- */
railNodes.forEach(n=>{
  n.addEventListener('click', ()=>{
    document.getElementById(n.dataset.target).scrollIntoView({behavior:'smooth'});
  });
});