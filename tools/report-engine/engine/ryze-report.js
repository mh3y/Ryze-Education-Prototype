/* RYZE PROGRESS REPORT — shared render engine. Reads global REPORT. */
/* ---------- tiny helpers ---------- */
const $ = (t, cls, html) => { const e=document.createElement(t); if(cls)e.className=cls; if(html!=null)e.innerHTML=html; return e; };
const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
const firstName = full => String(full).trim().split(/\s+/)[0] || full;

function avg(nums){ return nums.length ? nums.reduce((a,b)=>a+b,0)/nums.length : 0; }
// Delivered lessons = everything except cancelled or rescheduled. Averages NEVER include skipped weeks.
function isSkipped(l){ return l.cancelled || l.rescheduled; }
function delivered(R){ return R.lessons.filter(l=>!isSkipped(l)); }
function hasCancelled(R){ return R.lessons.some(l=>isSkipped(l)); }
function metricAverages(R){
  const out={}; const ds=delivered(R);
  R.metrics.forEach(m=> out[m]=avg(ds.map(l=>l.ratings[m])) );
  return out;
}
function completionAverage(R){ const ds=delivered(R); return Math.round(avg(ds.map(l=>l.completion))); }
function noteFor(a){
  if(a>=4.6) return 'Excellent';
  if(a>=4.2) return 'Strong';
  if(a>=3.8) return 'Consistent';
  if(a>=3.4) return 'Building';
  if(a>=2.8) return 'Developing';
  return 'Needs support';
}
// Rating colour system: 1=muted red → 5=deep green, premium palette
const RATING_BG = ['','#B85C4F','#D7833F','#D4AF45','#7F936D','#2F6B54'];
const RATING_FG = ['','#FCFAF5','#FCFAF5','#0F2236','#FCFAF5','#FCFAF5'];
function ratingCell(v){ return `background:${RATING_BG[v]||'#E8DFC8'};color:${RATING_FG[v]||'#0F2236'}`; }
function tutorDisplay(name){ const p=name.trim().split(/\s+/); return p.length>1 ? p[0]+' '+p[p.length-1][0] : name; }
function emphasise(str){ return esc(str).replace(/\{([^}]+)\}/g, '<em>$1</em>'); }
function cancelledNote(R){
  const rs = R.lessons.filter(l=>l.rescheduled).map(l=>l.week).sort((a,b)=>a-b);
  const cn = R.lessons.filter(l=>l.cancelled).map(l=>l.week).sort((a,b)=>a-b);
  const parts=[];
  if(rs.length) parts.push(rs.length===1?`Week ${rs[0]} rescheduled`:`Weeks ${rs.join(', ')} rescheduled`);
  if(cn.length) parts.push(cn.length===1?`Week ${cn[0]} cancelled`:`Weeks ${cn.join(', ')} cancelled`);
  if(!parts.length) return '';
  return parts.join('; ')+' — excluded from averages.';
}

/* ---------- shared chrome ---------- */
function runhead(R, secNum, title, muted){
  return `<header class="runhead">
    <div class="loc"><span class="sec-num">${secNum}</span><b>${esc(title)}</b>${muted?`<span class="muted">· ${esc(muted)}</span>`:''}</div>
    <div class="brand">${esc(R.student.toUpperCase())} · ${esc(R.period.stamp)}</div>
  </header>`;
}
function runfoot(R){
  return `<footer class="runfoot">
    <span class="id">${esc(R.id)}</span>
    <span class="pg" data-pg></span>
    <span class="id">RYZE EDUCATION</span>
  </footer>`;
}
function newPage(label){
  const p=$('article','page'); p.setAttribute('data-screen-label', label);
  const inner=$('div','page-inner'); p.appendChild(inner);
  return {page:p, inner};
}

