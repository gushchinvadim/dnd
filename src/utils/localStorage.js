const STORAGE_KEY = 'taskBoardState';

export function loadState() {
  try {
    const serializedState = localStorage.getItem(STORAGE_KEY);
    if (serializedState === null) {
      return {
        columns: {
          todo: { id: 'todo', title: 'To Do', cardIds: [] },
          'in-progress': { id: 'in-progress', title: 'In Progress', cardIds: [] },
          done: { id: 'done', title: 'Done', cardIds: [] },
        },
        cards: {},
      };
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error('Failed to load state from localStorage', err);
    return {
      columns: {
        todo: { id: 'todo', title: 'To Do', cardIds: [] },
        'in-progress': { id: 'in-progress', title: 'In Progress', cardIds: [] },
        done: { id: 'done', title: 'Done', cardIds: [] },
      },
      cards: {},
    };
  }
}

export function saveState(state) {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serializedState);
  } catch (err) {
    console.error('Failed to save state to localStorage', err);
  }
}

export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
