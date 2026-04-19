export type AppNotificationAudience = 'buyer' | 'merchant' | 'all';
export type AppNotificationType = 'success' | 'info' | 'warning';

export interface AppNotification {
  id: string;
  type: AppNotificationType;
  title: string;
  message: string;
  time: string;
  read: boolean;
  audience: AppNotificationAudience;
}

const STORAGE_KEY = 'kithly_notifications';
const EVENT_KEY = 'kithly_notifications_updated';

const defaultNotifications: AppNotification[] = [
  {
    id: 'seed-1',
    type: 'info',
    title: 'Welcome to KithLy',
    message: 'Your updates and gift events will appear here.',
    time: 'Just now',
    read: false,
    audience: 'all',
  },
];

function nowLabel(): string {
  return 'Just now';
}

export function getNotifications(): AppNotification[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultNotifications;
    const parsed = JSON.parse(raw) as AppNotification[];
    return Array.isArray(parsed) ? parsed : defaultNotifications;
  } catch {
    return defaultNotifications;
  }
}

export function setNotifications(notifications: AppNotification[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
  window.dispatchEvent(new CustomEvent(EVENT_KEY));
}

export function pushNotification(input: Omit<AppNotification, 'id' | 'time' | 'read'>): void {
  const existing = getNotifications();
  const next: AppNotification = {
    id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    time: nowLabel(),
    read: false,
    ...input,
  };
  setNotifications([next, ...existing]);
}

export function markAllNotificationsRead(): void {
  const next = getNotifications().map((n) => ({ ...n, read: true }));
  setNotifications(next);
}

export function subscribeNotifications(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVENT_KEY, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT_KEY, handler);
    window.removeEventListener('storage', handler);
  };
}

export function getUnreadCount(audience?: AppNotificationAudience): number {
  return getNotifications().filter((n) => {
    const audienceMatch = !audience || n.audience === audience || n.audience === 'all';
    return audienceMatch && !n.read;
  }).length;
}
