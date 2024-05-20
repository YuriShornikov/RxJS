const express = require('express');
const faker = require('faker');
const { Observable } = require('rxjs');
const app = express();
const port = 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  res.setHeader('Access-Control-Allow-Credentials', true);
  next();
});

// Функция для генерации случайных сообщений
function generateMessages() {
  return new Observable(subscriber => {
    const messages = [];
    const numberOfMessages = faker.datatype.number({ min: 1, max: 10 });

    for (let i = 0; i < numberOfMessages; i++) {
      messages.push({
        id: faker.datatype.uuid(),
        from: faker.internet.email(),
        subject: faker.lorem.sentence(),
        body: faker.lorem.paragraphs(),
        received: Math.floor(faker.date.recent().getTime() / 1000) // Время в секундах
      });
    }

    subscriber.next(messages);
    subscriber.complete();
  });
}

// Endpoint для получения непрочитанных сообщений
app.get('/messages/unread', (req, res) => {
  generateMessages().subscribe({
    next: (messages) => {
      res.json({
        status: 'ok',
        timestamp: Math.floor(Date.now() / 1000), // Время в секундах
        messages: messages
      });
    },
    error: (err) => {
      res.status(500).json({ status: 'error', message: err.message });
    }
  });
});

// Запуск сервера
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
