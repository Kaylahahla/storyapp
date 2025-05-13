import { openDB } from 'idb';

const DB_NAME = 'dicoding-story-db';
const STORE_NAME = 'stories';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { keyPath: 'id' });
  },
});

export const idbStory = {
  async save(story) {
    return (await dbPromise).put(STORE_NAME, story);
  },
  async getAll() {
    return (await dbPromise).getAll(STORE_NAME);
  },
  async delete(id) {
    return (await dbPromise).delete(STORE_NAME, id);
  }
};
