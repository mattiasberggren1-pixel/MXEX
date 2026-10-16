import { FORKS, type BikeClass, type ForkId, type Model } from '../data/bikes';

export type Skill = 'nybörjare' | 'motionär' | 'avancerad' | 'elit';
export type Discipline = 'motocross' | 'enduro' | 'supercross';
export type Terrain = 'blandat' | 'sand' | 'hårt' | 'lera' | 'sten-rötter' | 'stora-hopp';

export const SKILLS: Skill[] = ['nybörjare', 'motionär', 'avancerad', 'elit'];
export const DISCIPLINES: Discipline[] = ['motocross', 'enduro', 'supercross'];
export const TERRAINS: { id: Terrain; label: string }[] = [
  { id: 'blandat', label: 'Blandat / normal bana' },
  { id: 'sand', label: 'Sand' },
  { id: 'hårt', label: 'Hårt / torrt' },
  { id: 'lera', label: 'Lera / blött' },
  { id: 'sten-rötter', label: 'Sten & rötter' },
  { id: 'stora-hopp', label: 'Stora hopp / snabbt' },
];

// Referensförare (vikt utan utrustning) som fabriksfjädrarna ungefär är gjorda för,
// samt typiska fabriksfjädrar (gaffel N/mm per ben, stöt N/mm) för japansk länkgeometri.
const CLASS_BASE: Record<BikeClass, { ref: number; fork: number; shock: number }> = {
  '50': { ref: 25, fork: 2.0, shock: 22 },
  '65': { ref: 35, fork: 2.6, shock: 30 },
  '85': { ref: 50, fork: 3.6, shock: 40 },
  '125-2T': { ref: 68, fork: 4.1, shock: 45 },
  '250-2T': { ref: 75, fork: 4.4, shock: 48 },
  '300-2T': { ref: 75, fork: 4.2, shock: 45 },
  '250-4T': { ref: 72, fork: 4.4, shock: 50 },
  '350-4T': { ref: 75, fork: 4.5, shock: 52 },
  '450-4T': { ref: 78, fork: 4.6, shock: 55 },
  electric: { ref: 78, fork: 4.6, shock: 55 },
};

// Hur mycket fjäderhårdheten ska ändras per kg från referensvikten (andel/kg).
const SLOPE = 0.0045;

const SKILL_FACTOR: Record<Skill, number> = { nybörjare: -0.03, motionär: 0, avancerad: 0.025, elit: 0.05 };
const DISC_FACTOR: Record<Discipline, { fork: number; shock: number }> = {
  motocross: { fork: 0, shock: 0 },
  enduro: { fork: -0.05, shock: -0.03 },
  supercross: { fork: 0.08, shock: 0.06 },
};

export type Rider = { weightKg: number; skill: Skill; discipline: Discipline };

export type SpringRec = {
  ref: number;
  forkStock?: number;
  shockStock: number;
  forkRec?: number; // N/mm per ben (spiralgaffel)
  shockRec: number; // N/mm
  airStock?: number; // bar, okänt för vissa luftgafflar
  airRec?: number; // bar
  airDelta?: number; // bar jämfört med standardtrycket
  air: boolean;
  forkVerdict?: string;
  shockVerdict: string;
};

const round = (v: number, step: number) => Number((Math.round(v / step) * step).toFixed(2));
export const kg = (nmm: number) => (nmm / 9.81).toFixed(2);

function verdict(stock: number, rec: number, step: number): string {
  const diff = rec - stock;
  if (Math.abs(diff) < step * 0.75) return 'Standardfjädern passar dig.';
  const n = Math.round(Math.abs(diff) / step);
  return diff > 0 ? `Hårdare fjäder rekommenderas (${n} steg upp).` : `Mjukare fjäder rekommenderas (${n} steg ner).`;
}

