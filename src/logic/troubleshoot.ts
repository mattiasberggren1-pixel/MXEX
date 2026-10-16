export type Symptom = { id: string; end: 'Fram' | 'Bak' | 'Hela cykeln'; title: string; fixes: string[] };

// Klassisk felsökning: gör EN ändring i taget, 2 klick åt gången, och kör samma sträcka igen.
export const SYMPTOMS: Symptom[] = [
  {
    id: 'fork-bottom', end: 'Fram', title: 'Gaffeln bottnar vid landningar',
    fixes: ['Kompression 2 klick hårdare.', 'Luftgaffel: +0,1–0,2 bar.', 'Spiralgaffel: kontrollera oljenivå (+5–10 cc höjer bottningsmotståndet).', 'Bottnar fortfarande? Fjädern är för mjuk.'],
  },
  {
    id: 'fork-harsh', end: 'Fram', title: 'Gaffeln är hård/stum i små gupp och bromsgropar',
    fixes: ['Kompression 2 klick mjukare.', 'Retur 1–2 klick snabbare (gaffeln "packar" annars ihop).', 'Rengör dammskydd/tätningar och lufta gaffeln (spiral) – tryckluft byggs upp.', 'Kontrollera att gaffelbenen är parallella (lossa axel/krönskruvar och studsa).'],
  },
  {
    id: 'fork-dive', end: 'Fram', title: 'Fronten dyker vid inbromsning / in i kurvor',
    fixes: ['Kompression 2 klick hårdare.', 'Luftgaffel: +0,1 bar.', 'Dra ner gaffelrören 2 mm i kronan (höjer fronten).'],
  },
  {
    id: 'front-push', end: 'Fram', title: 'Fronten plogar / understyr i kurvor',
    fixes: ['Skjut upp gaffelrören 2–3 mm i kronan.', 'Mjukare kompression fram 2 klick, så gaffeln sätter sig.', 'Kontrollera racesagen – för mycket sag bak gör fronten lätt och ger understyrning.', 'Snabbare retur bak 1–2 klick.'],
  },
  {
    id: 'headshake', end: 'Fram', title: 'Styrskakningar i hög fart',
    fixes: ['Dra ner gaffelrören i kronan 2–3 mm (mer stabilitet).', 'Mer racesag bak (+3–5 mm) ger flackare styrvinkel.', 'Långsammare retur fram 1–2 klick.', 'Kontrollera styrlager och däcktryck.'],
  },
  {
    id: 'shock-kick', end: 'Bak', title: 'Bakänden sparkar upp på hopp och kanter',
    fixes: ['Retur bak 2 klick långsammare.', 'Lågfarts-kompression 1–2 klick mjukare.', 'Kontrollera racesagen.'],
  },
  {
    id: 'shock-bottom', end: 'Bak', title: 'Stötdämparen bottnar',
    fixes: ['Höghastighetskompression ¼ varv hårdare.', 'Kontrollera racesagen – för mycket sag = för lite förspänning eller för mjuk fjäder.', 'Bottnar trots rätt sag? Byt till hårdare fjäder.'],
  },
  {
    id: 'shock-squat', end: 'Bak', title: 'Bakänden sätter sig vid gaspådrag / dåligt grepp ut ur kurvor',
    fixes: ['Lågfarts-kompression 2 klick hårdare om den sätter sig för mycket.', 'Om den istället spinner: mjukare lågfarts-kompression och 1 klick snabbare retur.', 'Kontrollera mapp/TC – mjukare mapp hjälper greppet.'],
  },
  {
    id: 'braking-bumps', end: 'Bak', title: 'Bakänden studsar/hoppar i bromsgropar',
    fixes: ['Retur bak 2 klick snabbare (bakhjulet packar annars ihop).', 'Höghastighetskompression ¼ varv mjukare.'],
  },
  {
    id: 'whoops', end: 'Hela cykeln', title: 'Instabil i whoops',
    fixes: ['Hårdare kompression båda ändar 1–2 klick.', 'Långsammare retur bak 1 klick.', 'Mer fart hjälper – bakänden ska skumma topparna.'],
  },
  {
    id: 'pitch', end: 'Hela cykeln', title: 'Cykeln vippar/gungar fram och bak',
    fixes: ['Balans: fram och bak ska sjunka lika mycket när du står på pinnarna.', 'Långsammare retur på den ände som "gungar" mest.', 'Kontrollera att fjädrarna passar din vikt (fliken Fjädring).'],
  },
  {
    id: 'deflect', end: 'Hela cykeln', title: 'Studsar av stenar och rötter',
    fixes: ['Kompression 2–3 klick mjukare båda ändar.', 'Snabbare retur 1–2 klick.', 'Sänk däcktrycket 0,1 bar.'],
  },
];
