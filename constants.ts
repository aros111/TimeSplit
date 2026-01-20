
import { Category, SleepSettings } from './types';

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'cat-work', name: 'Work', icon: '💼', color: '#E1E8ED' },
  { id: 'cat-commute', name: 'Commute', icon: '🚲', color: '#DEE2E6' },
  { id: 'cat-walk', name: 'Walking', icon: '🚶', color: '#F1F3F5' },
  { id: 'cat-break', name: 'Break', icon: '☕', color: '#FFF5F5' },
  { id: 'cat-sleep', name: 'Sleep', icon: '🌙', color: '#F3F0FF' },
  { id: 'cat-house', name: 'Household', icon: '🏠', color: '#E3FAFC' },
  { id: 'cat-social', name: 'Social Media', icon: '📱', color: '#EBFBEE' },
  { id: 'cat-other', name: 'Other', icon: '✨', color: '#FFF9DB' },
];

export const DEFAULT_RESET_HOUR = 4;

export const DEFAULT_SLEEP_SETTINGS: SleepSettings = {
  nightStartHour: 21,
  nightEndHour: 10,
  minGapHours: 3,
};


export const STORAGE_KEY = 'timesplit_data_v1';
