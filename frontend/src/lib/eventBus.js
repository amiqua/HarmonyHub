class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach((callback) => {
      try {
        callback(data);
      } catch (err) {
        console.error(`Error in event listener for ${event}:`, err);
      }
    });
  }

  clear(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

export const eventBus = new EventBus();

// Event names constants to prevent typos
export const EVENTS = {
  AUTH_LOGIN: "auth:login",
  AUTH_LOGOUT: "auth:logout",
  AUTH_TOKEN_REFRESH: "auth:token-refresh",
  SONG_PLAY: "song:play",
  SONG_PAUSE: "song:pause",
  SONG_ENDED: "song:ended",
  PLAYLIST_CREATED: "playlist:created",
  PLAYLIST_UPDATED: "playlist:updated",
  PLAYLIST_DELETED: "playlist:deleted",
  HISTORY_UPDATED: "history:updated",
  FAVORITE_ADDED: "favorite:added",
  FAVORITE_REMOVED: "favorite:removed",
};