/* ---------- COVER ---------- */
function renderCover(R){
  const {page, inner} = newPage('01 Cover');
  page.classList.add('cover');
  const name = R.student;
  const lenClass = name.length>26 ? 'len-xl' : name.length>18 ? 'len-l' : name.length>13 ? 'len-m' : '';
  inner.innerHTML = `
    <div class="cover-grid">
      <header class="cover-top">
        <div class="brand-lockup">
          <img class="brand-icon" src="${R.brand.icon}" alt="" />
          <span class="brand-name">${esc(R.brand.name)}<span class="brand-sub">${esc(R.brand.sub)}</span></span>
        </div>
        <div class="stamp">PROGRESS REPORT · <b>${esc(R.period.stamp)}</b></div>
      </header>
      <section class="cover-hero">
        <div class="kicker">${esc(R.courseLine)} · ${esc(R.period.label)}</div>
        <hr class="kicker-rule">
        <div class="report-type">${esc(R.reportType)} for</div>
        <h1 class="${lenClass}">${esc(name)}.</h1>
        <div class="sub">This report summarises ${esc(name.split(' ')[0])}'s progress across ${numberWord(delivered(R).length)} lessons this term, including ${esc(R.metrics.map(m=>m.toLowerCase()).join(', ').replace(/, ([^,]*)$/,' and $1'))}, and focus areas for the weeks ahead.</div>
        <hr class="sub-rule">
        <div class="prepared">Prepared for parents and guardians.</div>
      </section>
      <section class="cover-meta">
        <div><div class="lbl">Student</div><div class="v">${esc(R.student)}</div></div>
        <div><div class="lbl">Course</div><div class="v">${esc(R.course)}</div></div>
        <div><div class="lbl">Tutor</div><div class="v">${esc(tutorDisplay(R.tutor))}</div></div>
        <div><div class="lbl">Report period</div><div class="v mono">${esc(R.period.metaTerm)}<br>${esc(R.period.metaWeeks)}</div></div>
      </section>
    </div>`;
  return page;
}
function numberWord(n){ return ['zero','one','two','three','four','five','six','seven','eight','nine','ten','eleven','twelve'][n] || String(n); }

/* ---------- SNAPSHOT ---------- */
function renderSnapshot(R){
  const {page, inner} = newPage('02 Snapshot');
  const avgs = metricAverages(R);
  const dialsHtml = R.metrics.map(m=>{
    const a=avgs[m];
    return dialSvg(a) + `<div class="d-val">${a.toFixed(1)}<em>/5</em></div><div class="d-lbl">${esc(m)}</div><div class="d-note">${noteFor(a)}</div>`;
  });
  inner.innerHTML = `
    ${runhead(R,'01','Snapshot','Overview')}
    <div class="body">
      <div class="panel-h"><span class="num">01.1</span>Overall summary</div>
      <h2 class="headline">${emphasise(R.headline)}</h2>
      <p class="summary-lede">${esc(R.summary)}</p>
      <div class="dials" id="dials" style="grid-template-columns:repeat(${R.metrics.length},1fr)">
        ${R.metrics.map((m,i)=>`<div class="dial">${dialsHtml[i]}</div>`).join('')}
      </div>
      <div class="snap-2col">
        <div class="trend-card">
          <span class="t-tag"><i></i>Growth area</span>
          <h3>${esc(R.growthMetric)}, week by week</h3>
          <p>${esc(R.growthNote)}</p>
          <div class="trend-legend">
            <span><i style="border-top-color:var(--accent)"></i>${esc(R.growthMetric)}</span>
          </div>
          ${hasCancelled(R)?`<div class="trend-note">${esc(cancelledNote(R))}</div>`:''}
          <div class="trend-chart"><svg id="trend"></svg></div>
        </div>
        <div class="qual">
          <div class="qbox strength">
            <div class="qh"><i></i>Key strengths</div>
            <ul>${R.strengths.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>
          </div>
          <div class="qbox focus">
            <div class="qh"><i></i>Focus areas</div>
            <ul>${R.focus.map(s=>`<li>${esc(s)}</li>`).join('')}</ul>
          </div>
        </div>
      </div>
    </div>
    ${runfoot(R)}`;
  return page;
}
function dialSvg(val){
  const R=26, C=2*Math.PI*R, frac=Math.max(0,Math.min(1,val/5));
  const col = RATING_BG[Math.floor(val)] || RATING_BG[1];
  const off = C*(1-frac);
  return `<svg width="64" height="64" viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="${R}" fill="none" stroke="#E8DFC8" stroke-width="5"/>
    <circle cx="32" cy="32" r="${R}" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="butt"
            stroke-dasharray="${C.toFixed(2)}" stroke-dashoffset="${off.toFixed(2)}" transform="rotate(-90 32 32)"/>
  </svg>`;
}

