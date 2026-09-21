# Kampklar 🎖️

Personlig treningsspill. Åpne `index.html` i nettleseren — ingen installasjon.

## Hva det gjør
- Viser **dagens økt**, generert ut fra hvor langt du er i programmet og hvilken form du er i.
- Du huker av øvelsene du har gjort → **XP**, **nivå**, **militærgrad** og **streak**.
- Følger framgangen mot målene: pull-ups **5 → 12** og 3000 m **13:50 → 12:00**.
- Hver 4. uke er deload, og søndagen i deload-uka er **testdag**. Registrer resultatet, så justerer programmet seg selv.

## Programmet
Bygget på testen fra 11.06.2026: styrke 7,67/9 (medisinball og stille lengde er 9/9 — de vedlikeholdes),
utholdenhet 5/9 og pull-ups 5/9. Det er derfor **trekk og løping** som får mest plass.

| Dag | Økt |
|---|---|
| Man | Trekk & kjerne |
| Tir | Fartsøkt (800 m-intervall) |
| Ons | Press & bein + eksplosivt |
| Tor | Rolig langtur + mobilitet |
| Fre | Pull-up stige |
| Lør | Terskel |
| Søn | Restitusjon |

Faser: Grunnmur (uke 1–4) → Oppbygging (5–12) → Press (13–20) → Skarp (21+). Hver 4. uke deload.

## Daglig rutine
Claude oppdaterer `data.js` kl. 14:00 og sender påminnelse kl. 16:00 med dagens økter og nivåstatus.
Trykk **Eksporter dagbok** og lim inn koden i chatten — da ser Claude hva du faktisk har gjort,
og skrur opp belastningen deretter.

## Filer
- `index.html` — UI
- `style.css` — utseende
- `data.js` — profil, mål, arkiv (Claude oppdaterer denne)
- `program.js` — generator for dagens økt
- `app.js` — XP, nivå, streak, lagring (localStorage)
