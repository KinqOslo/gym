/* ==========================================================
   DATA — profil, mål og arkiv.
   Denne fila oppdaterer Claude daglig kl 14:00.
   ========================================================== */

const ATLET = {
  navn: "N.B.",
  hoyde: 182,
  vekt: 80,
  alder: 21,
  start: "2026-09-21",          // dag 1 i programmet
  malDato: "2027-03-08",        // ~24 uker

  // Utgangspunkt — fra sesjon/årlig fysisk test 11.06.2026
  baseline: {
    pullups: 5,                 // hengende, karakter 5/9
    run3000: 830,               // 13:50 i sekunder, karakter 5/9
    medisinball: 5.50,          // 9/9 — maks
    stillelengde: 2.55          // 9/9 — maks
  },

  // Mål — det som løfter kombinasjonskarakteren
  mal: {
    pullups: 12,                // ~9/9
    run3000: 720               // 12:00 — ~9/9
  },

  karakterNa: { styrke: 7.67, utholdenhet: 5.0, kombinasjon: 6.35 }
};

/* Arkiv: økter Claude har bekreftet. Appen slår disse sammen
   med det som ligger lokalt i nettleseren. */
const ARKIV = {
  // "2026-09-21": { fullfort: true, xp: 120, notat: "" }
};

/* Testlogg: PR-er Claude har ført inn. */
const TESTLOGG = [
  { dato: "2026-06-11", pullups: 5, run3000: 830 }
];
