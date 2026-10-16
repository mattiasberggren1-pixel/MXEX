import type { Model } from './bikes';

// Serviceschema per märke/modell/år.
// src = 'tillverkare' när intervallet kommer från tillverkarens egna dokument,
//       'praxis' när tillverkaren inte publicerar det och vi använder vanlig branschpraxis.

export type Src = 'tillverkare' | 'praxis';

export type ServiceItem = {
  key: string;
  name: string;
  what: string;
  intervalH?: number;
  months?: number;
  once?: boolean; // engångsservice, t.ex. efter inkörning
  src: Src;
};

export type ServiceTemplate = { title: string; source: string; items: ServiceItem[] };

const KTM_SOURCE = 'KTM Service Times (Offroad), augusti 2024 – intervallen. Exakt innehåll per service står i instruktionsboken.';

export const isTwoStroke = (m: Model) =>
  m.cls.endsWith('2T') || (['50', '65', '85'].includes(m.cls) && !m.name.includes('CRF150'));

// ---- Gemensamma poster (branschpraxis) ----
const airFilter: ServiceItem = { key: 'air', name: 'Luftfilter', what: 'Tvätta och olja in luftfiltret. I damm och sand: efter varje körning.', intervalH: 2.5, src: 'praxis' };
const chain: ServiceItem = { key: 'chain', name: 'Kedja & drev', what: 'Kontrollera spänning, smörj kedjan, titta på drev och kedjeglidare.', intervalH: 2.5, src: 'praxis' };
const fluids: ServiceItem = { key: 'fluids', name: 'Broms- & kopplingsvätska, kylarvätska', what: 'Byt bromsvätska, hydraulisk kopplingsvätska och kylarvätska.', months: 24, src: 'praxis' };
const forkPraxis: ServiceItem = { key: 'fork', name: 'Gaffelservice', what: 'Byt gaffelolja och kontrollera tätningar/bussningar.', intervalH: 30, src: 'praxis' };
const shockPraxis: ServiceItem = { key: 'shock', name: 'Stötdämparservice', what: 'Byt olja och kontrollera kolv/tätningar. Smörj länkage och svingarmslager.', intervalH: 30, src: 'praxis' };

// ---- Honda CRF450R/RX 2021+ (Hondas instruktionsbok, onlineversion) ----
const HONDA: ServiceItem[] = [
  { key: 'air', name: 'Luftfilter', what: 'Rengör luftfiltret varje race (ca 2,5 h) – efter varje heat i dammiga förhållanden.', intervalH: 2.5, src: 'tillverkare' },
  { key: 'chain', name: 'Kedja, drev & kedjerullar', what: 'Kontrollera och smörj kedjan, kontrollera drev, glidare och rullar.', intervalH: 2.5, src: 'tillverkare' },
  { key: 'oil', name: 'Motorolja + oljefilter', what: 'Kontrollera oljan varje race. Byt olja och filter var 6:e race (ca 15 h), efter inkörningen och när kopplingslamellerna byts.', intervalH: 15, src: 'tillverkare' },
  { key: 'valves', name: 'Ventilspel & dekompressor', what: 'Kontrollera ventilspelet (även efter inkörningen).', intervalH: 15, src: 'tillverkare' },
  { key: 'piston', name: 'Kolv, kolvringar & kolvbult', what: 'Byt kolv, ringar och kolvbult. Kör in motorn igen efter bytet.', intervalH: 15, src: 'tillverkare' },
  { key: 'linkage', name: 'Svingarm & länkage', what: 'Smörj svingarmslager och länkage.', intervalH: 7.5, src: 'tillverkare' },
  { key: 'fork', name: 'Gaffelolja', what: 'Byt gaffelolja.', intervalH: 22.5, src: 'tillverkare' },
  { key: 'steering', name: 'Styrlager', what: 'Kontrollera styrlagret.', intervalH: 22.5, src: 'tillverkare' },
  { key: 'fuel', name: 'Bränsleslang & bränslepumpfilter', what: 'Byt bränsleslang och bränslepumpens filter (minst en gång per år).', intervalH: 30, months: 12, src: 'tillverkare' },
  { key: 'fluids', name: 'Broms-, kopplings- & kylarvätska', what: 'Byt bromsvätska, kopplingsvätska och kylarvätska.', months: 24, src: 'tillverkare' },
];

// ---- Yamaha YZ-F (intervallen "varje race 2,5 h / var 3:e 7,5 h / var 5:e 12,5 h") ----
const YAMAHA: ServiceItem[] = [
  airFilter,
  chain,
  { key: 'oil', name: 'Motorolja', what: 'Byt motoroljan – Yamaha anger varje race (ca 2,5 h) för tävlingskörning.', intervalH: 2.5, src: 'tillverkare' },
  { key: 'oilfilter', name: 'Oljefilter', what: 'Byt oljefiltret (var 5:e race, ca 12,5 h).', intervalH: 12.5, src: 'tillverkare' },
  { key: 'valves', name: 'Ventilspel', what: 'Kontrollera ventilspelet.', intervalH: 12.5, src: 'praxis' },
  { key: 'piston', name: 'Kolv, ringar & kolvbult', what: 'Kontrollera ringgap och kolv. Byt kolv, bult, låsring och ringar som en sats.', intervalH: 25, src: 'praxis' },
  forkPraxis,
  shockPraxis,
  fluids,
];

