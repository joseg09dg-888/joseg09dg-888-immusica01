import { EventEmitter } from 'events';

class AppEventEmitter extends EventEmitter {}

export const appEvents = new AppEventEmitter();

// Event names
export const EVENTS = {
  TRACK_PUBLISHED: 'track:published',
  ROYALTY_PROCESSED: 'royalty:processed',
  XP_GAINED: 'xp:gained',
  ACHIEVEMENT_UNLOCKED: 'achievement:unlocked',
  BUG_DETECTED: 'bug:detected',
};
