import type { EngineMap } from '../store';

// Delningsformat: en länk som också ryms i en QR-kod.
//   dialedmx://map?d=<urlkodad kompakt JSON>
// Samma JSON (med v:1) används i .dialedmx-filer.

type Packed = {
  v: 1;
  n: string;
  e: string;
  m?: string;
  f?: number[][];
  i?: number[][];
  s: Record<string, string>;
  t?: string;
  a?: string;
};

export function pack(map: EngineMap): string {
  const p: Packed = { v: 1, n: map.name, e: map.ecu, m: map.model, f: map.fuel, i: map.ign, s: map.settings, t: map.notes || undefined, a: map.author };
  return JSON.stringify(p);
}

export function toLink(map: EngineMap) {
  return `dialedmx://map?d=${encodeURIComponent(pack(map))}`;
}

/** Tar emot länk, QR-innehåll eller ren JSON. Returnerar null om det inte går att läsa. */
export function unpack(input: string): Omit<EngineMap, 'id' | 'created'> | null {
  let raw = input.trim();
  const i = raw.indexOf('?d=');
  if (i >= 0) raw = decodeURIComponent(raw.slice(i + 3));
  try {
    const p = JSON.parse(raw) as Packed;
    if (p.v !== 1 || typeof p.n !== 'string' || typeof p.e !== 'string') return null;
    const okGrid = (g: unknown) => Array.isArray(g) && g.every((r) => Array.isArray(r) && r.every((x) => typeof x === 'number'));
    return {
      name: p.n,
      ecu: p.e,
      model: p.m,
      fuel: okGrid(p.f) ? p.f : undefined,
      ign: okGrid(p.i) ? p.i : undefined,
      settings: p.s && typeof p.s === 'object' ? p.s : {},
      notes: p.t ?? '',
      author: p.a,
    };
  } catch {
    return null;
  }
}
