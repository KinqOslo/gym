/* ==========================================================
   APP — nivå, XP, streak og UI.
   ========================================================== */

const NOKKEL = "gymgame.v1";

let state = {
  xp: 0,
  dager: {},      // "2026-09-21": { gjort: [0,2,3], fullfort: true, xp: 120 }
  tester: [],     // { dato, pullups, run3000 }
  sistSett: null
};

/* --- Lagring ---------------------------------------------- */
function lastState() {
  try {
    const raw = localStorage.getItem(NOKKEL);
    if (raw) state = Object.assign(state, JSON.parse(raw));
  } catch (e) { /* ignorer */ }
  // Slå inn arkivet Claude har bekreftet
  for (const [d, v] of Object.entries(ARKIV)) {
    if (!state.dager[d]) state.dager[d] = v;
  }
  // Arkiv-oppføringer kan mangle felt — sørg for at alle dager har samme form
  for (const d of Object.keys(state.dager)) state.dager[d] = normaliser(state.dager[d]);
  regnXp();
}
function normaliser(d) {
  return {
    gjort: Array.isArray(d && d.gjort) ? d.gjort : [],
    fullfort: !!(d && d.fullfort),
    xp: Number(d && d.xp) || 0,
    notat: (d && d.notat) || ""
  };
}
function lagre() {
  try { localStorage.setItem(NOKKEL, JSON.stringify(state)); } catch (e) {}
}
function regnXp() {
  state.xp = Object.values(state.dager).reduce((s, d) => s + (d.xp || 0), 0);
}

/* --- Nivå ------------------------------------------------- */
const GRADER = [
  [1,  "Rekrutt"], [3,  "Menig"], [5,  "Visekorporal"], [8,  "Korporal"],
  [11, "Sersjant"], [15, "Oversersjant"], [20, "Stabssersjant"],
  [26, "Fenrik"], [33, "Løytnant"], [41, "Kaptein"], [50, "Major"]
];
function xpTilNivaa(n) { return 200 + (n - 1) * 100; }
function nivaaInfo(xp) {
  let n = 1, rest = xp;
  while (rest >= xpTilNivaa(n)) { rest -= xpTilNivaa(n); n++; }
  let grad = GRADER[0][1];
  for (const [lvl, navn] of GRADER) if (n >= lvl) grad = navn;
  return { nivaa: n, iNivaa: rest, trenger: xpTilNivaa(n), grad };
}

/* --- Streak ----------------------------------------------- */
function streak(iso) {
  let n = 0;
  let d = iso2dato(iso);
  // Dagens dag teller bare om den er fullført
  if (!(state.dager[dato2iso(d)] || {}).fullfort) d = new Date(d - DAG);
  while ((state.dager[dato2iso(d)] || {}).fullfort) { n++; d = new Date(d - DAG); }
  return n;
}

/* --- Rendering -------------------------------------------- */
const $ = s => document.querySelector(s);
let iDag = dato2iso(new Date());
let visning = iDag;

function tegn() {
  const pr = dagsprogram(visning);
  const dag = normaliser(state.dager[visning]);
  const info = nivaaInfo(state.xp);
  const st = streak(iDag);

  // Header
  $("#grad").textContent = info.grad;
  $("#nivaa").textContent = info.nivaa;
  $("#xp-tall").textContent = `${info.iNivaa} / ${info.trenger} XP`;
  const pct = Math.round(info.iNivaa / info.trenger * 100);
  $("#xp-fyll").style.width = pct + "%";
  $("#ring").style.background =
    `conic-gradient(var(--gull) ${pct*3.6}deg, rgba(255,255,255,.08) 0deg)`;
  $("#streak").textContent = st;
  $("#total-xp").textContent = state.xp.toLocaleString("nb-NO");

  // Dagskort
  const d = iso2dato(visning);
  const ukedager = ["Mandag","Tirsdag","Onsdag","Torsdag","Fredag","Lørdag","Søndag"];
  $("#dag-navn").textContent = ukedager[(d.getDay()+6)%7];
  $("#dag-dato").textContent = d.toLocaleDateString("nb-NO", { day:"numeric", month:"long" });
  $("#okt-tittel").textContent = pr.tittel;
  $("#okt-meta").innerHTML =
    `<span class="pill">Uke ${pr.uke}</span>` +
    `<span class="pill ${pr.fase.kode}">${pr.fase.navn}</span>` +
    (pr.test ? `<span class="pill test">Test</span>` : "");
  $("#kort").classList.toggle("ferdig", dag.fullfort);

  // Øvelser
  const ul = $("#ovelser");
  ul.innerHTML = "";
  pr.ovelser.forEach((o, i) => {
    const gjort = dag.gjort.includes(i);
    const li = document.createElement("li");
    li.className = "ovelse" + (gjort ? " gjort" : "");
    li.innerHTML = `
      <button class="hake" aria-label="Marker som gjort">${gjort ? "✓" : ""}</button>
      <div class="ov-tekst">
        <div class="ov-navn">${o.navn}</div>
        <div class="ov-mal">${o.mal}</div>
      </div>
      <div class="ov-xp">+${o.xp}</div>`;
    li.querySelector(".hake").onclick = () => veksle(i);
    ul.appendChild(li);
  });

  // Framdrift mot mål
  const form = pr.form;
  const t = sisteTest();
  $("#pu-na").textContent = t.pullups;
  $("#pu-mal").textContent = ATLET.mal.pullups;
  $("#pu-fyll").style.width =
    Math.min(100, Math.round((t.pullups - ATLET.baseline.pullups) /
      (ATLET.mal.pullups - ATLET.baseline.pullups) * 100)) + "%";
  $("#lop-na").textContent = mmss(t.run3000);
  $("#lop-mal").textContent = mmss(ATLET.mal.run3000);
  $("#lop-fyll").style.width =
    Math.min(100, Math.round((ATLET.baseline.run3000 - t.run3000) /
      (ATLET.baseline.run3000 - ATLET.mal.run3000) * 100)) + "%";
  $("#estimat").textContent =
    `Estimert form i dag: ${form.pullups} pull-ups · 3000 m på ${mmss(form.run3000)}`;

  $("#test-knapp").style.display = pr.test ? "block" : "none";

  tegnHeatmap();
  $("#nav-i-dag").style.display = visning === iDag ? "none" : "inline-block";
}