export function springRec(
  model: Model,
  rider: Rider,
  fork: ForkId,
  stock: { forkSpring?: number; shockSpring?: number; airBar?: number },
): SpringRec {
  const base = CLASS_BASE[model.cls];
  const isWp = model.brand === 'KTM' || model.brand === 'Husqvarna' || model.brand === 'GasGas';
  // WP-länken har annan utväxling – fabriksfjädrarna är lägre i N/mm.
  const shockStock = stock.shockSpring ?? Math.round(base.shock * (isWp ? 0.82 : 1));
  const forkStock = stock.forkSpring ?? base.fork;
  const disc = DISC_FACTOR[rider.discipline];
  const k = (rider.weightKg - base.ref) * SLOPE + SKILL_FACTOR[rider.skill];
  const air = FORKS[fork].air;

  const shockRec = round(shockStock * (1 + k + disc.shock), 1);
  const res: SpringRec = {
    ref: base.ref,
    shockStock,
    shockRec,
    air,
    shockVerdict: verdict(shockStock, shockRec, 2),
  };

  if (air) {
    // KTM:s tabell: ca 0,5 bar per 10 kg förarvikt (≈ 5 % per 10 kg).
    const f = Math.min(0.25, Math.max(-0.2, (k + disc.fork) * 1.05));
    const airStock = stock.airBar;
    const basis = airStock ?? 10.5;
    res.airDelta = round(basis * f, 0.1);
    if (airStock != null) {
      res.airStock = airStock;
      res.airRec = round(airStock + res.airDelta, 0.1);
    }
  } else {
    res.forkStock = forkStock;
    res.forkRec = round(forkStock * (1 + k + disc.fork), 0.1);
    res.forkVerdict = verdict(forkStock, res.forkRec, 0.2);
  }
  return res;
}

// ---------------- Sag ----------------

export type SagTarget = { race: [number, number]; static: [number, number] };

export function sagTarget(model: Model): SagTarget {
  if (model.cls === '50') return { race: [60, 70], static: [15, 25] };
  if (model.cls === '65') return { race: [70, 80], static: [20, 30] };
  if (model.cls === '85') return { race: [85, 95], static: [25, 35] };
  switch (model.brand) {
    case 'Yamaha':
      return { race: [90, 100], static: [30, 40] };
    case 'KTM':
    case 'Husqvarna':
    case 'GasGas':
      return { race: [103, 108], static: [33, 40] };
    default:
      return { race: [100, 105], static: [30, 40] };
  }
}

export type SagResult = { static: number; race: number; advice: string[] };

/**
 * r1 = mått bakaxel→fast punkt med bakhjulet i luften,
 * r2 = cykeln på marken utan förare, r3 = föraren i körställning.
 */
export function analyzeSag(r1: number, r2: number, r3: number, t: SagTarget): SagResult {
  const stat = r1 - r2;
  const race = r1 - r3;
  const advice: string[] = [];
  const mid = (t.race[0] + t.race[1]) / 2;
  if (race > t.race[1]) {
    const turns = Math.max(0.5, Math.round(((race - mid) / 3) * 2) / 2);
    advice.push(`För mycket sag (${race} mm). Dra åt förspänningen ca ${turns} varv (1 varv ≈ 1,5 mm ≈ 3 mm sag).`);
  } else if (race < t.race[0]) {
    const turns = Math.max(0.5, Math.round(((mid - race) / 3) * 2) / 2);
    advice.push(`För lite sag (${race} mm). Lossa förspänningen ca ${turns} varv.`);
  } else {
    advice.push(`Racesagen ${race} mm är inom målet ${t.race[0]}–${t.race[1]} mm. 👍`);
  }
  if (race >= t.race[0] && race <= t.race[1]) {
    if (stat < t.static[0]) advice.push(`Statisk sag bara ${stat} mm: fjädern är troligen för MJUK för din vikt.`);
    else if (stat > t.static[1]) advice.push(`Statisk sag ${stat} mm: fjädern är troligen för HÅRD för din vikt.`);
    else advice.push(`Statisk sag ${stat} mm ser bra ut – fjädern passar.`);
  } else {
    advice.push('Mät igen efter justering – statisk sag säger något om fjädern först när racesagen stämmer.');
  }
  return { static: stat, race, advice };
}

// ---------------- Klickrar ----------------

export type ClickerRec = {
  forkComp: number;
  forkReb: number;
  shockLsc: number;
  shockHsc: number; // varv
  shockReb: number;
  forkHeight: number; // mm ändring av rör ovanför kronan, + = upp (mer rör synligt)
  airDelta: number; // bar
  tyres: [number, number]; // bar fram/bak
  notes: string[];
};

