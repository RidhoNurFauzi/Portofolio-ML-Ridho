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