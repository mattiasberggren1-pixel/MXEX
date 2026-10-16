import type { EcuId } from './bikes';

export type SettingField = {
  key: string;
  label: string;
  options: string[];
};

export type Grid = {
  rows: number; // gasöppning
  cols: number; // varvtal
  rowLabels: string[];
  colLabels: string[];
  fuelUnit: string;
  ignUnit: string;
  fuelRange: [number, number];
  ignRange: [number, number];
};

export type Ecu = {
  title: string;
  /** Officiell app/verktyg om det finns. */
  tool?: string;
  /** Kan man ändra något själv utan verkstad? */
  summary: string;
  steps: string[];
  grid?: Grid;
  fields: SettingField[];
};

const onOff = ['Av', 'På'];
const throttle4 = ['Gas låg', 'Gas mellan', 'Gas hög', 'Fullgas'];
const rpm4 = ['Låga varv', 'Mellanvarv', 'Höga varv', 'Toppvarv'];

const yamahaGrid4: Grid = {
  rows: 4, cols: 4, rowLabels: throttle4, colLabels: rpm4,
  fuelUnit: '%', ignUnit: '°', fuelRange: [-20, 20], ignRange: [-10, 10],
};

const grid3: Grid = {
  rows: 3, cols: 3,
  rowLabels: ['Gas låg', 'Gas mellan', 'Gas hög'],
  colLabels: ['Låga varv', 'Mellanvarv', 'Höga varv'],
  fuelUnit: 'steg', ignUnit: '°', fuelRange: [-15, 15], ignRange: [-6, 6],
};

