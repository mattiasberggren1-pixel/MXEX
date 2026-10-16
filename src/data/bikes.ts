// Cykeldatabas. Värdena är riktvärden sammanställda från tillverkarnas
// specar och tester – användaren kan alltid skriva över fjädring och fjädrar.

export type BikeClass =
  | '50' | '65' | '85' | '125-2T' | '250-2T' | '300-2T'
  | '250-4T' | '350-4T' | '450-4T' | 'electric';

export type ForkId =
  | 'kyb-coil' | 'showa-coil' | 'wp-coil' | 'wp-xplor'
  | 'wp-aer' | 'showa-tac-air' | 'kyb-psf-air' | 'other-coil' | 'other-air';

export type ShockId = 'kyb' | 'showa' | 'wp-link' | 'wp-pds' | 'zf' | 'other';

export const FORKS: Record<ForkId, { name: string; air: boolean }> = {
  'kyb-coil': { name: 'KYB spiral (SSS / 48 mm)', air: false },
  'showa-coil': { name: 'Showa spiral (49 mm)', air: false },
  'wp-coil': { name: 'WP spiral (4CS / closed cartridge)', air: false },
  'wp-xplor': { name: 'WP XPLOR 48 (spiral)', air: false },
  'wp-aer': { name: 'WP XACT AER 48 (luft)', air: true },
  'showa-tac-air': { name: 'Showa SFF-Air TAC (luft)', air: true },
  'kyb-psf-air': { name: 'KYB PSF / PSF2 (luft)', air: true },
  'other-coil': { name: 'Annan spiralgaffel', air: false },
  'other-air': { name: 'Annan luftgaffel', air: true },
};

export const SHOCKS: Record<ShockId, string> = {
  kyb: 'KYB (länk)',
  showa: 'Showa (länk)',
  'wp-link': 'WP XACT (länk)',
  'wp-pds': 'WP XPLOR PDS (utan länk)',
  zf: 'ZF / Sachs',
  other: 'Annan',
};

export type EcuId =
  | 'carb' | 'none-electric'
  | 'yamaha-gytr' | 'yamaha-wifi' | 'yamaha-wifi-tc'
  | 'honda-hrc' | 'honda-modes' | 'honda-modes-tc'
  | 'kawa-coupler' | 'kawa-app'
  | 'suzuki-coupler' | 'suzuki-shac'
  | 'ktm-switch' | 'ktm-switch-cuo' | 'ktm-2t-tbi' | 'ktm-enduro'
  | 'beta-switch' | 'fantic-get' | 'triumph-switch' | 'stark-app' | 'generic-efi';

export type Gen = {
  from: number;
  to: number;
  fork: ForkId;
  shock: ShockId;
  ecu: EcuId;
  /** Standardfjädrar om kända: gaffel N/mm per ben, stötdämpare N/mm. */
  forkSpring?: number;
  shockSpring?: number;
  /** Standard lufttryck i bar (luftgafflar). */
  airBar?: number;
};

export type Model = {
  id: string;
  brand: string;
  name: string;
  cls: BikeClass;
  use: 'mx' | 'enduro';
  gens: Gen[];
};

const NOW = 2026;

// Hjälpare för att hålla listan kompakt.
const g = (from: number, to: number, fork: ForkId, shock: ShockId, ecu: EcuId, extra: Partial<Gen> = {}): Gen =>
  ({ from, to, fork, shock, ecu, ...extra });