const T: Record<Terrain, Omit<ClickerRec, 'notes' | 'tyres'> & { tyres: [number, number]; note: string }> = {
  blandat: { forkComp: 0, forkReb: 0, shockLsc: 0, shockHsc: 0, shockReb: 0, forkHeight: 0, airDelta: 0, tyres: [0.9, 0.9], note: 'Utgå från standard och justera efter känsla.' },
  sand: { forkComp: 2, forkReb: 1, shockLsc: 2, shockHsc: 0.25, shockReb: 2, forkHeight: -2, airDelta: 0.1, tyres: [0.85, 0.85], note: 'Sand trycker ner bakänden – hårdare dämpning och långsammare retur ger stabilitet. Dra ner rören i kronan (höjer fronten) för rakare gång.' },
  hårt: { forkComp: -2, forkReb: -1, shockLsc: -1, shockHsc: -0.25, shockReb: -1, forkHeight: 2, airDelta: -0.1, tyres: [1.0, 0.95], note: 'Mjukare kompression ger grepp och komfort i bromsgropar. Rören upp i kronan ger snabbare svängning.' },
  lera: { forkComp: 1, forkReb: -1, shockLsc: 1, shockHsc: 0, shockReb: -1, forkHeight: 0, airDelta: 0, tyres: [0.8, 0.75], note: 'Leran gör cykeln tyngre. Lite hårdare kompression, snabbare retur så hjulen hinner följa marken. Lägre däcktryck.' },
  'sten-rötter': { forkComp: -3, forkReb: -2, shockLsc: -2, shockHsc: -0.5, shockReb: -2, forkHeight: 0, airDelta: -0.2, tyres: [0.7, 0.6], note: 'Mjuk och snabb för att följa hinder. Lågt däcktryck (eller mousse).' },
  'stora-hopp': { forkComp: 2, forkReb: 1, shockLsc: 1, shockHsc: 0.5, shockReb: 1, forkHeight: 0, airDelta: 0.2, tyres: [0.95, 0.95], note: 'Mer höghastighetskompression förhindrar bottning vid landningar.' },
};

export function clickerRec(rider: Rider, terrain: Terrain, spring: SpringRec, stockSprings: boolean): ClickerRec {
  const t = T[terrain];
  const r: ClickerRec = { ...t, notes: [t.note] };
  const sk = { nybörjare: -2, motionär: -1, avancerad: 0, elit: 2 }[rider.skill];
  r.forkComp += sk;
  r.shockLsc += sk;
  r.forkReb += Math.sign(sk);
  r.shockReb += Math.sign(sk);
  if (rider.skill === 'nybörjare') r.notes.push('Som nybörjare: mjukare ger mer förtroende och grepp.');
  if (rider.discipline === 'supercross') {
    r.forkComp += 3; r.shockLsc += 2; r.shockHsc += 0.5; r.forkReb += 1; r.shockReb += 1;
    r.notes.push('Supercross: betydligt hårdare – men rätt fjädrar är viktigast.');
  }
  if (rider.discipline === 'enduro') {
    r.forkComp -= 2; r.shockLsc -= 1; r.forkReb -= 1; r.shockReb -= 1;
  }
  if (stockSprings) {
    // Föraren kör på fabriksfjädrar som inte passar – kompensera med dämpning.
    const off = (spring.shockRec - spring.shockStock) / spring.shockStock;
    if (Math.abs(off) > 0.04) {
      const c = off > 0 ? 2 : -2;
      r.forkComp += c; r.shockLsc += c; r.forkReb += c; r.shockReb += c;
      if (!spring.air) r.notes.push(off > 0
        ? 'Du kör standardfjädrar som är för mjuka – klickrarna är kompenserade, men byt fjädrar för bäst resultat.'
        : 'Du kör standardfjädrar som är för hårda – klickrarna är mjukade, men byt fjädrar för bäst resultat.');
    }
  }
  const clamp = (v: number, lim: number) => Math.max(-lim, Math.min(lim, v));
  r.forkComp = clamp(r.forkComp, 8);
  r.forkReb = clamp(r.forkReb, 6);
  r.shockLsc = clamp(r.shockLsc, 8);
  r.shockReb = clamp(r.shockReb, 6);
  r.shockHsc = clamp(r.shockHsc, 1);
  r.tyres = t.tyres;
  return r;
}

/** Text för klickändring: positiv = hårdare (in, medurs). */
const FRAC: Record<string, string> = { '0.25': '¼', '0.5': '½', '0.75': '¾', '1.25': '1¼', '1.5': '1½' };

export function clickText(n: number, unit = 'klick') {
  if (n === 0) return 'Standard';
  const abs = FRAC[String(Math.abs(n))] ?? String(Math.abs(n)).replace('.', ',');
  return n > 0 ? `${abs} ${unit} hårdare (in)` : `${abs} ${unit} mjukare (ut)`;
}

export function rebText(n: number) {
  if (n === 0) return 'Standard';
  const abs = Math.abs(n);
  return n > 0 ? `${abs} klick långsammare (in)` : `${abs} klick snabbare (ut)`;
}

/** Absolut värde i "klick ut från helt stängd" om standardläget är känt. */
export function absClicks(stockOut: number | undefined, delta: number): string {
  if (stockOut == null || Number.isNaN(stockOut)) return '';
  return ` → ${Math.max(0, stockOut - delta)} ut`;
}
