
import { AppState } from '../types';
import { STORAGE_KEY } from '../constants';

export const loadState = (): AppState | null => {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) return null;
    return JSON.parse(serializedState);
  } catch (err) {
    return null;
  }
};

export const saveState = (state: AppState) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch {
    // Ignore write errors
  }
};
