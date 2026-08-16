const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
  setTimeout(typeLine, 350);
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
  setTimeout(()=> metricEls.forEach(animateValue), 900);
})();

/* ---------------------------------------------------------
   0c) HERO NEURAL NETWORK CANVAS — a slow, ambient graph of
   nodes and connecting edges behind the hero copy. Pauses
   entirely under prefers-reduced-motion (draws one static
   frame instead).
--------------------------------------------------------- */
(function neuralNetworkCanvas(){
  const canvas = document.getElementById('netCanvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const hero = canvas.closest('.hero');
  let nodes = [];
  let w = 0, h = 0;

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
      if(n.x < 0 || n.x > w) n.vx *= -1;
      if(n.y < 0 || n.y > h) n.vy *= -1;
    });
    draw();
    if(!prefersReducedMotion) requestAnimationFrame(step);
  }

  resize();
  draw();
  if(!prefersReducedMotion) requestAnimationFrame(step);

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

/* ---------------------------------------------------------
   1) REVEAL (fade-in) — fires as soon as a section starts
   entering the viewport. Independent of section height, so
   tall sections (e.g. Projects with many cards) never get
   stuck at opacity:0 the way they did with a high area-based
   threshold.
--------------------------------------------------------- */
const revealObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('in');
      revealObserver.unobserve(entry.target); // reveal once, then stop watching
    }
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
      navA.forEach(a=>a.classList.toggle('active', a.dataset.target === id));
      railNodes.forEach(n=>n.classList.toggle('active', n.dataset.target === id));
      if(idx > -1){
        epochEl.textContent = idx+1;
        lossEl.textContent = lossValues[idx].toFixed(2);
      }
    }
  });
}, { threshold: 0, rootMargin: '-45% 0px -45% 0px' }); // thin band near vertical center

document.querySelectorAll('section[id]').forEach(sec => spyObserver.observe(sec));

/* ---------------------------------------------------------
   3) Skill bar fill-in when Skills section is visible
--------------------------------------------------------- */
const skillObserver = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.querySelectorAll('.fill').forEach(f=>{
        f.style.width = f.dataset.w + '%';
      });
      skillObserver.unobserve(entry.target);
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