// Notifications service using localStorage
// This stores notifications locally in the browser

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: number; // timestamp
  link?: string; // Optional link to navigate
}

const NOTIFICATIONS_KEY = 'saveklick_notifications';
const LEGACY_NOTIFICATIONS_KEY = 'coupachu_notifications';

function migrateAndRebrand(notifications: Notification[]): Notification[] {
  return notifications.map((n) => ({
    ...n,
    title: n.title.replace(/COUPACHU/gi, 'SaveKlick').replace(/Coupachu/g, 'SaveKlick'),
    message: n.message.replace(/COUPACHU/gi, 'SaveKlick').replace(/Coupachu/g, 'SaveKlick'),
  }));
}

// Get all notifications
export function getNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];

  try {
    let stored = localStorage.getItem(NOTIFICATIONS_KEY);
    if (!stored) {
      const legacy = localStorage.getItem(LEGACY_NOTIFICATIONS_KEY);
      if (legacy) {
        const migrated = migrateAndRebrand(JSON.parse(legacy) as Notification[]);
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(migrated));
        localStorage.removeItem(LEGACY_NOTIFICATIONS_KEY);
        return migrated;
      }
      return [];
    }

    const raw = JSON.parse(stored) as Notification[];
    const parsed = migrateAndRebrand(raw);
    if (JSON.stringify(raw) !== JSON.stringify(parsed)) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
}

// Add notification
export function addNotification(notification: Omit<Notification, 'id' | 'createdAt' | 'read'>): void {
  if (typeof window === 'undefined') return;

  try {
    const notifications = getNotifications();
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      read: false,
      createdAt: Date.now()
    };

    notifications.unshift(newNotification); // Add to beginning

    // Keep only last 50 notifications
    const limited = notifications.slice(0, 50);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(limited));

    // Dispatch custom event for real-time updates
    window.dispatchEvent(new CustomEvent('notificationAdded', { detail: newNotification }));
  } catch (error) {
    console.error('Error adding notification:', error);
  }
}

// Mark notification as read
export function markAsRead(notificationId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const notifications = getNotifications();
    const updated = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));

    window.dispatchEvent(new CustomEvent('notificationUpdated'));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

// Mark all as read
export function markAllAsRead(): void {
  if (typeof window === 'undefined') return;

  try {
    const notifications = getNotifications();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(updated));

    window.dispatchEvent(new CustomEvent('notificationUpdated'));
  } catch (error) {
    console.error('Error marking all as read:', error);
  }
}

// Delete notification
export function deleteNotification(notificationId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const notifications = getNotifications();
    const filtered = notifications.filter(n => n.id !== notificationId);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(filtered));

    window.dispatchEvent(new CustomEvent('notificationUpdated'));
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
}

// Get unread count
export function getUnreadCount(): number {
  const notifications = getNotifications();
  return notifications.filter(n => !n.read).length;
}

// Initialize with sample notifications (optional)
export function initializeSampleNotifications(): void {
  if (typeof window === 'undefined') return;

  const existing = getNotifications();
  if (existing.length === 0) {
    addNotification({
      title: 'Welcome to SaveKlick!',
      message: 'Discover amazing deals and save money with our exclusive coupons.',
      type: 'info'
    });
  }
}

