import type { ForkId, ShockId } from './bikes';

// Hur man hittar standardläget på klickrarna, per fjädringstillverkare.
// Underlag: tillverkarnas instruktionsböcker (KTM 350 SX-F 2024 för WP,
// Yamaha YZ450F owner's service manual för KYB, Honda CRF450R owner's manual för Showa).

export type Maker = 'KYB' | 'Showa' | 'WP' | 'Öhlins';

export const MAKERS: Maker[] = ['KYB', 'Showa', 'WP', 'Öhlins'];

export function forkMaker(f: ForkId): Maker | undefined {
  if (f.startsWith('kyb')) return 'KYB';
  if (f.startsWith('showa')) return 'Showa';
  if (f.startsWith('wp')) return 'WP';
  if (f.startsWith('ohlins')) return 'Öhlins';
  return undefined;
}

export function shockMaker(s: ShockId): Maker | undefined {
  if (s === 'kyb') return 'KYB';
  if (s === 'showa') return 'Showa';
  if (s.startsWith('wp')) return 'WP';
  if (s === 'ohlins') return 'Öhlins';
  return undefined;
}

export type Guide = {
  maker: Maker;
  bikes: string;
  zero: string; // hur man hittar nolläget
  count: string; // hur man räknar
  where: { name: string; place: string }[];
  tips: string[];
  source: string;
};

export const GUIDES: Record<Maker, Guide> = {
  KYB: {
    maker: 'KYB',
    bikes: 'Yamaha, Kawasaki (nyare), Suzuki (2018+), Beta, Fantic, Triumph m.fl.',
    zero: 'Vrid justeraren medurs ("in") med bara fingerkraft tills den stannar. Det är "helt inskruvad" – hårdaste läget och nollpunkten.',
    count: 'Vrid sedan moturs ("ut") och räkna klicken tills du når standardvärdet i instruktionsboken, t.ex. "9 klick ut". Snabb/höghastighetskompression räknas i varv ut.',
    where: [
      { name: 'Gaffel retur', place: 'Oftast uppe på gaffelbenets lock (märkt med R eller T/TEN).' },
      { name: 'Gaffel kompression', place: 'Oftast nertill på gaffelbenet vid axeln (märkt med C eller S/SOFT) – se bilden i din manual.' },
      { name: 'Stöt lågfart-kompression', place: 'Skruvmejselspår mitt i justeringen på stötdämparens behållare.' },
      { name: 'Stöt höghastighets-kompression', place: 'Den yttre sexkanten (muttern) runt samma justering – räknas i varv.' },
      { name: 'Stöt retur', place: 'Nertill på stötdämparen, vid länkaget.' },
    ],
    tips: [
      'Dra aldrig hårt i botten – nålen kan skadas. Fingerkraft räcker.',
      'Ställ båda gaffelbenen lika.',
    ],
    source: 'Yamaha YZ450F Owner’s Service Manual: "Position in which the adjuster is turned in finger tight" = fullt inskruvad; standard anges i klick/varv ut från det läget.',
  },
  Showa: {
    maker: 'Showa',
    bikes: 'Honda, Kawasaki KX450 (2019+), äldre Suzuki RM-Z',
    zero: 'Vrid justeraren medurs tills den stannar. Det är det hårdaste läget och nollpunkten.',
    count: 'Vrid sedan moturs och räkna klicken till standardvärdet i instruktionsboken, t.ex. "11 klick". På vissa justerare motsvarar ett helt varv 4 klick.',
    where: [
      { name: 'Gaffel kompression', place: 'På gaffelbenet – se bilden i din manual (sitter olika beroende på årsmodell).' },
      { name: 'Gaffel retur', place: 'På det andra gaffelbenets ände (upptill eller nertill beroende på årsmodell).' },
      { name: 'Stöt lågfart-kompression', place: 'Skruvmejselspår på stötdämparens behållare.' },
      { name: 'Stöt höghastighets-kompression', place: 'Sexkanten runt samma justering – räknas i varv.' },
      { name: 'Stöt retur', place: 'Nertill på stötdämparen.' },
    ],
    tips: [
      'Honda: ställ alltid båda gaffelbenen i samma läge.',
      'Standardvärdet skiljer mellan årsmodeller – använd manualen för just din hoj.',
    ],
    source: 'Honda CRF450R Owner’s Manual: "turn the adjuster clockwise until it stops (full hard position), then turn counterclockwise … clicks for the standard position. Both fork legs should be adjusted to the same position."',
  },
  WP: {
    maker: 'WP',
    bikes: 'KTM, Husqvarna, GasGas',
    zero: 'Vrid justeraren medurs ända till stoppet (för klickjusterare: till sista kännbara klicket).',
    count: 'Vrid sedan moturs det antal klick (eller varv för höghastighetskompressionen) som manualen anger. KTM anger tre lägen: Comfort, Standard och Sport.',
    where: [
      { name: 'Gaffel kompression', place: 'Övre änden av högra gaffelbenet (SX-F). XC-F: överst på båda benen.' },
      { name: 'Gaffel retur', place: 'Nedre änden av högra gaffelbenet (SX-F). XC-F: nederst på båda benen.' },
      { name: 'Stöt lågfart-kompression', place: 'Justeringen på stötdämparens behållare – vrid till sista kännbara klicket, räkna klick ut.' },
      { name: 'Stöt höghastighets-kompression', place: 'Samma justering, yttre delen – vrid till stoppet och räkna varv ut.' },
      { name: 'Stöt retur', place: 'Nertill på stötdämparen.' },
    ],
    tips: [
      'Exempel KTM 350 SX-F 2024 (EU), Standard: gaffel kompression 12 klick, gaffel retur 12 klick, stöt lågfart 15 klick, stöt höghastighet 1,5 varv, stöt retur 15 klick.',
      'Luftgaffeln (AER): kontrollera lufttrycket – det påverkar mer än klicken.',
      'Äldre årsmodeller kan ha justerarna på andra ställen – titta i manualen.',
    ],
    source: 'KTM Owner’s Manual 350 SX-F 2024, kap. 10.4–10.6 och 10.14–10.15.',
  },
  Öhlins: {
    maker: 'Öhlins',
    bikes: 'Eftermonterat på alla märken (TTX-stötdämpare, RXF-gafflar m.fl.)',
    zero: 'Justerarna har vanlig högergänga. Vrid medurs till helt stängt – det är nollpunkten.',
    count: 'Vrid moturs för att öppna och räkna klicken tills du når rekommenderat antal. Höghastighetskompressionen räknas i varv. OBS: standardvärdena för Öhlins står på Öhlins inställningsblad för just ditt kit – inte i hojens instruktionsbok.',
    where: [
      { name: 'Stöt lågfart-kompression', place: 'Spårskruven i mitten av justeringen på behållaren.' },
      { name: 'Stöt höghastighets-kompression', place: 'Sexkanten runt samma justering – räknas i varv.' },
      { name: 'Stöt retur', place: 'Justerhjulet på kolvstången ovanför nedre fästet.' },
      { name: 'Gaffel kompression & retur', place: 'Se Öhlins inställningsblad för din gaffel.' },
    ],
    tips: [
      'Exempel från Öhlins kit YA394 (Yamaha): retur 24 klick, kompression 15 klick, höghastighet 3 varv.',
      'Om höjden bak blir högre än rekommenderat med rätt förspänning behövs mjukare fjäder (Öhlins).',
    ],
    source: 'Öhlins monteringsanvisning MI_YA394: "Turn clockwise to fully closed. Turn counter clockwise to open and count the clicks until you reach the recommended number of clicks."',
  },
};