const m = (brand: string, name: string, cls: BikeClass, use: 'mx' | 'enduro', gens: Gen[]): Model =>
  ({ id: `${brand}-${name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'), brand, name, cls, use, gens });

export const MODELS: Model[] = [
  // ---------------- Yamaha ----------------
  m('Yamaha', 'YZ65', '65', 'mx', [g(2018, NOW, 'kyb-coil', 'kyb', 'carb')]),
  m('Yamaha', 'YZ85', '85', 'mx', [g(2010, NOW, 'kyb-coil', 'kyb', 'carb')]),
  m('Yamaha', 'YZ125', '125-2T', 'mx', [g(2010, NOW, 'kyb-coil', 'kyb', 'carb')]),
  m('Yamaha', 'YZ125X', '125-2T', 'enduro', [g(2020, NOW, 'kyb-coil', 'kyb', 'carb')]),
  m('Yamaha', 'YZ250', '250-2T', 'mx', [g(2010, NOW, 'kyb-coil', 'kyb', 'carb')]),
  m('Yamaha', 'YZ250X', '250-2T', 'enduro', [g(2016, NOW, 'kyb-coil', 'kyb', 'carb')]),
  m('Yamaha', 'YZ250F', '250-4T', 'mx', [
    g(2010, 2013, 'kyb-coil', 'kyb', 'carb'),
    g(2014, 2018, 'kyb-coil', 'kyb', 'yamaha-gytr'),
    g(2019, 2023, 'kyb-coil', 'kyb', 'yamaha-wifi'),
    g(2024, NOW, 'kyb-coil', 'kyb', 'yamaha-wifi-tc'),
  ]),
  m('Yamaha', 'YZ450F', '450-4T', 'mx', [
    g(2010, 2017, 'kyb-coil', 'kyb', 'yamaha-gytr'),
    g(2018, 2022, 'kyb-coil', 'kyb', 'yamaha-wifi'),
    g(2023, NOW, 'kyb-coil', 'kyb', 'yamaha-wifi-tc'),
  ]),
  m('Yamaha', 'YZ250FX', '250-4T', 'enduro', [
    g(2015, 2019, 'kyb-coil', 'kyb', 'yamaha-gytr'),
    g(2020, NOW, 'kyb-coil', 'kyb', 'yamaha-wifi'),
  ]),
  m('Yamaha', 'YZ450FX', '450-4T', 'enduro', [
    g(2016, 2018, 'kyb-coil', 'kyb', 'yamaha-gytr'),
    g(2019, NOW, 'kyb-coil', 'kyb', 'yamaha-wifi'),
  ]),
  m('Yamaha', 'WR250F', '250-4T', 'enduro', [
    g(2015, 2019, 'kyb-coil', 'kyb', 'yamaha-gytr'),
    g(2020, NOW, 'kyb-coil', 'kyb', 'yamaha-wifi'),
  ]),
  m('Yamaha', 'WR450F', '450-4T', 'enduro', [
    g(2016, 2018, 'kyb-coil', 'kyb', 'yamaha-gytr'),
    g(2019, NOW, 'kyb-coil', 'kyb', 'yamaha-wifi'),
  ]),

  // ---------------- Honda ----------------
  m('Honda', 'CRF150R', '85', 'mx', [g(2010, NOW, 'showa-coil', 'showa', 'carb')]),
  m('Honda', 'CRF250R', '250-4T', 'mx', [
    g(2010, 2014, 'showa-coil', 'showa', 'honda-hrc'),
    g(2015, 2017, 'kyb-psf-air', 'kyb', 'honda-hrc'),
    g(2018, 2021, 'showa-coil', 'showa', 'honda-modes'),
    g(2022, NOW, 'showa-coil', 'showa', 'honda-modes-tc'),
  ]),
  m('Honda', 'CRF250RX', '250-4T', 'enduro', [
    g(2019, 2021, 'showa-coil', 'showa', 'honda-modes'),
    g(2022, NOW, 'showa-coil', 'showa', 'honda-modes-tc'),
  ]),
  m('Honda', 'CRF450R', '450-4T', 'mx', [
    g(2010, 2014, 'showa-coil', 'showa', 'honda-hrc'),
    g(2015, 2016, 'showa-tac-air', 'showa', 'honda-hrc'),
    g(2017, 2020, 'showa-coil', 'showa', 'honda-modes'),
    g(2021, NOW, 'showa-coil', 'showa', 'honda-modes-tc'),
  ]),
  m('Honda', 'CRF450RX', '450-4T', 'enduro', [
    g(2017, 2020, 'showa-coil', 'showa', 'honda-modes'),
    g(2021, NOW, 'showa-coil', 'showa', 'honda-modes-tc'),
  ]),

  // ---------------- Kawasaki ----------------
  m('Kawasaki', 'KX65', '65', 'mx', [g(2010, NOW, 'kyb-coil', 'kyb', 'carb')]),
  m('Kawasaki', 'KX85', '85', 'mx', [g(2010, NOW, 'kyb-coil', 'kyb', 'carb')]),
  m('Kawasaki', 'KX112', '85', 'mx', [g(2022, NOW, 'kyb-coil', 'kyb', 'carb')]),
  m('Kawasaki', 'KX250F / KX250', '250-4T', 'mx', [
    g(2010, 2012, 'showa-coil', 'showa', 'kawa-coupler'),
    g(2013, 2016, 'showa-tac-air', 'showa', 'kawa-coupler'),
    g(2017, 2024, 'kyb-coil', 'kyb', 'kawa-coupler'),
    g(2025, NOW, 'kyb-coil', 'kyb', 'kawa-app'),
  ]),
  m('Kawasaki', 'KX450F / KX450', '450-4T', 'mx', [
    g(2010, 2012, 'showa-coil', 'showa', 'kawa-coupler'),
    g(2013, 2015, 'showa-tac-air', 'showa', 'kawa-coupler'),
    g(2016, 2018, 'kyb-psf-air', 'showa', 'kawa-coupler'),
    g(2019, 2023, 'showa-coil', 'showa', 'kawa-coupler'),
    g(2024, NOW, 'showa-coil', 'showa', 'kawa-app'),
  ]),
  m('Kawasaki', 'KX450X', '450-4T', 'enduro', [
    g(2021, 2023, 'showa-coil', 'showa', 'kawa-coupler'),
    g(2024, NOW, 'showa-coil', 'showa', 'kawa-app'),
  ]),

  // ---------------- Suzuki ----------------
  m('Suzuki', 'RM85', '85', 'mx', [g(2010, NOW, 'kyb-coil', 'kyb', 'carb')]),
  m('Suzuki', 'RM-Z250', '250-4T', 'mx', [
    g(2010, 2015, 'showa-coil', 'showa', 'suzuki-coupler'),
    g(2016, 2018, 'showa-tac-air', 'showa', 'suzuki-shac'),
    g(2019, NOW, 'kyb-coil', 'kyb', 'suzuki-shac'),
  ]),
  m('Suzuki', 'RM-Z450', '450-4T', 'mx', [
    g(2010, 2014, 'showa-coil', 'showa', 'suzuki-coupler'),
    g(2015, 2017, 'showa-tac-air', 'showa', 'suzuki-coupler'),
    g(2018, NOW, 'kyb-coil', 'kyb', 'suzuki-shac'),
  ]),

  // ---------------- KTM ----------------
  m('KTM', '50 SX', '50', 'mx', [g(2010, NOW, 'wp-coil', 'wp-pds', 'carb')]),
  m('KTM', '65 SX', '65', 'mx', [g(2010, 2015, 'wp-coil', 'wp-pds', 'carb'), g(2016, NOW, 'wp-aer', 'wp-pds', 'carb', { airBar: 7.0 })]),
  m('KTM', '85 SX', '85', 'mx', [g(2010, 2017, 'wp-coil', 'wp-link', 'carb'), g(2018, NOW, 'wp-aer', 'wp-link', 'carb', { airBar: 7.0 })]),
  m('KTM', '125 SX', '125-2T', 'mx', [g(2010, 2015, 'wp-coil', 'wp-link', 'carb'), g(2016, NOW, 'wp-aer', 'wp-link', 'carb', { airBar: 10.0 })]),
  m('KTM', '250 SX', '250-2T', 'mx', [
    g(2010, 2015, 'wp-coil', 'wp-link', 'carb'),
    g(2016, 2022, 'wp-aer', 'wp-link', 'carb', { airBar: 10.5 }),
    g(2023, NOW, 'wp-aer', 'wp-link', 'ktm-2t-tbi', { airBar: 10.5 }),
  ]),
  m('KTM', '250 SX-F', '250-4T', 'mx', [
    g(2010, 2015, 'wp-coil', 'wp-link', 'generic-efi'),
    g(2016, 2022, 'wp-aer', 'wp-link', 'ktm-switch', { airBar: 10.5, shockSpring: 42 }),
    g(2023, NOW, 'wp-aer', 'wp-link', 'ktm-switch-cuo', { airBar: 10.5, shockSpring: 42 }),
  ]),
  m('KTM', '350 SX-F', '350-4T', 'mx', [
    g(2011, 2015, 'wp-coil', 'wp-link', 'generic-efi'),
    g(2016, 2022, 'wp-aer', 'wp-link', 'ktm-switch', { airBar: 10.5, shockSpring: 45 }),
    g(2023, NOW, 'wp-aer', 'wp-link', 'ktm-switch-cuo', { airBar: 10.5, shockSpring: 45 }),
  ]),
  m('KTM', '450 SX-F', '450-4T', 'mx', [
    g(2010, 2015, 'wp-coil', 'wp-link', 'generic-efi'),
    g(2016, 2022, 'wp-aer', 'wp-link', 'ktm-switch', { airBar: 10.5, shockSpring: 45 }),
    g(2023, NOW, 'wp-aer', 'wp-link', 'ktm-switch-cuo', { airBar: 10.5, shockSpring: 45 }),
  ]),
  m('KTM', '300 EXC / XC-W', '300-2T', 'enduro', [
    g(2010, 2017, 'wp-xplor', 'wp-pds', 'carb'),
    g(2018, 2023, 'wp-xplor', 'wp-pds', 'ktm-2t-tbi'),
    g(2024, NOW, 'wp-xplor', 'wp-link', 'ktm-2t-tbi'),
  ]),
  m('KTM', '250/350 EXC-F', '350-4T', 'enduro', [
    g(2012, 2023, 'wp-xplor', 'wp-pds', 'ktm-enduro'),
    g(2024, NOW, 'wp-xplor', 'wp-link', 'ktm-enduro'),
  ]),
  m('KTM', '450/500 EXC-F', '450-4T', 'enduro', [
    g(2012, 2023, 'wp-xplor', 'wp-pds', 'ktm-enduro'),
    g(2024, NOW, 'wp-xplor', 'wp-link', 'ktm-enduro'),
  ]),

  // ---------------- Husqvarna (KTM-koncernen från 2014) ----------------
  m('Husqvarna', 'TC 65', '65', 'mx', [g(2017, NOW, 'wp-aer', 'wp-pds', 'carb', { airBar: 7.0 })]),
  m('Husqvarna', 'TC 85', '85', 'mx', [g(2018, NOW, 'wp-aer', 'wp-link', 'carb', { airBar: 7.0 })]),
  m('Husqvarna', 'TC 125', '125-2T', 'mx', [g(2016, NOW, 'wp-aer', 'wp-link', 'carb', { airBar: 10.0 })]),
  m('Husqvarna', 'TC 250', '250-2T', 'mx', [
    g(2016, 2022, 'wp-aer', 'wp-link', 'carb', { airBar: 10.5 }),
    g(2023, NOW, 'wp-aer', 'wp-link', 'ktm-2t-tbi', { airBar: 10.5 }),
  ]),
  m('Husqvarna', 'FC 250', '250-4T', 'mx', [
    g(2014, 2015, 'wp-coil', 'wp-link', 'generic-efi'),
    g(2016, 2022, 'wp-aer', 'wp-link', 'ktm-switch', { airBar: 10.5, shockSpring: 42 }),
    g(2023, NOW, 'wp-aer', 'wp-link', 'ktm-switch-cuo', { airBar: 10.5, shockSpring: 42 }),
  ]),
  m('Husqvarna', 'FC 350', '350-4T', 'mx', [
    g(2014, 2015, 'wp-coil', 'wp-link', 'generic-efi'),
    g(2016, 2022, 'wp-aer', 'wp-link', 'ktm-switch', { airBar: 10.5, shockSpring: 45 }),
    g(2023, NOW, 'wp-aer', 'wp-link', 'ktm-switch-cuo', { airBar: 10.5, shockSpring: 45 }),
  ]),
  m('Husqvarna', 'FC 450', '450-4T', 'mx', [
    g(2014, 2015, 'wp-coil', 'wp-link', 'generic-efi'),
    g(2016, 2022, 'wp-aer', 'wp-link', 'ktm-switch', { airBar: 10.5, shockSpring: 45 }),
    g(2023, NOW, 'wp-aer', 'wp-link', 'ktm-switch-cuo', { airBar: 10.5, shockSpring: 45 }),
  ]),
  m('Husqvarna', 'TE 300', '300-2T', 'enduro', [
    g(2014, 2017, 'wp-xplor', 'wp-pds', 'carb'),
    g(2018, 2023, 'wp-xplor', 'wp-pds', 'ktm-2t-tbi'),
    g(2024, NOW, 'wp-xplor', 'wp-link', 'ktm-2t-tbi'),
  ]),
  m('Husqvarna', 'FE 350', '350-4T', 'enduro', [
    g(2014, 2023, 'wp-xplor', 'wp-pds', 'ktm-enduro'),
    g(2024, NOW, 'wp-xplor', 'wp-link', 'ktm-enduro'),
  ]),
  m('Husqvarna', 'FE 450/501', '450-4T', 'enduro', [
    g(2014, 2023, 'wp-xplor', 'wp-pds', 'ktm-enduro'),
    g(2024, NOW, 'wp-xplor', 'wp-link', 'ktm-enduro'),
  ]),

  // ---------------- GasGas (KTM-koncernen från 2021) ----------------
  m('GasGas', 'MC 65', '65', 'mx', [g(2021, NOW, 'wp-aer', 'wp-pds', 'carb', { airBar: 7.0 })]),
  m('GasGas', 'MC 85', '85', 'mx', [g(2021, NOW, 'wp-aer', 'wp-link', 'carb', { airBar: 7.0 })]),
  m('GasGas', 'MC 125', '125-2T', 'mx', [g(2021, NOW, 'wp-aer', 'wp-link', 'carb', { airBar: 10.0 })]),
  m('GasGas', 'MC 250', '250-2T', 'mx', [
    g(2021, 2022, 'wp-aer', 'wp-link', 'carb', { airBar: 10.5 }),
    g(2023, NOW, 'wp-aer', 'wp-link', 'ktm-2t-tbi', { airBar: 10.5 }),
  ]),
  m('GasGas', 'MC 250F', '250-4T', 'mx', [g(2021, NOW, 'wp-aer', 'wp-link', 'ktm-switch', { airBar: 10.5, shockSpring: 42 })]),
  m('GasGas', 'MC 350F', '350-4T', 'mx', [g(2021, NOW, 'wp-aer', 'wp-link', 'ktm-switch', { airBar: 10.5, shockSpring: 45 })]),
  m('GasGas', 'MC 450F', '450-4T', 'mx', [g(2021, NOW, 'wp-aer', 'wp-link', 'ktm-switch', { airBar: 10.5, shockSpring: 45 })]),
  m('GasGas', 'EC 300', '300-2T', 'enduro', [g(2021, NOW, 'wp-xplor', 'wp-pds', 'ktm-2t-tbi')]),
  m('GasGas', 'EC 350F', '350-4T', 'enduro', [g(2021, NOW, 'wp-xplor', 'wp-pds', 'ktm-enduro')]),

  // ---------------- Övriga ----------------
  m('Beta', 'RX 300 (2T)', '300-2T', 'mx', [g(2023, NOW, 'kyb-coil', 'zf', 'beta-switch')]),
  m('Beta', 'RX 450', '450-4T', 'mx', [g(2023, NOW, 'kyb-coil', 'zf', 'beta-switch')]),
  m('Beta', 'RR 300 (2T)', '300-2T', 'enduro', [g(2013, NOW, 'other-coil', 'zf', 'beta-switch')]),
  m('Beta', 'RR 350/390/430/480', '450-4T', 'enduro', [g(2013, NOW, 'other-coil', 'zf', 'beta-switch')]),
  m('Fantic', 'XX 125', '125-2T', 'mx', [g(2021, NOW, 'kyb-coil', 'kyb', 'carb')]),
  m('Fantic', 'XX 250', '250-2T', 'mx', [g(2022, NOW, 'kyb-coil', 'kyb', 'fantic-get')]),
  m('Fantic', 'XXF 250', '250-4T', 'mx', [g(2023, NOW, 'kyb-coil', 'kyb', 'fantic-get')]),
  m('Fantic', 'XXF 450', '450-4T', 'mx', [g(2024, NOW, 'kyb-coil', 'kyb', 'fantic-get')]),
  m('Triumph', 'TF 250-X', '250-4T', 'mx', [g(2024, NOW, 'kyb-coil', 'kyb', 'triumph-switch')]),
  m('Triumph', 'TF 450-RC', '450-4T', 'mx', [g(2025, NOW, 'kyb-coil', 'kyb', 'triumph-switch')]),
  m('TM Racing', 'MX 250Fi', '250-4T', 'mx', [g(2015, NOW, 'kyb-coil', 'other', 'generic-efi')]),
  m('TM Racing', 'MX 450Fi', '450-4T', 'mx', [g(2015, NOW, 'kyb-coil', 'other', 'generic-efi')]),
  m('TM Racing', 'MX 125/144', '125-2T', 'mx', [g(2010, NOW, 'kyb-coil', 'other', 'carb')]),
  m('Stark', 'Varg MX', 'electric', 'mx', [g(2023, NOW, 'kyb-coil', 'kyb', 'stark-app')]),
];

export const BRANDS = Array.from(new Set(MODELS.map((x) => x.brand)));

export function modelsFor(brand: string, year?: number): Model[] {
  return MODELS.filter(
    (x) => x.brand === brand && (year == null || x.gens.some((gn) => year >= gn.from && year <= gn.to)),
  );
}

export function yearsFor(brand: string): number[] {
  const ys = new Set<number>();
  for (const x of MODELS) if (x.brand === brand) for (const gn of x.gens) for (let y = gn.from; y <= gn.to; y++) ys.add(y);
  return [...ys].sort((a, b) => b - a);
}

export function findModel(id: string): Model | undefined {
  return MODELS.find((x) => x.id === id);
}

export function genFor(model: Model, year: number): Gen {
  return model.gens.find((gn) => year >= gn.from && year <= gn.to) ?? model.gens[model.gens.length - 1];
}
