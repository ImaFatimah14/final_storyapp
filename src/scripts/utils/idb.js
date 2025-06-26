import { openDB } from 'idb';

const DB_NAME = 'story-app-db';
const DB_VERSION = 1;
const STORE_NAME = 'saved-stories';

const dbPromise = openDB(DB_NAME, DB_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: 'id' });
    }
  },
});

export const SavedStoryDB = {
  async getAll() {
    return (await dbPromise).getAll(STORE_NAME);
  },

  async get(id) {
    return (await dbPromise).get(STORE_NAME, id);
  },

  async put(story) {
    return (await dbPromise).put(STORE_NAME, story);
  },

  async delete(id) {
    return (await dbPromise).delete(STORE_NAME, id);
  },
};
