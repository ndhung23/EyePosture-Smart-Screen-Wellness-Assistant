import { ReminderEvent, ReminderType } from '@eyeposture/shared-types';

export interface AlertHistoryItem {
  id: string;
  profileId: string;
  type: ReminderType;
  title: string;
  message: string;
  severity: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  state: 'ACTIVE_WARNING' | 'RESOLVED' | 'SKIPPED';
  timestamp: number;
  date: string; // YYYY-MM-DD
  timeStr: string; // HH:mm
}

const STORAGE_PREFIX = 'eyeposture_alert_history_';

// Tạo dữ liệu lịch sử mẫu thực tế cho các ngày gần đây để người dùng có số liệu trực quan ngay
function generateInitialHistory(profileId: string): AlertHistoryItem[] {
  const items: AlertHistoryItem[] = [];
  const now = Date.now();
  const oneDayMs = 86400000;

  const sampleEvents = [
    { type: 'POSTURE' as ReminderType, title: 'Cảnh báo tư thế: Gù lưng', message: 'Phát hiện lưng cong và đầu cúi thấp quá 15 độ. Hãy ngồi thẳng lưng!', severity: 'HIGH' as const, state: 'RESOLVED' as const },
    { type: 'DISTANCE' as ReminderType, title: 'Cảnh báo khoảng cách màn hình', message: 'Bạn đang ngồi quá gần màn hình (<45cm). Vui lòng điều chỉnh lại cự ly.', severity: 'HIGH' as const, state: 'RESOLVED' as const },
    { type: 'EYE_BREAK' as ReminderType, title: 'Nhắc nhở nghỉ mắt 20-20-20', message: 'Đã 20 phút làm việc liên tục. Hãy nhìn xa 20 feet trong 20 giây.', severity: 'NORMAL' as const, state: 'RESOLVED' as const },
    { type: 'HYDRATION' as ReminderType, title: 'Nhắc nhở bổ sung nước', message: 'Đã 60 phút bạn chưa uống nước. Hãy uống 1 cốc nước để duy trì năng lượng.', severity: 'LOW' as const, state: 'RESOLVED' as const },
    { type: 'BLINK_REMINDER' as ReminderType, title: 'Nhắc nhở chớp mắt thư giãn', message: 'Tỷ lệ chớp mắt đang giảm thấp (<10 lần/phút). Hãy chớp mắt chậm và sâu.', severity: 'LOW' as const, state: 'RESOLVED' as const },
    { type: 'POSTURE' as ReminderType, title: 'Cảnh báo nghiêng đầu lệch', message: 'Đầu đang nghiêng sang một bên liên tục. Hãy cân bằng lại tư thế cổ.', severity: 'NORMAL' as const, state: 'RESOLVED' as const },
    { type: 'DISTANCE' as ReminderType, title: 'Cảnh báo cự ly mắt gần', message: 'Khoảng cách đến màn hình chỉ còn 38cm, dễ gây mỏi cơ điều tiết mắt.', severity: 'HIGH' as const, state: 'SKIPPED' as const },
    { type: 'EYE_BREAK' as ReminderType, title: 'Đã đến giờ nghỉ ngơi mắt', message: 'Quy tắc 20-20-20 giúp giảm căng thẳng thị giác máy tính.', severity: 'NORMAL' as const, state: 'RESOLVED' as const },
    { type: 'SCREEN_TIME' as ReminderType, title: 'Cảnh báo thời gian màn hình', message: 'Bạn đã ngồi máy tính hơn 3 giờ liên tục. Hãy đứng dậy vươn vai.', severity: 'URGENT' as const, state: 'RESOLVED' as const },
  ];

  // Trải đều 7 ngày qua
  for (let dayOffset = 0; dayOffset <= 6; dayOffset++) {
    const dayDate = new Date(now - dayOffset * oneDayMs);
    const dateStr = dayDate.toISOString().slice(0, 10);
    const eventCount = dayOffset === 0 ? 5 : Math.floor(Math.random() * 4) + 3;

    for (let i = 0; i < eventCount; i++) {
      const sample = sampleEvents[(dayOffset * 3 + i) % sampleEvents.length];
      const hour = 8 + (i * 2) + Math.floor(Math.random() * 2);
      const minute = Math.floor(Math.random() * 59);
      const itemTimestamp = new Date(dayDate.getFullYear(), dayDate.getMonth(), dayDate.getDate(), hour, minute).getTime();

      items.push({
        id: `alert_${dateStr}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        profileId,
        type: sample.type,
        title: sample.title,
        message: sample.message,
        severity: sample.severity,
        state: dayOffset === 0 && i === 0 ? 'ACTIVE_WARNING' : sample.state,
        timestamp: itemTimestamp,
        date: dateStr,
        timeStr: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
      });
    }
  }

  // Sắp xếp giảm dần theo thời gian (mới nhất lên đầu)
  return items.sort((a, b) => b.timestamp - a.timestamp);
}

export class AlertHistoryService {
  public static getAlertHistory(profileId: string = 'default'): AlertHistoryItem[] {
    try {
      const key = `${STORAGE_PREFIX}${profileId}`;
      const raw = localStorage.getItem(key);
      if (raw) {
        return JSON.parse(raw);
      }
      const initial = generateInitialHistory(profileId);
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    } catch {
      return generateInitialHistory(profileId);
    }
  }

  public static recordAlert(
    event: ReminderEvent,
    title: string,
    message: string,
    profileId: string = 'default'
  ): void {
    try {
      const key = `${STORAGE_PREFIX}${profileId}`;
      const current = AlertHistoryService.getAlertHistory(profileId);
      const now = new Date(event.timestamp || Date.now());
      const dateStr = now.toISOString().slice(0, 10);
      const hour = String(now.getHours()).padStart(2, '0');
      const min = String(now.getMinutes()).padStart(2, '0');

      const newItem: AlertHistoryItem = {
        id: event.id || `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        profileId,
        type: event.type,
        title: title || 'Cảnh báo hệ thống',
        message: message || '',
        severity: event.priority || 'NORMAL',
        state: event.state === 'RESOLVED' ? 'RESOLVED' : 'ACTIVE_WARNING',
        timestamp: event.timestamp || Date.now(),
        date: dateStr,
        timeStr: `${hour}:${min}`,
      };

      // Đẩy vào đầu danh sách (giới hạn 500 bản ghi mới nhất)
      const updated = [newItem, ...current].slice(0, 500);
      localStorage.setItem(key, JSON.stringify(updated));

      // Phát sự kiện để cập nhật UI nếu đang mở trang thống kê
      window.dispatchEvent(new CustomEvent('eyeposture:alert_recorded', { detail: newItem }));
    } catch (err) {
      console.warn('[AlertHistoryService] Failed to record alert:', err);
    }
  }

  public static clearHistory(profileId: string = 'default'): void {
    try {
      const key = `${STORAGE_PREFIX}${profileId}`;
      localStorage.removeItem(key);
      window.dispatchEvent(new CustomEvent('eyeposture:alert_recorded', { detail: null }));
    } catch {}
  }
}