// ---- Kawasaki KX-F (instruktionsboken via sammanfattning: var 6:e race / 15 h) ----
const KAWASAKI: ServiceItem[] = [
  airFilter,
  chain,
  { key: 'oil', name: 'Motorolja + oljefilter', what: 'Byt olja och filter var 6:e race (ca 15 h).', intervalH: 15, src: 'tillverkare' },
  { key: 'piston', name: 'Kolv & kolvringar', what: 'Byt kolv och ringar var 6:e race (ca 15 h) vid tävlingskörning.', intervalH: 15, src: 'tillverkare' },
  { key: 'valves', name: 'Ventilspel', what: 'Kontrollera ventilspelet.', intervalH: 15, src: 'praxis' },
  forkPraxis,
  shockPraxis,
  fluids,
];

// ---- Allmänt 4-takt / 2-takt (tillverkaren publicerar inget vi kunnat verifiera) ----
const GENERIC_4T = (bigBore: boolean): ServiceItem[] => [
  airFilter,
  chain,
  { key: 'oil', name: 'Motorolja + oljefilter', what: 'Byt olja och filter.', intervalH: 10, src: 'praxis' },
  { key: 'valves', name: 'Ventilspel', what: 'Kontrollera ventilspelet.', intervalH: 15, src: 'praxis' },
  { key: 'piston', name: 'Kolv & ringar', what: 'Byt kolv och ringar.', intervalH: bigBore ? 40 : 30, src: 'praxis' },
  forkPraxis,
  shockPraxis,
  fluids,
];

const GENERIC_2T = (small: boolean): ServiceItem[] => [
  airFilter,
  chain,
  { key: 'gearoil', name: 'Växellådsolja', what: 'Byt växellådsoljan.', intervalH: 10, src: 'praxis' },
  { key: 'piston', name: 'Kolv & ringar', what: 'Byt kolv och kolvringar.', intervalH: small ? 15 : 25, src: 'praxis' },
  { key: 'reeds', name: 'Membran (reeds) & avgasventil', what: 'Kontrollera membranblad och rengör avgasventilen.', intervalH: 20, src: 'praxis' },
  forkPraxis,
  shockPraxis,
  fluids,
];

// ---- KTM-koncernen: servicetillfällen enligt KTM Service Times ----
function ktmLevels(levels: (number | `${number}m`)[]): ServiceItem[] {
  const out: ServiceItem[] = [];
  for (const l of levels) {
    if (typeof l === 'string') {
      const mo = parseInt(l, 10);
      out.push({ key: `ktm-${mo}m`, name: `Årlig service (${mo} mån)`, what: 'Tidsbaserad service enligt instruktionsboken – vätskor, gummidetaljer m.m.', months: mo, src: 'tillverkare' });
    } else if (l === 1) {
      out.push({ key: 'ktm-1h', name: 'Första service (1 h)', what: 'Efter inkörningen: olja och filter, kontroll av ekrar, skruvar och kedja.', intervalH: 1, once: true, src: 'tillverkare' });
    } else {
      const engine = l >= 40;
      out.push({
        key: `ktm-${l}h`,
        name: `KTM-service ${l} h${engine ? ' (motorservice)' : ''}`,
        what: engine
          ? 'Servicen innehåller motorarbete (kolv/topp eller större motorservice) enligt instruktionsboken.'
          : 'Olja och filter, luftfilter och genomgång enligt instruktionsboken.',
        intervalH: l,
        src: 'tillverkare',
      });
    }
  }
  return [airFilter, chain, ...out];
}

function ktmTemplate(model: Model, year: number): ServiceTemplate {
  const fourStroke = !isTwoStroke(model);
  const enduro = model.use === 'enduro';
  let levels: (number | `${number}m`)[];
  if (model.cls === '50' || model.cls === '65' || model.cls === '85') {
    levels = year >= 2024 ? [1, 15, 45, 90, '12m'] : [10, 20, 40];
  } else if (fourStroke && !enduro) {
    levels = year >= 2023 ? [1, 15, 45, 90, '24m'] : year >= 2018 ? [1, 10, 20, 30, 40] : [1, 10, 20, 30];
  } else if (fourStroke && enduro) {
    const big = model.cls === '450-4T';
    levels = year >= 2024 ? (big ? [1, 15, 30, 90, '24m'] : [1, 15, 45, 90, '24m']) : [1, 15, 30, 45];
  } else if (!enduro) {
    levels = year >= 2023 ? [1, 15, 45, 90, '24m'] : model.cls === '125-2T' ? [1, 10, 20, 40] : [1, 5, 10, 20, 40];
  } else {
    levels = year >= 2024 ? [1, 15, 45, 90, '24m'] : [1, 5, 20, 40];
  }
  const sibling = model.brand === 'KTM' ? '' : ` (${model.brand} delar plattform med KTM)`;
  return { title: `Servicetillfällen enligt KTM${sibling}`, source: KTM_SOURCE, items: ktmLevels(levels) };
}

