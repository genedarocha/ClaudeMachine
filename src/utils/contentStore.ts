// Content calendar storage. 50 days × 5 sites × 8 platforms is several MB of text, which is too close to
// localStorage's ~5MB limit, so entries live in IndexedDB (browser-local, per device, like the rest of
// this app's data). Every write broadcasts CALENDAR_EVENT so open screens can reload.

export type PlatformKey =
  | 'linkedin' | 'linkedinCompany' | 'x' | 'facebook' | 'tiktok' | 'youtube' | 'substack' | 'site';

export interface VideoPlan {
  hook: string;
  voiceover: string;
  scenes: { visual: string; onScreenText: string }[];
  aiVideoPrompt: string;
  renderedDataUrl?: string; // a video rendered by Produce Videos, stored as a data URL (small videos only)
}

export interface CalendarEntry {
  id: string;
  date: string; // YYYY-MM-DD
  siteId: string; // a site profile id, or 'newsletter'
  kind: 'daily' | 'newsletter' | 'agent';
  agentName?: string; // for kind 'agent': which Agency agent produced it
  title: string;
  pillar?: string;
  posts: Partial<Record<PlatformKey, string>>;
  video?: VideoPlan;
  article?: { title: string; body: string }; // for the site blog and Substack
  status: 'draft' | 'approved' | 'posted';
  postedUrls: Partial<Record<PlatformKey | 'newsletter', string>>;
  humanizerFlags?: Partial<Record<PlatformKey | 'article' | 'video', string[]>>;
  link?: string; // in-app link for newsletters (e.g. '#/newsletter')
  createdAt: number;
  updatedAt: number;
}

export const CALENDAR_EVENT = 'claude-machine-calendar-updated';

const DB_NAME = 'claude_machine';
const STORE = 'calendar';

const openDb = (): Promise<IDBDatabase> => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB_NAME, 1);
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains(STORE)) {
      const store = db.createObjectStore(STORE, { keyPath: 'id' });
      store.createIndex('date', 'date');
      store.createIndex('siteId', 'siteId');
    }
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error ?? new Error('Could not open the calendar database.'));
});

const tx = async <T>(mode: IDBTransactionMode, run: (store: IDBObjectStore) => IDBRequest<T> | void): Promise<T | undefined> => {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const store = t.objectStore(STORE);
    const req = run(store);
    t.oncomplete = () => resolve(req ? (req as IDBRequest<T>).result : undefined);
    t.onerror = () => reject(t.error ?? new Error('Calendar database error.'));
    t.onabort = () => reject(t.error ?? new Error('Calendar database write was aborted (storage full?).'));
  });
};

const notify = () => window.dispatchEvent(new Event(CALENDAR_EVENT));

export async function getAllEntries(): Promise<CalendarEntry[]> {
  const all = (await tx<CalendarEntry[]>('readonly', s => s.getAll())) ?? [];
  return all.sort((a, b) => a.date.localeCompare(b.date) || a.siteId.localeCompare(b.siteId));
}

export async function getEntry(id: string): Promise<CalendarEntry | undefined> {
  return tx<CalendarEntry>('readonly', s => s.get(id));
}

export async function putEntries(entries: CalendarEntry[]): Promise<void> {
  if (!entries.length) return;
  await tx('readwrite', s => {
    for (const e of entries) s.put({ ...e, updatedAt: Date.now() });
  });
  notify();
}

export async function updateEntry(id: string, patch: Partial<CalendarEntry>): Promise<void> {
  const current = await getEntry(id);
  if (!current) throw new Error('That calendar entry no longer exists.');
  await putEntries([{ ...current, ...patch }]);
}

export async function deleteEntries(ids: string[]): Promise<void> {
  if (!ids.length) return;
  await tx('readwrite', s => {
    for (const id of ids) s.delete(id);
  });
  notify();
}

export const entryLink = (id: string) => `${window.location.origin}${window.location.pathname}#/calendar/${encodeURIComponent(id)}`;

export const isoDate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const addDays = (iso: string, days: number) => {
  const d = new Date(`${iso}T12:00:00`);
  d.setDate(d.getDate() + days);
  return isoDate(d);
};
