export type ReminderType = 
  | 'EYE_BREAK'
  | 'HYDRATION'
  | 'POSTURE'
  | 'DISTANCE'
  | 'SCREEN_TIME'
  | 'CUSTOM';

export type ReminderState = 
  | 'NORMAL'
  | 'WARNING'
  | 'ACTIVE_WARNING'
  | 'RESOLVED'
  | 'COOLDOWN';

export type ReminderPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface ReminderEvent {
  id: string;
  type: ReminderType;
  state: ReminderState;
  priority: ReminderPriority;
  titleKey: string;
  messageKey: string;
  payload?: Record<string, string | number>;
  timestamp: number;
  cooldownUntil?: number;
  canSnooze: boolean;
  snoozeSeconds?: number;
}

export interface ReminderStateTransition {
  reminderType: ReminderType;
  fromState: ReminderState;
  toState: ReminderState;
  reason: string;
  timestamp: number;
}