/** När schemat är lånat från en annan modell/årsmodell räknas det inte som tillverkarens för just din cykel. */
const borrowed = (items: ServiceItem[]): ServiceItem[] => items.map((i) => (i.src === 'tillverkare' ? { ...i, src: 'praxis' } : i));

export function serviceTemplate(model: Model, year: number): ServiceTemplate {
  const twoStroke = isTwoStroke(model);
  if (['KTM', 'Husqvarna', 'GasGas'].includes(model.brand)) return ktmTemplate(model, year);
  if (model.brand === 'Honda' && !twoStroke && model.cls !== '85') {
    const exact = model.name.startsWith('CRF450R') && year >= 2021;
    return {
      title: exact ? 'Hondas underhållsschema' : 'Hondas schema för CRF450R/RX 2021+',
      source: exact
        ? 'Honda instruktionsbok CRF450R/RX/RWE (online), underhållsschema.'
        : 'Hondas schema för CRF450R/RX 2021+ – kontrollera mot instruktionsboken för din modell.',
      items: exact ? HONDA : borrowed(HONDA),
    };
  }
  if (model.brand === 'Yamaha' && !twoStroke) {
    const exact = model.name === 'YZ450F' && year >= 2020;
    return {
      title: exact ? 'Yamahas underhållsintervall' : 'Yamahas intervall för YZ450F',
      source: 'Yamaha Owner’s Service Manual YZ450F (2020–2021): intervall per race (2,5 / 7,5 / 12,5 h). Poster märkta "praxis" är inte verifierade mot manualen för din modell.',
      items: exact ? YAMAHA : borrowed(YAMAHA),
    };
  }
  if (model.brand === 'Kawasaki' && !twoStroke) {
    const exact = model.name.startsWith('KX450F') && year <= 2014;
    return {
      title: exact ? 'Kawasakis underhållsintervall' : 'Kawasakis intervall för KX450F 2009–2014',
      source: 'Kawasaki KX450F instruktionsbok 2009–2014 (via Cyclepedia): olja/filter och kolv var 6:e race (15 h). Stäm av mot instruktionsboken för din årsmodell.',
      items: exact ? KAWASAKI : borrowed(KAWASAKI),
    };
  }
  if (model.cls === 'electric') {
    return { title: 'Grundschema (el)', source: 'Branschpraxis.', items: [chain, forkPraxis, shockPraxis, fluids] };
  }
  return {
    title: 'Grundschema',
    source: 'Branschpraxis – tillverkaren publicerar inget schema vi kunnat verifiera. Stäm av mot instruktionsboken.',
    items: twoStroke ? GENERIC_2T(model.cls === '125-2T' || ['50', '65', '85'].includes(model.cls)) : GENERIC_4T(model.cls === '450-4T'),
  };
}

// ---- Oljerekommendation ----
export type OilRec = { what: string; grade: string; example: string; qty?: string };

export function oilFor(model: Model): OilRec {
  const twoStroke = isTwoStroke(model);
  if (model.cls === 'electric') return { what: 'Växellådsolja', grade: 'Enligt Stark', example: '–' };
  if (twoStroke) {
    const ktm = ['KTM', 'Husqvarna', 'GasGas'].includes(model.brand);
    return {
      what: 'Växellådsolja',
      grade: ktm ? '15W-50 (JASO MA2)' : model.brand === 'Yamaha' ? '10W-30 (JASO MA)' : '10W-40 (JASO MA)',
      example: ktm ? 'Motorex 15W-50' : model.brand === 'Yamaha' ? 'Yamalube 10W-30' : 'Valfri JASO MA-olja',
    };
  }
  switch (model.brand) {
    case 'Yamaha':
      return { what: 'Motorolja', grade: '10W-40 (JASO MA2)', example: 'Yamalube 4 10W-40', qty: model.name === 'YZ450F' ? 'ca 0,95 L med filter' : undefined };
    case 'Honda':
      return { what: 'Motorolja', grade: '10W-30 (JASO MA)', example: 'Pro Honda HP4M / GN4 10W-30' };
    case 'Kawasaki':
      return { what: 'Motorolja', grade: '10W-40 (JASO MA)', example: 'Kawasaki 10W-40', qty: model.cls === '450-4T' ? 'ca 0,95 L med filter' : undefined };
    case 'Suzuki':
      return { what: 'Motorolja', grade: '10W-40 (JASO MA)', example: 'Suzuki/Motul 10W-40' };
    case 'KTM':
    case 'Husqvarna':
    case 'GasGas':
      return { what: 'Motorolja', grade: '10W-50 (JASO MA2)', example: 'Motorex Cross Power 4T 10W-50' };
    default:
      return { what: 'Motorolja', grade: '10W-40/10W-50 (JASO MA2)', example: 'Se instruktionsboken' };
  }
}
