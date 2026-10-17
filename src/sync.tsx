import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Platform } from 'react-native';
import { SUPABASE_KEY, SUPABASE_URL } from './config';
import { emptyState, mergeStates, useStore, type State } from './store';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false },
});

type SyncStatus = 'av' | 'synkar' | 'synkad' | 'fel';

type Ctx = {
  session: Session | null;
  status: SyncStatus;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

const SyncCtx = createContext<Ctx | null>(null);

const svError = (msg: string) => {
  if (/invalid login/i.test(msg)) return 'Fel e-post eller lösenord.';
  if (/already registered|already exists/i.test(msg)) return 'Det finns redan ett konto med den e-posten – logga in i stället.';
  if (/at least 6|password should/i.test(msg)) return 'Lösenordet måste vara minst 6 tecken.';
  if (/invalid.*email|email.*invalid/i.test(msg)) return 'Kontrollera e-postadressen.';
  if (/fetch|network/i.test(msg)) return 'Ingen kontakt med servern – kontrollera täckningen.';
  return msg;
};

export function SyncProvider({ children }: { children: ReactNode }) {
  const { state, ready, replace } = useStore();
  const [session, setSession] = useState<Session | null>(null);
  const [status, setStatus] = useState<SyncStatus>('av');
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);
  const pushedAt = useRef(0); // updatedAt för senast uppladdade version
  const pulled = useRef(false);
  /** Vem som är inloggad just nu – svar som kommer efter utloggning/byte ignoreras. */
  const activeUser = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  const push = useCallback(async (s: State, userId: string) => {
    if (activeUser.current !== userId) return;
    setStatus('synkar');
    const { error } = await supabase.from('user_state').upsert({ user_id: userId, data: s, updated_at: new Date(s.updatedAt || Date.now()).toISOString() });
    if (activeUser.current !== userId) return;
    if (error) return setStatus('fel');
    pushedAt.current = s.updatedAt;
    setStatus('synkad');
  }, []);

  /** Hämta molnets version och slå ihop med den lokala. */
  const pull = useCallback(async (userId: string) => {
    if (activeUser.current !== userId) return;
    setStatus('synkar');
    const { data, error } = await supabase.from('user_state').select('data').eq('user_id', userId).maybeSingle();
    if (activeUser.current !== userId) return;
    if (error) return setStatus('fel');
    const local = stateRef.current;
    const remote = data?.data as State | undefined;
    const merged = remote ? mergeStates(local, { ...emptyState, ...remote }) : local;
    if (merged !== local) replace(merged);
    pulled.current = true;
    if (!remote || JSON.stringify(merged) !== JSON.stringify(remote)) await push(merged, userId);
    else { pushedAt.current = merged.updatedAt; setStatus('synkad'); }
  }, [push, replace]);

  // Inloggad + lokal data laddad → hämta från molnet.
  const userId = session?.user.id;
  useEffect(() => {
    activeUser.current = ready && userId ? userId : null;
    if (!ready || !userId) { pulled.current = false; return; }
    const first = setTimeout(() => pull(userId), 0);
    const onActive = () => pull(userId);
    const sub = AppState.addEventListener('change', (st) => st === 'active' && onActive());
    const onFocus = () => document.visibilityState === 'visible' && onActive();
    if (Platform.OS === 'web') document.addEventListener('visibilitychange', onFocus);
    return () => {
      clearTimeout(first);
      sub.remove();
      if (Platform.OS === 'web') document.removeEventListener('visibilitychange', onFocus);
    };
  }, [ready, userId, pull]);

  // Lokala ändringar → ladda upp efter en kort paus.
  useEffect(() => {
    if (!userId || !pulled.current || state.updatedAt <= pushedAt.current) return;
    const t = setTimeout(() => push(stateRef.current, userId), 1500);
    return () => clearTimeout(t);
  }, [state.updatedAt, userId, push]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    return error ? svError(error.message) : null;
  };
  const signUp = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password });
    if (error) return svError(error.message);
    if (data.user && data.user.identities?.length === 0) return svError('already registered');
    return null;
  };
  const signOut = async () => {
    // Ladda upp sista ändringarna innan vi tömmer telefonen.
    if (userId && state.updatedAt > pushedAt.current) await push(stateRef.current, userId);
    activeUser.current = null;
    await supabase.auth.signOut();
    pulled.current = false;
    pushedAt.current = 0;
    replace(emptyState);
  };

  return <SyncCtx.Provider value={{ session, status: userId ? status : 'av', signIn, signUp, signOut }}>{children}</SyncCtx.Provider>;
}

export function useSync() {
  const c = useContext(SyncCtx);
  if (!c) throw new Error('useSync utanför SyncProvider');
  return c;
}