export const ECUS: Record<EcuId, Ecu> = {
  carb: {
    title: 'Förgasare – ingen elektronisk mappning',
    summary: 'Motorn ställs in med munstycken, nål och luftskruv. Appen kan hjälpa dig att logga vad du kört med.',
    steps: [
      'Kallt/fuktigt väder eller låg höjd → oftast fetare (större huvudmunstycke / nål ett hack upp).',
      'Varmt väder eller hög höjd → magrare.',
      'Spraka/patron i tomgång → justera luftskruven i ¼-varvssteg.',
      'Logga munstycke, nål och clip-läge i fältet "Inställningar" nedan.',
    ],
    fields: [
      { key: 'main', label: 'Huvudmunstycke', options: [] },
      { key: 'pilot', label: 'Tomgångsmunstycke', options: [] },
      { key: 'needle', label: 'Nål / clip', options: [] },
      { key: 'air', label: 'Luftskruv (varv ut)', options: [] },
    ],
  },
  'none-electric': {
    title: 'Elcykel', summary: 'Ingen bränslemappning.', steps: [], fields: [],
  },
  'yamaha-gytr': {
    title: 'Yamaha GYTR Power Tuner (handenhet)',
    tool: 'GYTR Power Tuner (tillbehör, kopplas med sladd)',
    summary: 'Bränsle och tändning justeras i ett 3×3-rutnät (9 punkter). 0 = standard. Varje tändningssteg ≈ 1 grad.',
    steps: [
      'Koppla GYTR Power Tuner till diagnoskontakten under sätet.',
      'Mata in värdena från rutnätet nedan, punkt för punkt.',
      'Spara mappen och provkör. Ändra en sak i taget.',
    ],
    grid: grid3,
    fields: [],
  },
  'yamaha-wifi': {
    title: 'Yamaha Power Tuner-appen (Wi-Fi)',
    tool: 'Yamaha Power Tuner (gratis, iOS/Android) via cykelns Wi-Fi-enhet (CCU)',
    summary: 'Bränsle (%) och tändning (°) per gas/varv i ett 4×4-rutnät. Två mappar kan väljas med knappen på styret.',
    steps: [
      'Slå på tändningen och anslut telefonen till cykelns Wi-Fi (lösenord står på klistermärket/i manualen).',
      'Öppna Power Tuner → välj mapp-plats (1 eller 2).',
      'Skriv in värdena från rutnätet nedan i samma ruta i Power Tuner (samma rader/kolumner).',
      'Tryck "Skicka/Write" till ECU:n. Byt mapp med knappen på styret för att jämföra.',
    ],
    grid: yamahaGrid4,
    fields: [{ key: 'slot', label: 'Mapp-plats', options: ['Mapp 1', 'Mapp 2'] }],
  },
  'yamaha-wifi-tc': {
    title: 'Yamaha Power Tuner (2023+ med antispinn & launch)',
    tool: 'Yamaha Power Tuner (gratis, iOS/Android) via cykelns Wi-Fi-enhet',
    summary: 'Som tidigare 4×4-rutnät, plus snabbinställning 1–7 (mjuk → aggressiv), antispinn (TC) och launch control.',
    steps: [
      'Anslut till cykelns Wi-Fi och öppna Power Tuner.',
      'Snabbläge: dra reglaget till samma steg som nedan – eller använd rutnätet för finjustering.',
      'Ställ TC och launch enligt fälten nedan.',
      'Skicka till ECU och provkör.',
    ],
    grid: yamahaGrid4,
    fields: [
      { key: 'slot', label: 'Mapp-plats', options: ['Mapp 1', 'Mapp 2'] },
      { key: 'quick', label: 'Snabbinställning', options: ['1 (mjuk)', '2', '3', '4 (standard)', '5', '6', '7 (aggressiv)'] },
      { key: 'tc', label: 'Antispinn (TC)', options: ['Av', 'Låg', 'Hög'] },
      { key: 'launch', label: 'Launch control', options: ['Av', 'Varvbegränsning', 'Tändfördröjning', 'Med antispinn'] },
      { key: 'launchRpm', label: 'Launch-varv', options: ['7000', '7500', '8000', '8500', '9000', '9500', '10000'] },
    ],
  },
  'honda-hrc': {
    title: 'Honda – HRC Setting Tool / GET',
    tool: 'HRC Setting Tool (verkstad) eller GET WiFi-COM + WiGET-appen (eftermarknad)',
    summary: 'Ingen fabriksapp. Bränsle och tändning kan ändras med HRC:s verktyg eller GET WiFi-COM som kopplas till diagnoskontakten.',
    steps: [
      'Med GET WiFi-COM: koppla in, öppna WiGET och välj din modell.',
      'Använd rutnätet nedan som anteckning och för över värdena.',
    ],
    grid: grid3,
    fields: [],
  },
  'honda-modes': {
    title: 'Honda – 3 motorlägen + launch',
    tool: 'Knapp på styret (+ GET WiFi-COM för finjustering)',
    summary: 'Tre lägen: 1 standard, 2 mjuk, 3 aggressiv. HRC launch control med knapp.',
    steps: [
      'Med motorn igång: tryck på läges-knappen för att stega mellan 1–3 (lampan blinkar ut läget).',
      'Launch: håll launch-knappen tills lampan blinkar, starta i 2:an eller 3:an.',
    ],
    fields: [
      { key: 'mode', label: 'Motorläge', options: ['1 Standard', '2 Mjuk', '3 Aggressiv'] },
      { key: 'launch', label: 'Launch control', options: onOff },
    ],
  },
  'honda-modes-tc': {
    title: 'Honda – 3 motorlägen + HSTC antispinn + launch',
    tool: 'Knappar på styret (+ GET WiFi-COM för finjustering)',
    summary: 'Tre motorlägen, antispinn HSTC i tre nivåer (eller av) och launch control.',
    steps: [
      'Motorläge och HSTC väljs med knapparna på vänster styrhalva.',
      'HSTC 1 = minst ingrepp, 3 = mest. Prova 1–2 på torrt, 3 i lera/hal lera.',
    ],
    fields: [
      { key: 'mode', label: 'Motorläge', options: ['1 Standard', '2 Mjuk', '3 Aggressiv'] },
      { key: 'tc', label: 'HSTC antispinn', options: ['Av', '1', '2', '3'] },
      { key: 'launch', label: 'Launch control', options: onOff },
    ],
  },
  'kawa-coupler': {
    title: 'Kawasaki – DFI-kontakter (couplers)',
    tool: 'Medföljande kontakter + KX FI Calibration Kit (tillbehör)',
    summary: 'Tre kontakter under sätet: standard, hård terräng (magrare/aggressivare) och mjuk terräng. Finjustering med KX FI Calibration Kit.',
    steps: [
      'Byt kontakt under sätet med tändningen av.',
      'Launch control (KLCM): tryck knappen på styret före start.',
    ],
    grid: grid3,
    fields: [
      { key: 'coupler', label: 'Kontakt', options: ['Standard (svart)', 'Hård terräng (vit)', 'Mjuk terräng (grön)'] },
      { key: 'launch', label: 'Launch control', options: onOff },
    ],
  },
  'kawa-app': {
    title: 'Kawasaki – Rideology The App KX',
    tool: 'Rideology The App KX (iOS/Android, trådlöst)',
    summary: 'Bränsle- och tändningsjustering i appen (motsvarar KX FI Calibration Kit), plus underhållslogg. Kontakterna finns kvar.',
    steps: [
      'Koppla upp telefonen mot cykeln i Rideology The App KX.',
      'För över värdena från rutnätet nedan till appens karta.',
    ],
    grid: yamahaGrid4,
    fields: [
      { key: 'coupler', label: 'Kontakt', options: ['Standard', 'Hård terräng', 'Mjuk terräng'] },
      { key: 'launch', label: 'Launch control', options: onOff },
    ],
  },
  'suzuki-coupler': {
    title: 'Suzuki – bränslekontakter',
    tool: 'Medföljande kontakter (mager/fet)',
    summary: 'Byt kontakt för magrare eller fetare mappning.',
    steps: ['Byt kontakt under sätet med tändningen av.'],
    fields: [{ key: 'coupler', label: 'Kontakt', options: ['Standard', 'Mager', 'Fet'] }],
  },
  'suzuki-shac': {
    title: 'Suzuki – kontakter + S-HAC startassistent',
    tool: 'Kontakter + MX-Tuner 2.0 (tillbehör)',
    summary: 'Kontakter för mager/fet, Suzuki Holeshot Assist Control (A = hårt underlag, B = halt) och MX-Tuner 2.0 för egna mappar.',
    steps: [
      'S-HAC: tryck knappen 1 gång = A, håll in = B. Släcks i 4:an eller efter tid.',
      'MX-Tuner 2.0 laddar upp egna kartor till kontakten.',
    ],
    grid: grid3,
    fields: [
      { key: 'coupler', label: 'Kontakt', options: ['Standard', 'Mager', 'Fet'] },
      { key: 'shac', label: 'S-HAC', options: ['Av', 'A', 'B'] },
    ],
  },
  'ktm-switch': {
    title: 'KTM / Husqvarna / GasGas – mappknapp, TC, launch',
    tool: 'Kombinationsknapp på styret',
    summary: 'Två mappar (1 standard, 2 aggressiv/progressiv), antispinn av/på och launch control. Ingen bränslekarta för användaren – den ändras hos handlaren.',
    steps: [
      'Mapp: tryck knappen med motorn igång – lampan visar 1 eller 2.',
      'TC: kort tryck på TC-knappen (lampan lyser = på).',
      'Launch: håll båda knapparna ~3 s tills lampan blinkar.',
    ],
    fields: [
      { key: 'map', label: 'Mapp', options: ['1', '2'] },
      { key: 'tc', label: 'Antispinn', options: onOff },
      { key: 'launch', label: 'Launch control', options: onOff },
    ],
  },
  'ktm-switch-cuo': {
    title: 'KTM / Husqvarna – knapp + quickshifter + Connectivity Unit',
    tool: 'Styrknapp + Connectivity Unit Offroad (CUO) med KTMconnect-appen',
    summary: 'Två mappar, TC, launch och quickshifter. Med CUO (tillbehör, standard på Factory Edition) kan du i appen ställa gassvar, motorbroms, TC-nivå, launch och välja förinställningar för sand/hårt/lera.',
    steps: [
      'Montera/para ihop CUO med KTMconnect-appen.',
      'PRIME = välj TC-nivå. ADVANCED = gassvar, motorbroms, TC, launch.',
      'Fyll i fälten nedan som din anteckning – de förs över för hand.',
    ],
    fields: [
      { key: 'map', label: 'Mapp', options: ['1', '2'] },
      { key: 'tc', label: 'Antispinn', options: ['Av', '1', '2', '3', '4', '5'] },
      { key: 'throttle', label: 'Gassvar (CUO)', options: ['Mjukt', 'Standard', 'Aggressivt'] },
      { key: 'ebrake', label: 'Motorbroms (CUO)', options: ['Låg', 'Standard', 'Hög'] },
      { key: 'qs', label: 'Quickshifter', options: onOff },
      { key: 'launch', label: 'Launch control', options: onOff },
      { key: 'preset', label: 'Underlag (CUO)', options: ['Standard', 'Sand', 'Grus', 'Hårt', 'Torrt', 'Blött'] },
    ],
  },
  'ktm-2t-tbi': {
    title: 'KTM-koncernen 2-takt med insprutning (TBI/TPI)',
    tool: 'Mappknapp på styret',
    summary: 'Två mappar (standard och mjukare/aggressivare beroende på modell). Bränslet anpassas automatiskt efter höjd och temperatur.',
    steps: ['Välj mapp med knappen på styret.'],
    fields: [{ key: 'map', label: 'Mapp', options: ['1', '2'] }],
  },
  'ktm-enduro': {
    title: 'KTM / Husqvarna / GasGas enduro 4-takt',
    tool: 'Mappknapp på styret',
    summary: 'Två mappar och antispinn (nyare modeller). Mappningen anpassas automatiskt.',
    steps: ['Mapp 1 = standard, 2 = mjukare/blöta förhållanden (beroende på modell).'],
    fields: [
      { key: 'map', label: 'Mapp', options: ['1', '2'] },
      { key: 'tc', label: 'Antispinn', options: onOff },
    ],
  },
  'beta-switch': {
    title: 'Beta – mappknapp',
    tool: 'Mappknapp på styret',
    summary: 'Två mappar (standard och "regn"/mjuk). Ingen användarkarta.',
    steps: ['Välj mapp med knappen på styret.'],
    fields: [{ key: 'map', label: 'Mapp', options: ['Standard', 'Mjuk / regn'] }],
  },
  'fantic-get': {
    title: 'Fantic – GET-elektronik',
    tool: 'GET-styrenhet + WiGET-appen (via GET WiFi-COM)',
    summary: 'Fantic använder GET-elektronik som kan justeras med WiGET-appen och GET:s WiFi-COM.',
    steps: ['Koppla in WiFi-COM och öppna WiGET.', 'Använd rutnätet nedan som anteckning.'],
    grid: grid3,
    fields: [{ key: 'map', label: 'Mapp', options: ['1', '2'] }],
  },
  'triumph-switch': {
    title: 'Triumph – mappknapp, TC och launch',
    tool: 'Knapp på styret',
    summary: 'Två motorlägen, antispinn och launch control från styret.',
    steps: ['Välj läge och TC med knappen på vänster sida.'],
    fields: [
      { key: 'map', label: 'Mapp', options: ['1', '2'] },
      { key: 'tc', label: 'Antispinn', options: onOff },
      { key: 'launch', label: 'Launch control', options: onOff },
    ],
  },
  'stark-app': {
    title: 'Stark Varg – telefon som display',
    tool: 'Stark-appen på den inbyggda Android-telefonen',
    summary: 'Effekt (hk), effektkurva, motorbroms och antispinn ställs i Stark-appen. Fem lägen sparas.',
    steps: ['Ställ läget i Stark-appen och skriv av värdena hit för att dela.'],
    fields: [
      { key: 'hp', label: 'Effekt', options: ['20 hk', '30 hk', '40 hk', '50 hk', '60 hk', '70 hk', '80 hk'] },
      { key: 'ebrake', label: 'Motorbroms', options: ['0', '1', '2', '3', '4', '5'] },
      { key: 'tc', label: 'Antispinn', options: ['Av', 'Låg', 'Medel', 'Hög'] },
    ],
  },
  'generic-efi': {
    title: 'Insprutning utan användarinställningar',
    summary: 'Ändringar görs med verkstadens verktyg eller eftermarknadsenhet.',
    steps: ['Använd fälten som anteckning.'],
    fields: [{ key: 'map', label: 'Mapp', options: ['Standard', 'Annan'] }],
  },
};

