/* ==========================================================
   PROGRAM — genererer dagens økt ut fra dato + nivå.
   Deterministisk: samme dato gir alltid samme økt.
   ========================================================== */

const DAG = 86400000;

function dato2iso(d) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function iso2dato(s) {
  const [y,m,d] = s.split('-').map(Number);
  return new Date(y, m-1, d);
}
function dagerSiden(isoA, isoB) {
  return Math.round((iso2dato(isoB) - iso2dato(isoA)) / DAG);
}
function mmss(sek) {
  const m = Math.floor(sek/60), s = Math.round(sek%60);
  return `${m}:${String(s).padStart(2,'0')}`;
}

/* --- Hvor langt er vi? ------------------------------------ */
function ukeNr(iso) {
  return Math.max(0, Math.floor(dagerSiden(ATLET.start, iso) / 7));
}
function erDeload(uke) {
  return uke > 0 && uke % 4 === 3;
}
function fase(uke) {
  if (erDeload(uke)) return { navn: "Deload", kode: "deload", faktor: 0.6 };
  if (uke < 4)  return { navn: "Grunnmur",   kode: "base",  faktor: 1.00 };
  if (uke < 12) return { navn: "Oppbygging", kode: "build", faktor: 1.15 };
  if (uke < 20) return { navn: "Press",      kode: "peak",  faktor: 1.30 };
  return          { navn: "Skarp",           kode: "sharp", faktor: 1.20 };
}

/* --- Estimert form i dag ---------------------------------- */
// Siste registrerte test vinner. Ellers lineær framgang mot mål.
function sisteTest() {
  const alle = [...TESTLOGG, ...(state.tester || [])]
    .sort((a,b) => a.dato < b.dato ? -1 : 1);
  return alle[alle.length - 1];
}
function formNa(iso) {
  const t = sisteTest();
  // Framgang teller fra programstart — eller fra testen om den er nyere.
  const anker = t.dato > ATLET.start ? t.dato : ATLET.start;
  const uker = Math.max(0, dagerSiden(anker, iso) / 7);
  const tot = 24;
  const p = Math.min(1, uker / tot);
  return {
    pullups: Math.max(t.pullups, Math.round(t.pullups + (ATLET.mal.pullups - t.pullups) * p)),
    run3000: Math.min(t.run3000, Math.round(t.run3000 + (ATLET.mal.run3000 - t.run3000) * p))
  };
}
// Tempo i sek/km fra 3000m-tid
function pace(run3000) { return run3000 / 3; }

/* --- Øvelsesbyggere --------------------------------------- */
const ov = (navn, mal, xp, tag) => ({ navn, mal, xp, tag: tag || "" });

function pullBlokk(max, f) {
  const sett = Math.max(3, Math.round(5 * f));
  const reps = Math.max(2, Math.round(max * 0.6));
  if (max < 4) {
    return ov("Pull-ups — negativer", `${sett} × 4 nedsenk à 5 sek`, 25, "pull");
  }
  return ov("Pull-ups — styrkesett", `${sett} sett × ${reps} reps · 2 min pause`, 25, "pull");
}
function pullStige(max, f) {
  const topp = Math.max(2, Math.round(max * 0.6));
  const runder = Math.max(2, Math.round(3 * f));
  const liste = Array.from({length: topp}, (_, i) => i+1).join("-");
  return ov("Pull-ups — stige", `${runder} runder: ${liste} reps · 60 sek mellom rundene`, 25, "pull");
}
function intervall(p, f) {
  const antall = Math.max(4, Math.round(6 * f));
  const tid = mmss(Math.round((p - 12) * 0.8));
  return ov("Intervall 800 m", `${antall} × 800 m på ${tid} · 2 min jogg pause`, 30, "lop");
}
function terskel(p, f) {
  const min = Math.max(12, Math.round(22 * f));
  return ov("Terskeløp", `${min} min sammenhengende på ${mmss(p + 30)} /km`, 30, "lop");
}
function rolig(p, f) {
  const min = Math.max(25, Math.round(50 * f));
  return ov("Rolig langtur", `${min} min på ${mmss(p + 70)} /km · prat-tempo`, 20, "lop");
}

