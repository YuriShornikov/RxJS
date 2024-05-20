import { interval } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { ajax } from 'rxjs/ajax';

// URL для запроса
const url = 'http://localhost:3000/messages/unread';

// Интервал опроса в миллисекундах
const pollingInterval = 5000;

// Функция для получения даты в формате ЧЧ:ММ ДД.ММ.ГГГГ
const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${hours}:${minutes} ${day}.${month}.${year}`;
};

// Функция для сокращения темы сообщения
const truncateSubject = (subject) => {
  return subject.length > 15 ? subject.slice(0, 15) + '...' : subject;
};

// Функция для обработки новых сообщений
const processMessages = (messages) => {
  const tableBody = document.querySelector('#messages-table tbody');
  messages.forEach(message => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${truncateSubject(message.subject)}</td>
      <td>${message.from}</td>
      <td>${formatDate(message.received)}</td>
    `;
    tableBody.insertBefore(row, tableBody.firstChild);
  });
};

// Создаем поток для периодического опроса сервера
const messagePolling$ = interval(pollingInterval).pipe(
  switchMap(() => 
    ajax.getJSON(url).pipe(
      catchError(() => {
        // Обработка ошибок, возвращаем пустой массив сообщений
        return rxjs.of({ messages: [] });
      })
    )
  )
);

// Подписываемся на поток и обновляем таблицу сообщений
messagePolling$.subscribe({
  next: (data) => {
    processMessages(data.messages);
  },
  error: (err) => {
    console.error('Error fetching messages:', err);
  }
});
