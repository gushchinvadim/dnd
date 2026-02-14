import './css/style.css';
import { TaskStore } from './store.js';

const store = new TaskStore();
let draggedCard = null;
let placeholder = null;

let modal = null;
let targetColumnId = null;

// Инициализация доски
renderBoard();

// Обработчики кликов
document.addEventListener('click', event => {
  if (event.target.matches('[data-add-card-btn]')) {
    event.stopPropagation();
    const columnElement = event.target.closest('.column');
    targetColumnId = columnElement.dataset.columnId;
    openModal();
  }

  if (event.target.matches('[data-delete-btn]')) {
    event.stopPropagation();
    const cardElement = event.target.closest('.card');
    const cardId = cardElement.dataset.cardId;
    store.deleteCard(cardId);
    renderBoard();
  }

  if (event.target.matches('[data-modal-add]')) {
    addCardFromModal();
  }

  if (event.target.matches('[data-modal-cancel]') || event.target.matches('.modal-overlay')) {
    closeModal();
  }
});

// Drag & Drop события
document.addEventListener('dragstart', event => {
  if (event.target.classList.contains('card')) {
    draggedCard = event.target;

    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', draggedCard.dataset.cardId);

    // Визуальная обратная связь
    requestAnimationFrame(() => {
      draggedCard.classList.add('dragging');
    });
  }
});

document.addEventListener('dragover', event => {
  event.preventDefault();
  event.dataTransfer.dropEffect = 'move';

  const cardsContainer = event.target.closest('.cards-container');
  if (!cardsContainer || !draggedCard) return;

  // Удаляем старый placeholder
  if (placeholder) {
    placeholder.remove();
    placeholder = null;
  }

  // Создаём новый placeholder
  placeholder = document.createElement('div');
  placeholder.className = 'placeholder';

  // Определяем позицию вставки
  const cards = Array.from(cardsContainer.children).filter(el => el.classList.contains('card'));

  let insertBefore = null;
  for (const card of cards) {
    const rect = card.getBoundingClientRect();
    const middleY = rect.top + rect.height / 2;
    if (event.clientY < middleY) {
      insertBefore = card;
      break;
    }
  }

  if (insertBefore) {
    cardsContainer.insertBefore(placeholder, insertBefore);
  } else {
    cardsContainer.appendChild(placeholder);
  }
});

document.addEventListener('dragend', () => {
  if (draggedCard) {
    draggedCard.classList.remove('dragging');
    draggedCard = null;
  }
  if (placeholder) {
    placeholder.remove();
    placeholder = null;
  }
});

document.addEventListener('drop', event => {
  event.preventDefault();
  if (!draggedCard || !placeholder) return;

  const cardId = draggedCard.dataset.cardId;
  const targetColumn = event.target.closest('.column');
  const targetColumnIdDrop = targetColumn.dataset.columnId;

  // Определяем позицию вставки
  const cardsContainer = targetColumn.querySelector('.cards-container');
  const cards = Array.from(cardsContainer.children).filter(el => el.classList.contains('card'));

  let newPosition = cards.length;
  for (let i = 0; i < cards.length; i += 1) {
    if (cards[i] === placeholder.nextElementSibling) {
      newPosition = i;
      break;
    }
  }

  store.moveCard(cardId, targetColumnIdDrop, newPosition);
  renderBoard();
});

// Функции рендеринга
function renderBoard() {
  const state = store.getState();

  Object.values(state.columns).forEach(column => {
    const container = document.querySelector(
      `[data-column-id="${column.id}"] [data-cards-container]`
    );
    if (!container) return;

    container.innerHTML = '';

    column.cardIds.forEach(cardId => {
      const card = state.cards[cardId];
      if (!card) return;

      const cardElement = createCardElement(card);
      container.appendChild(cardElement);
    });
  });
}

function createCardElement(card) {
  const cardElement = document.createElement('div');
  cardElement.className = 'card';
  cardElement.draggable = true;
  cardElement.dataset.cardId = card.id;

  // Заголовок карточки
  const content = document.createElement('div');
  content.className = 'card-content';
  content.textContent = card.content;

  // Футер карточки
  const footer = document.createElement('div');
  footer.className = 'card-footer';

  const footerLeft = document.createElement('div');
  footerLeft.className = 'card-footer-left';

  const commentIcon = document.createElement('div');
  commentIcon.className = 'card-footer-icon';
  commentIcon.innerHTML = '💬';
  commentIcon.title = 'Comments';

  const commentCount = document.createElement('span');
  commentCount.className = 'comment-count';
  commentCount.textContent = card.comments ? card.comments.length : '0';

  commentIcon.appendChild(commentCount);
  footerLeft.appendChild(commentIcon);

  const attachmentIcon = document.createElement('div');
  attachmentIcon.className = 'card-footer-icon';
  attachmentIcon.innerHTML = '📎';
  attachmentIcon.title = 'Attachments';

  const attachmentCount = document.createElement('span');
  attachmentCount.className = 'attachment-count';
  attachmentCount.textContent = card.attachments ? card.attachments.length : '0';

  attachmentIcon.appendChild(attachmentCount);
  footerLeft.appendChild(attachmentIcon);

  const footerRight = document.createElement('div');
  footerRight.className = 'card-footer-right';

  // В функции createCardElement заменяем:
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.dataset.deleteBtn = '';
  // Убираем: deleteBtn.innerHTML = '&#xE951;';
  // Добавляем: ничего не нужно, т.к. крестик теперь через CSS

  footerRight.appendChild(deleteBtn);

  footer.appendChild(footerLeft);
  footer.appendChild(footerRight);

  // Добавляем элементы в карточку
  cardElement.appendChild(content);
  cardElement.appendChild(footer);

  return cardElement;
}

// Модальное окно
function openModal() {
  modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal">
      <h3 class="modal-title">Add a card</h3>
      <textarea class="modal-textarea" placeholder="Enter card title..." data-modal-input></textarea>
      <div class="modal-actions">
        <button class="modal-btn modal-btn--secondary" data-modal-cancel>Cancel</button>
        <button class="modal-btn modal-btn--primary" data-modal-add>Add Card</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  modal.querySelector('[data-modal-input]').focus();
}

function closeModal() {
  if (modal) {
    modal.remove();
    modal = null;
  }
}

function addCardFromModal() {
  const textarea = modal.querySelector('[data-modal-input]');
  const content = textarea.value.trim();
  if (content) {
    store.addCard(content, targetColumnId);
    renderBoard();
    closeModal();
  }
}

// Горячие клавиши
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && modal) {
    closeModal();
  }

  if (modal && event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
    addCardFromModal();
  }
});
