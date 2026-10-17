import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { findModel, type ForkId, type ShockId } from './data/bikes';
import { isFrequent, serviceTemplate, type Src } from './data/service';
import type { Rider, Terrain } from './logic/suspension';

export type Clickers = {
  forkComp?: number;
  forkReb?: number;
  shockLsc?: number;
  shockHsc?: number;
  shockReb?: number;
};

export type Bike = {
  id: string;
  modelId: string;
  year: number;
  nickname?: string;
  fork: ForkId;
  shock: ShockId;
  /** Monterade fjädrar/tryck. Tomt = fabriksstandard. */
  forkSpring?: number;
  shockSpring?: number;
  airBar?: number;
  springsChanged?: boolean;
  /** Fabrikens standardklick (klick ut från helt stängd) från instruktionsboken. */
  stock: Clickers;
  hours: number;
  /** Starttid (ms) för pågående körning – timmarna läggs till när den stoppas. */
  rideStart?: number;
};

export type EngineMap = {
  id: string;
  name: string;
  bikeId?: string;
  ecu: string;
  model?: string; // t.ex. "Yamaha YZ450F 2024" för den som tar emot
  fuel?: number[][];
  ign?: number[][];
  settings: Record<string, string>;
  notes: string;
  created: number;
  author?: string;
};

export type SessionLog = {
  id: string;
  bikeId?: string;
  date: number;
  track: string;
  terrain: Terrain;
  setup: string;
  rating: number;
  notes: string;
};

export type Service = {
  id: string;
  bikeId: string;
  key?: string;
  name: string;
  what?: string;
  intervalH?: number;
  months?: number;
  once?: boolean;
  done?: boolean;
  src?: Src;
  lastH: number;
  lastDate?: number;
};

export type ServiceLog = { id: string; bikeId: string; name: string; date: number; hours: number; note?: string };

export type State = {
  rider: Rider & { name: string };
  bikes: Bike[];
  activeBikeId?: string;
  maps: EngineMap[];
  logs: SessionLog[];
  services: Service[];
  serviceLog: ServiceLog[];
  /** Senaste lokala ändring (ms) – används vid synk. */
  updatedAt: number;
  /** Id:n på borttagna poster så att de inte kommer tillbaka vid synk. */
  deleted: string[];
};

const KEY = 'mxex:v1';

const initial: State = {
  rider: { name: '', weightKg: 80, skill: 'motionär', discipline: 'motocross' },
  bikes: [],
  maps: [],
  logs: [],
  services: [],
  serviceLog: [],
  updatedAt: 0,
  deleted: [],
};

const COLLECTIONS = ['bikes', 'maps', 'logs', 'services', 'serviceLog'] as const;

/** Id:n som fanns före men inte efter en ändring. */
function removedIds(before: State, after: State): string[] {
  const out: string[] = [];
  for (const c of COLLECTIONS) {
    const now = new Set((after[c] as { id: string }[]).map((x) => x.id));
    for (const x of before[c] as { id: string }[]) if (!now.has(x.id)) out.push(x.id);
  }
  return out;
}

/** Slår ihop två versioner: nyaste vinner per post, borttagna poster hålls borta. */
export function mergeStates(a: State, b: State): State {
  const [newer, older] = a.updatedAt >= b.updatedAt ? [a, b] : [b, a];
  const deleted = Array.from(new Set([...(a.deleted ?? []), ...(b.deleted ?? [])])).slice(-2000);
  const gone = new Set(deleted);
  const out: State = { ...initial, ...older, ...newer, deleted, updatedAt: Math.max(a.updatedAt, b.updatedAt) };
  for (const c of COLLECTIONS) {
    const byId = new Map<string, { id: string }>();
    for (const x of (older[c] ?? []) as { id: string }[]) byId.set(x.id, x);
    for (const x of (newer[c] ?? []) as { id: string }[]) byId.set(x.id, x);
    (out as Record<string, unknown>)[c] = [...byId.values()].filter((x) => !gone.has(x.id));
  }
  return out;
}

type Ctx = {
  state: State;
  ready: boolean;
  /** Användarens ändringar – stämplas med tid för synk. */
  update: (fn: (s: State) => State) => void;
  /** Ersätter state utan att räknas som lokal ändring (används av synken). */
  replace: (s: State) => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) {
          const saved = JSON.parse(raw);
          // Nivån "van" heter numera "avancerad".
          if (saved.rider?.skill === 'van') saved.rider.skill = 'avancerad';
          setState({ ...initial, ...saved, deleted: saved.deleted ?? [], updatedAt: saved.updatedAt ?? 0 });
        }
      })
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<Ctx>(
    () => ({
      state,
      ready,
      update: (fn) =>
        setState((s) => {
          const next = fn(s);
          if (next === s) return s;
          const gone = removedIds(s, next);
          return { ...next, updatedAt: Date.now(), deleted: gone.length ? [...s.deleted, ...gone] : next.deleted };
        }),
      replace: (s) => setState(s),
    }),
    [state, ready],
  );
  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error('useStore utanför StoreProvider');
  return c;
}

export function useActiveBike(): Bike | undefined {
  const { state } = useStore();
  return state.bikes.find((b) => b.id === state.activeBikeId) ?? state.bikes[0];
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/** Serviceposter från tillverkarens schema för en cykel. */
export function servicesFor(bike: Pick<Bike, 'id' | 'modelId' | 'year' | 'hours'>): Service[] {
  const m = findModel(bike.modelId);
  if (!m) return [];
  return serviceTemplate(m, bike.year).items.filter((it) => !(it.once && bike.hours >= (it.intervalH ?? 0))).map((it) => ({
    id: uid(),
    bikeId: bike.id,
    key: it.key,
    name: it.name,
    what: it.what,
    intervalH: it.intervalH,
    months: it.months,
    once: it.once,
    src: it.src,
    // Vanlig service antas nyss gjord. Större service vet vi inte – då frågar appen när intervallet passerats.
    lastH: isFrequent(it) ? bike.hours : 0,
    lastDate: Date.now(),
  }));
}

export type Due = { left?: number; daysLeft?: number; level: 'over' | 'soon' | 'ok' | 'done' };

/** Hur nära en servicepost är (timmar och/eller månader – det som kommer först). */
export function dueOf(x: Service, hours: number, now = Date.now()): Due {
  if (x.once && x.done) return { level: 'done' };
  const left = x.intervalH != null ? (x.once ? x.intervalH - hours : x.intervalH - (hours - x.lastH)) : undefined;
  const daysLeft = x.months != null ? Math.round(((x.lastDate ?? now) + x.months * 30.44 * 864e5 - now) / 864e5) : undefined;
  const over = (left != null && left <= 0) || (daysLeft != null && daysLeft <= 0);
  const soon = (left != null && x.intervalH != null && left <= Math.max(1, x.intervalH * 0.2)) || (daysLeft != null && daysLeft <= 30);
  return { left, daysLeft, level: over ? 'over' : soon ? 'soon' : 'ok' };
}

/** Tomt utgångsläge (t.ex. efter utloggning). */
export const emptyState: State = initial;
