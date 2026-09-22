# Kampklar 🎖️

Personlig treningsspill.

**App (anbefalt):** `kampklar.html` — én fil, publisert som artifact på claude.ai.
Lagrer i en delt database slik at treningen synkroniseres mellom iPhone og Mac,
og slik at Claude kan lese hva som faktisk er gjennomført og justere programmet.

**Lokal versjon:** `index.html` + `app.js` + `program.js` + `data.js` — samme program,
men lagrer bare i nettleseren den åpnes i.

## Hva det gjør
- Viser **dagens økt**, generert ut fra hvor langt du er i programmet og hvilken form du er i.
- Du huker av øvelsene du har gjort → **XP**, **nivå**, **militærgrad** og **streak**.
- Følger framgangen mot målene: pull-ups **5 → 12** og 3000 m **13:50 → 12:00**.
- Hver 4. uke er deload, og søndagen i deload-uka er **testdag**. Registrer resultatet, så justerer programmet seg selv.

## Målene
1. God fysisk utholdenhet
2. Sterk overkropp
3. Solide biceps og triceps

Forsvarets test er målestokken for de to første: pull-ups **5 → 12** og 3000 m **13:50 → 12:00**.
Medisinball og stille lengde står i 9/9 og vedlikeholdes bare. Armene måles ikke — de styres
på volum og progresjon i vekt, med 12–18 sett biceps og 15–22 sett triceps i uka.

| Dag | Økt |
|---|---|
| Man | Trekk & biceps |
| Tir | Fartsøkt (800 m-intervall) |
| Ons | Press & triceps |
| Tor | Rolig langtur + lett armarbeid |
| Fre | Armer & overkropp |
| Lør | Terskel + eksplosivt vedlikehold |
| Søn | Restitusjon |

Tre løpeøkter i uka er gulvet — de byttes aldri bort mot mer armarbeid.

## Illustrasjoner
Hver øvelse har en animert figur og to til fire formtips, som åpnes med avspillingsknappen
i raden. Figurene er inline SVG med to positurer, og bevegelsen mellom dem kjøres av
[anime.js](https://animejs.com) 3.2.2 fra cdnjs.

Hver øvelse har sin egen bevegelseskurve: `easeOutExpo` på medisinballkastet, `easeInOutQuad`
på knebøy, `easeInOutSine` på dødheng og tøying, `linear` på løpesteget. Enkelte ledd har
etterslep, så beina henger litt etter kroppen i stedet for at alt beveger seg i takt.

Uten nett, eller ved `prefers-reduced-motion`, vises sluttposituren stillestående.

Faser: Grunnmur (uke 1–4) → Oppbygging (5–12) → Press (13–20) → Skarp (21+). Hver 4. uke deload.

## Daglig rutine
Claude leser databasen kl. 14:00, justerer programmet etter hva som faktisk er gjennomført,
og sender push-varsel kl. 16:00 med dagens økter og nivåstatus.

Databasen har to samlinger: `dager/<ÅÅÅÅ-MM-DD>` (avhukede øvelser, XP, fullført)
og `tester/<ÅÅÅÅ-MM-DD>` (pull-ups og 3000 m fra testdagene).

## Filer
- `kampklar.html` — appen som én fil (skylagring, brukes på telefon og Mac)
- `index.html` — UI
- `style.css` — utseende
- `data.js` — profil, mål, arkiv (Claude oppdaterer denne)
- `program.js` — generator for dagens økt
- `app.js` — XP, nivå, streak, lagring (localStorage)
