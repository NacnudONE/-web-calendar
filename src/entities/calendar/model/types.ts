export interface Calendar {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  isVisible: boolean;
}

export type RepeatRule = 'none' | 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'daytime'

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  calendarId: string;
  isDone?: boolean;
  allDay?: boolean;
  repeat?: RepeatRule;
}