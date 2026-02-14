const STORAGE_KEY = 'taskBoardState_v2';

export class TaskStore {
  constructor() {
    this.state = this.loadState();
  }

  loadState() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data
        ? JSON.parse(data)
        : {
            columns: {
              todo: { id: 'todo', title: 'To Do', cardIds: [] },
              'in-progress': {
                id: 'in-progress',
                title: 'In Progress',
                cardIds: [],
              },
              done: { id: 'done', title: 'Done', cardIds: [] },
            },
            cards: {},
          };
    } catch (error) {
      console.error('Failed to load state', error);
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

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (error) {
      console.error('Failed to save state', error);
    }
  }

  addCard(content, columnId) {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.state.cards[id] = { id, content };
    this.state.columns[columnId].cardIds.push(id);
    this.saveState();
    return id;
  }

  deleteCard(cardId) {
    // Удаляем из всех колонок
    Object.values(this.state.columns).forEach(column => {
      column.cardIds = column.cardIds.filter(id => id !== cardId);
    });
    delete this.state.cards[cardId];
    this.saveState();
  }

  moveCard(cardId, targetColumnId, newPosition) {
    // Находим исходную колонку
    const sourceColumn = Object.values(this.state.columns).find(column =>
      column.cardIds.includes(cardId)
    );

    if (sourceColumn) {
      sourceColumn.cardIds = sourceColumn.cardIds.filter(id => id !== cardId);
    }

    // Вставляем в новую позицию
    const targetColumn = this.state.columns[targetColumnId];
    targetColumn.cardIds.splice(newPosition, 0, cardId);

    this.saveState();
  }

  getState() {
    return { ...this.state };
  }
}