/* --- Ukeplan ---------------------------------------------- */
function dagsprogram(iso) {
  const uke = ukeNr(iso);
  const fa = fase(uke);
  const f = fa.faktor;
  const form = formNa(iso);
  const p = pace(form.run3000);
  const ukedag = (iso2dato(iso).getDay() + 6) % 7; // 0 = mandag

  let tittel, fokus, ovelser;

  switch (ukedag) {
    case 0:
      tittel = "Trekk & kjerne"; fokus = "pull";
      ovelser = [
        ov("Oppvarming", "8 min rolig jogg + skulderbånd", 10),
        pullBlokk(form.pullups, f),
        ov("Roing i ringer / stang", `${Math.round(4*f)} × 10 reps`, 20, "pull"),
        ov("Bicepscurl", `3 × 10 · tungt nok til at siste er tung`, 15),
        ov("Planke", `${Math.round(3*f)} × 60 sek`, 15, "kjerne"),
        ov("Hengende benløft", `3 × 10`, 15, "kjerne")
      ];
      break;
    case 1:
      tittel = "Fartsøkt"; fokus = "lop";
      ovelser = erDeload(uke) ? [
        ov("Oppvarming", "10 min rolig", 10),
        rolig(p, 0.7),
        ov("Mobilitet", "10 min hofte + ankel", 10)
      ] : [
        ov("Oppvarming", "12 min rolig + 4 stigningsløp", 10),
        intervall(p, f),
        ov("Nedjogg", "8 min", 10),
        ov("Kjerne", "3 × 45 sek sideplanke per side", 15, "kjerne")
      ];
      break;
    case 2:
      tittel = "Press & bein"; fokus = "styrke";
      ovelser = [
        ov("Oppvarming", "5 min hopptau + mobilitet", 10),
        ov("Knebøy", `${Math.round(4*f)} × 6 reps · tungt`, 25),
        ov("Markløft / rumensk", `3 × 6 reps`, 25),
        ov("Benkpress eller dips", `${Math.round(4*f)} × 8 reps`, 20),
        ov("Boksehopp", `4 × 5 · maks eksplosivt`, 20, "eksplosiv"),
        ov("Medisinballstøt", `3 × 5 kast — hold 9/9-formen`, 15, "eksplosiv")
      ];
      break;
    case 3:
      tittel = "Rolig & mobilitet"; fokus = "lop";
      ovelser = [
        rolig(p, f),
        ov("Mobilitet", "15 min hofte, hamstring, bryst", 10),
        ov("Dødheng", "3 × maks tid i stanga", 15, "pull")
      ];
      break;
    case 4:
      tittel = "Pull-up stige"; fokus = "pull";
      ovelser = [
        ov("Oppvarming", "8 min rolig + skulderbånd", 10),
        pullStige(form.pullups, f),
        ov("Face pulls / strikk", `3 × 15`, 15),
        ov("Farmers walk", `4 × 40 m tungt`, 15),
        ov("Kjerne", `3 × 15 russisk vri + 3 × 20 sek hollow`, 15, "kjerne")
      ];
      break;
    case 5:
      tittel = "Terskel"; fokus = "lop";
      ovelser = erDeload(uke) ? [
        ov("Oppvarming", "10 min rolig", 10),
        terskel(p, 0.5),
        ov("Nedjogg", "8 min", 10)
      ] : [
        ov("Oppvarming", "12 min rolig", 10),
        terskel(p, f),
        ov("Nedjogg", "8 min", 10),
        ov("Stille lengde", "5 hopp — vedlikehold 9/9", 15, "eksplosiv")
      ];
      break;
    default:
      tittel = "Restitusjon"; fokus = "hvile";
      ovelser = [
        ov("Gåtur", "40–60 min rolig", 15),
        ov("Tøy & rull", "15 min", 10),
        ov("Søvn", "Legg deg før 23:00", 10)
      ];
  }

  // Hver 4. uke: testdag på søndag i deload-uka
  const test = erDeload(uke) && ukedag === 6;
  if (test) {
    tittel = "TESTDAG";
    ovelser = [
      ov("Oppvarming", "15 min rolig + stigningsløp", 10),
      ov("Maks pull-ups", "1 sett til failure — noter tallet", 40, "test"),
      ov("3000 m på tid", "Full innsats — noter tida", 40, "test")
    ];
  }

  return {
    dato: iso, uke: uke + 1, fase: fa, tittel, fokus, test,
    form, ovelser,
    maksXp: ovelser.reduce((s,o) => s + o.xp, 0) + 50
  };
}