/* ---------- LESSON CARD ---------- */
function lessonCard(R, l){
  // Rescheduled week — different label from cancelled, same exclusion logic.
  if(l.rescheduled){
    const card=$('article','lesson rescheduled');
    card.innerHTML = `
      <div class="resched-main">
        <span class="l-wk">${l.week===1?'WK':'WK '}${String(l.week).padStart(2,'0')}</span>
        <div class="resched-heading">Lesson Rescheduled</div>
        <span class="resched-badge">Special Schedule</span>
        <p class="resched-msg">${l.rescheduledTo?`This week's class has been moved to ${esc(l.rescheduledTo)}.`:esc(l.summary||'')}</p>
        <p class="resched-note">Excluded from progress averages until the rescheduled lesson is completed.</p>
      </div>`;
    return card;
  }
  // Cancelled week — muted, no scores, no completion, excluded from averages.
  if(l.cancelled){
    const card=$('article','lesson cancelled');
    card.innerHTML = `
      <div class="l-main">
        <div class="l-top">
          <span class="l-wk">WK ${String(l.week).padStart(2,'0')}</span>
          <span class="l-topic">Lesson Cancelled</span>
          <span class="l-cancel-tag">No lesson this week</span>
        </div>
        ${l.date?`<div class="l-meta"><span>${esc(l.date)}</span></div>`:''}
        <p>${esc(l.summary || 'No lesson took place this week. This week has been excluded from progress averages.')}</p>
      </div>
      <div class="empty-right"></div>`;
    return card;
  }
  const card=$('article','lesson');
  const ratings = R.metrics.map(m=>{
    const v=l.ratings[m];
    const pipCol = RATING_BG[v] || '#0F2236';
    let pips=''; for(let k=1;k<=5;k++) pips+=`<i class="${k<=v?'on':'off'}"${k<=v?` style="background:${pipCol}"`:''}></i>`;
    return `<div class="rating">
      <span class="r-label">${esc(m)}</span>
      <span class="r-right">
        <span class="pips">${pips}</span>
        <span class="r-val"><b>${v}</b>/5</span>
      </span>
    </div>`;
  }).join('');
  card.innerHTML = `
    <div class="l-main">
      <div class="l-top">
        <span class="l-wk">WK ${String(l.week).padStart(2,'0')}</span>
        <span class="l-topic">${esc(l.topic)}</span>
        ${l.ref?`<span class="l-ref">${esc(l.ref)}</span>`:''}
      </div>
      <div class="l-meta"><span>${esc(l.date)}</span><span class="mk">Completion <b>${l.completion}%</b></span></div>
      <p>${esc(l.summary)}</p>
    </div>
    <div class="l-ratings">${ratings}</div>`;
  return card;
}

/* ---------- LESSON PAGES (auto-paginated) ---------- */
function buildLessonPages(R, root){
  const total = R.lessons.length;
  const dn = delivered(R).length;
  const weeksLabel = `${numberWord(dn)} lesson${dn===1?'':'s'} · ${R.period.label.replace(/^.*·\s*/,'')}`;
  const pages=[];
  let idx=0;
  while(idx < total){
    const first = pages.length===0;
    const {page, inner} = newPage(`Lesson by lesson ${pages.length+1}`);
    inner.innerHTML = `
      ${runhead(R,'02','Lesson by lesson','Weeks 1–6')}
      <div class="body">
        <div class="panel-h"><span class="num">02</span>${first?'What happened in each lesson':'What happened in each lesson — continued'}</div>
        <div class="lessons"></div>
      </div>
      ${runfoot(R)}`;
    root.appendChild(page);                 // must be in DOM to measure
    const container = inner.querySelector('.lessons');
    let placed=0;
    while(idx < total){
      const card = lessonCard(R, R.lessons[idx]);
      container.appendChild(card);
      const overflow = container.scrollHeight > container.clientHeight + 1;
      if(overflow && placed>0){ container.removeChild(card); break; }
      placed++; idx++;
    }
    pages.push(page);
  }
  // Avoid a lonely final lesson page: pull one card down for a tidier split.
  if(pages.length>=2){
    const last=pages[pages.length-1].querySelector('.lessons');
    const prev=pages[pages.length-2].querySelector('.lessons');
    if(last.querySelectorAll('.lesson').length===1 && prev.querySelectorAll('.lesson').length>=3){
      last.insertBefore(prev.lastElementChild, last.firstElementChild);
    }
  }
  return pages;
}

/* ---------- FINAL: matrix + comment ---------- */
function renderFinal(R){
  const {page, inner} = newPage('Ratings & comment');
  const avgs = metricAverages(R);
  const head = ['Lesson', ...R.metrics, 'Completion'];
  const colW = '';
  const rows = R.lessons.map(l=>{
    if(isSkipped(l)){
      const dash = R.metrics.map(()=>`<td><div class="cell cell-cancel">—</div></td>`).join('');
      const status = l.rescheduled ? 'Rescheduled — excluded from averages' : 'Cancelled — excluded from averages';
      return `<tr class="row-cancel"><td>Week ${l.week}<span class="topic">${status}</span></td>${dash}<td><div class="cell cell-cancel">—</div></td></tr>`;
    }
    const cells = R.metrics.map(m=>{
      const v=l.ratings[m];
      return `<td><div class="cell" style="${ratingCell(v)}">${v}<span style="opacity:.6;font-size:7pt">/5</span></div></td>`;
    }).join('');
    return `<tr><td>Week ${l.week}<span class="topic">${esc(l.topic)}</span></td>${cells}<td><div class="cell" style="color:var(--ink-2)">${l.completion}%</div></td></tr>`;
  }).join('');
  const footAvgs = R.metrics.map(m=>`<td><span class="avg">${avgs[m].toFixed(1)}</span></td>`).join('');

  inner.innerHTML = `
    ${runhead(R,'03','Ratings & comment for parents')}
    <div class="body">
      <div class="panel-h"><span class="num">03.1</span>Ratings at a glance</div>
      <div class="matrix-wrap">
        <table class="matrix">
          <colgroup><col class="c-lesson">${R.metrics.map(()=>'<col>').join('')}<col></colgroup>
          <thead><tr>${head.map((h,i)=>`<th>${esc(h)}</th>`).join('')}</tr></thead>
          <tbody>${rows}</tbody>
          <tfoot><tr><td>Average</td>${footAvgs}<td><span class="avg">${completionAverage(R)}%</span></td></tr></tfoot>
        </table>
        <div class="matrix-scale">
          <span style="font-weight:600;color:var(--ink-2)">Scale</span>
          <span class="sc"><i style="background:var(--rating-1)"></i>1 · needs significant support</span>
          <span class="sc"><i style="background:var(--rating-2)"></i>2 · needs support</span>
          <span class="sc"><i style="background:var(--rating-3)"></i>3 · developing</span>
          <span class="sc"><i style="background:var(--rating-4)"></i>4 · proficient</span>
          <span class="sc"><i style="background:var(--rating-5)"></i>5 · excellent</span>
        </div>
      </div>
      <div class="parent-comment">
        <div class="pc-h">03.2 &nbsp; Overall comment</div>
        <p class="lead">${esc(R.comment.lead)}</p>
        ${R.comment.paras.map(p=>`<p>${esc(p)}</p>`).join('')}
      </div>
    </div>
    <div class="signoff">
      <div class="sig-prepared-block"></div>
      <div class="nextsteps"><b>Next report</b>${esc(R.nextReport)}</div>
    </div>
    ${runfoot(R)}`;
  return page;
}

/* ---------- TREND CHART (drawn to measured px → no distortion) ---------- */
function drawTrend(R){
  const svg = document.getElementById('trend');
  if(!svg) return;
  const box = svg.parentElement;
  const W = Math.max(220, box.clientWidth), H = Math.max(110, box.clientHeight);
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.setAttribute('width', W); svg.setAttribute('height', H);

  const padL=28, padR=14, padT=14, padB=32;
  const plotW = W-padL-padR, plotH = H-padT-padB;

  // X-axis is the lesson SEQUENCE (evenly spaced) — robust to any cadence,
  // including multiple lessons in one week. Missing weeks read from the
  // label sequence (e.g. W2 → W4 signals W3 was skipped).
  const n = R.lessons.length;
  const lastI = Math.max(1, n-1);

  // Fixed 1–5 scale — NEVER auto-scale to observed values.
  const yMin=1, yMax=5;

  const x = i => n===1 ? padL+plotW/2 : padL + (i/lastI)*plotW;
  const y = v => padT + (yMax-v)/(yMax-yMin)*plotH;
  const baseY = H - padB;
  const yLab = H - 14;                  // week-number baseline (aligned for every column)

  let g='';
  // gridlines + y labels
  for(let gv=yMin; gv<=yMax; gv++){
    const yy=y(gv);
    g+=`<line x1="${padL}" y1="${yy.toFixed(1)}" x2="${W-padR}" y2="${yy.toFixed(1)}" stroke="#E8DFC8" stroke-width="1"/>`;
    g+=`<text x="${padL-7}" y="${(yy+3).toFixed(1)}" text-anchor="end" font-family="JetBrains Mono, monospace" font-size="9" fill="#6B6358">${gv}</text>`;
  }
  // cancelled-week columns — faint dashed vertical marker (behind the lines)
  R.lessons.forEach((l,i)=>{
    if(!isSkipped(l)) return;
    g+=`<line x1="${x(i).toFixed(1)}" y1="${padT}" x2="${x(i).toFixed(1)}" y2="${baseY.toFixed(1)}" stroke="#D9CFB8" stroke-width="1" stroke-dasharray="2 3"/>`;
  });
  // break a series into segments around cancelled weeks → the line never crosses a gap
  const segsFor = vf => {
    const segs=[]; let cur=[];
    R.lessons.forEach((l,i)=>{ if(isSkipped(l)){ if(cur.length){segs.push(cur);cur=[];} return;} cur.push({x:x(i),y:y(vf(l))}); });
    if(cur.length) segs.push(cur); return segs;
  };
  const ptsStr = seg => seg.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  // context metrics (faint), segmented
  R.metrics.filter(m=>m!==R.growthMetric).forEach(m=>{
    segsFor(l=>l.ratings[m]).forEach(seg=>{
      if(seg.length>=2) g+=`<polyline points="${ptsStr(seg)}" fill="none" stroke="#C9BFAE" stroke-width="1.4" stroke-linejoin="round" opacity="0.9"/>`;
      else if(seg.length===1) g+=`<circle cx="${seg[0].x.toFixed(1)}" cy="${seg[0].y.toFixed(1)}" r="1.6" fill="#C9BFAE"/>`;
    });
  });
  // hero metric, segmented — NO area fill (fill would mislead about baseline)
  const hero=R.growthMetric;
  segsFor(l=>l.ratings[hero]).forEach(seg=>{
    g+=`<polyline points="${ptsStr(seg)}" fill="none" stroke="#B7522F" stroke-width="2.2" stroke-linejoin="round"/>`;
  });
  // points + x-labels (cancelled → muted label + 'cancelled', no point)
  const everyOther = n > 8;
  let prevWk=null;
  R.lessons.forEach((l,i)=>{
    const xc=x(i);
    if(isSkipped(l)){
      const ann=l.rescheduled?'reschd.':'cancelled';
      g+=`<text x="${xc.toFixed(1)}" y="${yLab}" text-anchor="middle" font-family="Inter Tight, sans-serif" font-size="9" fill="#B0A894" letter-spacing=".02em">W${l.week}</text>`;
      g+=`<text x="${xc.toFixed(1)}" y="${(H-5).toFixed(1)}" text-anchor="middle" font-family="Inter Tight, sans-serif" font-size="6.5" fill="#B0A894" letter-spacing=".06em">${ann}</text>`;
      prevWk=l.week; return;
    }
    const v=l.ratings[hero];
    g+=`<circle cx="${xc.toFixed(1)}" cy="${y(v).toFixed(1)}" r="4" fill="${RATING_BG[v]||'#B7522F'}" stroke="#FCFAF5" stroke-width="1.5"/>`;
    const dup=(l.week===prevWk);
    const showLabel=!dup && (!everyOther || i%2===0 || i===n-1);
    if(showLabel) g+=`<text x="${xc.toFixed(1)}" y="${yLab}" text-anchor="middle" font-family="Inter Tight, sans-serif" font-size="9" fill="#6B6358" letter-spacing=".02em">W${l.week}</text>`;
    prevWk=l.week;
  });
  svg.innerHTML = g;
}

/* ---------- page numbering + pager ---------- */
function numberPages(root){
  const pages=[...root.querySelectorAll('.page')];
  const total=pages.length;
  pages.forEach((p,i)=>{
    const pg=p.querySelector('[data-pg]');
    if(pg) pg.innerHTML = `${String(i+1).padStart(2,'0')} <em>/</em> ${String(total).padStart(2,'0')}`;
  });
  // pager nav
  const pager=document.getElementById('pager');
  pages.forEach((p,i)=>{
    const a=$('a',null,`${i+1} &nbsp;${p.getAttribute('data-screen-label')||('Page '+(i+1))}`);
    a.href='#'; a.addEventListener('click',e=>{e.preventDefault();p.scrollIntoView({block:'start'});});
    pager.appendChild(a);
  });
  pager.appendChild($('small',null,'Print → A4, margins None → Save as PDF'));
}

/* ---------- orchestrate ---------- */
function render(R){
  const root=document.getElementById('report-root');
  root.innerHTML='';
  root.appendChild(renderCover(R));
  root.appendChild(renderSnapshot(R));
  buildLessonPages(R, root);      // appends its own pages, measured live
  root.appendChild(renderFinal(R));
  drawTrend(R);
  numberPages(root);
  // redraw chart on resize so it never distorts (uses measured px)
  let rt; window.addEventListener('resize', ()=>{ clearTimeout(rt); rt=setTimeout(()=>drawTrend(R), 150); });
}

(function boot(){
  const go = ()=>{
    render(REPORT);
    // Append ?print=1 to the URL to auto-open the print dialog once ready.
    if(/[?&]print=1/.test(location.search)){
      setTimeout(()=>window.print(), 400);
    }
  };
  if(document.fonts && document.fonts.ready){ document.fonts.ready.then(go); }
  else { window.addEventListener('load', go); }
})();
