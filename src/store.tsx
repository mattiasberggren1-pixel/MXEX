import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { ForkId, ShockId } from './data/bikes';
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

export type Service = { id: string; bikeId: string; name: string; intervalH: number; lastH: number };

export type State = {
  rider: Rider & { name: string };
  bikes: Bike[];
  activeBikeId?: string;
  maps: EngineMap[];
  logs: SessionLog[];
  services: Service[];
};

const KEY = 'dialedmx:v1';

const initial: State = {
  rider: { name: '', weightKg: 80, skill: 'motionär', discipline: 'motocross' },
  bikes: [],
  maps: [],
  logs: [],
  services: [],
};

type Ctx = {
  state: State;
  ready: boolean;
  update: (fn: (s: State) => State) => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(initial);
  const [ready, setReady] = useState(false);
  const loaded = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setState({ ...initial, ...JSON.parse(raw) });
      })
      .finally(() => {
        loaded.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const value = useMemo<Ctx>(() => ({ state, ready, update: (fn) => setState((s) => fn(s)) }), [state, ready]);
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

/** Standardintervall i timmar – kan ändras per cykel. */
export const DEFAULT_SERVICES: { name: string; intervalH: number }[] = [
  { name: 'Motorolja + filter', intervalH: 10 },
  { name: 'Luftfilter (tvätt)', intervalH: 2 },
  { name: 'Gaffelolja / service', intervalH: 30 },
  { name: 'Stötdämparservice', intervalH: 30 },
  { name: 'Kolv (4-takt 450)', intervalH: 50 },
  { name: 'Ventiljustering, kontroll', intervalH: 15 },
  { name: 'Kedja & drev, kontroll', intervalH: 5 },
];