/** Färdiga utgångspunkter för Yamahas 4×4-rutnät (gas-rader × varv-kolumner). */
export const PRESETS: { name: string; fuel: number[][]; ign: number[][]; note: string }[] = [
  {
    name: 'Standard (allt 0)',
    fuel: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    ign: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    note: 'Fabriksmappen.',
  },
  {
    name: 'Mjuk – hala förhållanden',
    fuel: [[-2, -2, 0, 0], [-1, -1, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    ign: [[-2, -2, -1, 0], [-2, -1, 0, 0], [-1, 0, 0, 0], [0, 0, 0, 0]],
    note: 'Mindre tändning lågt ger snällare gaspådrag i lera och på hårt halt underlag.',
  },
  {
    name: 'Mer botten – djup sand/lös jord',
    fuel: [[2, 2, 1, 0], [2, 2, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0]],
    ign: [[2, 2, 1, 0], [2, 1, 1, 0], [1, 1, 0, 0], [0, 0, 0, 0]],
    note: 'Mer tändning och lite fetare lågt/mitt – piggare ur kurvor.',
  },
  {
    name: 'Överdrag – mer topp',
    fuel: [[0, 0, 0, 0], [0, 0, 1, 2], [0, 1, 2, 2], [0, 1, 2, 2]],
    ign: [[0, 0, 0, 0], [0, 0, 1, 1], [0, 1, 1, 2], [0, 1, 2, 2]],
    note: 'Längre varvregister. Lyssna efter spik – backa tändningen om det knackar.',
  },
];