function veksle(i) {
  const pr = dagsprogram(visning);
  const dag = normaliser(state.dager[visning]);
  const idx = dag.gjort.indexOf(i);
  if (idx >= 0) dag.gjort.splice(idx, 1); else dag.gjort.push(i);

  const foerNivaa = nivaaInfo(state.xp).nivaa;

  dag.xp = dag.gjort.reduce((s, k) => s + (pr.ovelser[k] ? pr.ovelser[k].xp : 0), 0);
  dag.fullfort = dag.gjort.length === pr.ovelser.length;
  if (dag.fullfort) dag.xp += 50 + Math.min(streak(visning), 10) * 5;

  state.dager[visning] = dag;
  regnXp();
  lagre();

  const etterNivaa = nivaaInfo(state.xp).nivaa;
  tegn();
  if (etterNivaa > foerNivaa) feir(etterNivaa);
  else if (dag.fullfort) blink("Økt fullført");
}

function feir(n) {
  const info = nivaaInfo(state.xp);
  $("#feir-tekst").innerHTML = `Nivå <b>${n}</b><br><span>${info.grad}</span>`;
  $("#feiring").classList.add("vis");
  setTimeout(() => $("#feiring").classList.remove("vis"), 2600);
}
function blink(tekst) {
  const el = $("#toast");
  el.textContent = tekst;
  el.classList.add("vis");
  setTimeout(() => el.classList.remove("vis"), 1800);
}

function tegnHeatmap() {
  const box = $("#heatmap");
  box.innerHTML = "";
  const slutt = iso2dato(iDag);
  for (let i = 55; i >= 0; i--) {
    const d = new Date(slutt - i * DAG);
    const iso = dato2iso(d);
    const dag = state.dager[iso];
    const rute = document.createElement("div");
    let niv = 0;
    if (dag) {
      const n = normaliser(dag);
      niv = n.fullfort ? 3 : (n.gjort.length > 2 ? 2 : (n.gjort.length ? 1 : 0));
    }
    rute.className = "rute n" + niv + (iso === visning ? " valgt" : "");
    rute.title = iso;
    rute.onclick = () => { visning = iso; tegn(); };
    box.appendChild(rute);
  }
}

/* --- Test-registrering ------------------------------------ */
function registrerTest() {
  const pu = prompt("Maks pull-ups (antall):");
  if (pu === null) return;
  const lop = prompt("3000 m — tid som mm:ss (f.eks. 13:20):");
  if (lop === null) return;
  const [m, s] = lop.split(":").map(Number);
  state.tester.push({
    dato: visning,
    pullups: Number(pu),
    run3000: (m || 0) * 60 + (s || 0)
  });
  lagre();
  tegn();
  blink("Test registrert — programmet er justert");
}

/* --- Eksport / import ------------------------------------- */
function eksporter() {
  const tekst = JSON.stringify(state);
  navigator.clipboard?.writeText(tekst);
  $("#eksport-felt").value = tekst;
  $("#eksport-felt").style.display = "block";
  $("#eksport-felt").select();
  blink("Kopiert — lim inn i chatten til Claude");
}
function importer() {
  const t = prompt("Lim inn dagbok-koden:");
  if (!t) return;
  try {
    state = Object.assign(state, JSON.parse(t));
    for (const d of Object.keys(state.dager)) state.dager[d] = normaliser(state.dager[d]);
    if (!Array.isArray(state.tester)) state.tester = [];
    regnXp(); lagre(); tegn();
    blink("Dagbok importert");
  } catch (e) { blink("Ugyldig kode"); }
}

/* --- Oppstart --------------------------------------------- */
window.addEventListener("DOMContentLoaded", () => {
  lastState();
  $("#nav-forrige").onclick = () => { visning = dato2iso(new Date(iso2dato(visning) - DAG)); tegn(); };
  $("#nav-neste").onclick   = () => { visning = dato2iso(new Date(+iso2dato(visning) + DAG)); tegn(); };
  $("#nav-i-dag").onclick   = () => { visning = iDag; tegn(); };
  $("#test-knapp").onclick  = registrerTest;
  $("#eksport").onclick     = eksporter;
  $("#import").onclick      = importer;
  tegn();
});
