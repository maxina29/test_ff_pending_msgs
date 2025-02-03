// локальное хранение сообщений - дополнительный функционал
const storage = {
    key: 'local_pending_messages',

    load() {
        try {
            return JSON.parse(localStorage.getItem(this.key) || '[]');
        } catch (e) {
            return [];
        }
    },

    save(data) {
        localStorage.setItem(this.key, JSON.stringify(data));
    },
};

let messages = storage.load() || [];

// Оставшееся время в нужном формате
function formatTime(delta) {
    if (delta <= 0) return '-';
    const days = Math.floor(delta / (1000 * 60 * 60 * 24));
    const hours = Math.floor((delta % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) {
        return `${days}d ${hours}h left`;
    }
    const minutes = Math.floor((delta % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
        return `${hours}h ${minutes}m left`;
    }
    const seconds = Math.floor((delta % (1000 * 60)) / 1000);
    if (minutes > 0) {
        return `${minutes}m ${seconds}s left`;
    } else {
        return `${seconds}s left`;
    }
}

// Обновление таблицы
function updateTable() {
    const now = Date.now();
    const tbody = document.querySelector('#messagesTableBody');
    tbody.innerHTML = '';
    messages = messages.map(msg => {
        if (now >= msg.sendAt && msg.status != 'Sended') {
            msg.status = 'Sended';
            storage.save(messages);
        }
        return msg;
    })
    messages.forEach(msg => {
        const row = document.createElement('tr');
        // подсветка на 3 секунды - дополнительный функционал
        if (msg.new) {
            row.className += ' newRow';
            setTimeout(() => {
                msg.new = false;
                storage.save(messages);
                updateTable();
            }, 1500);
        }
        const remains = formatTime(msg.sendAt - now);
        row.innerHTML = `
            <td>${msg.text}</td>
            <td>${remains}</td>
            <td>${msg.status}</td>
        `;
        tbody.appendChild(row);
    });
}

// Обработчик событий отправки формы
document.querySelector('#messagesForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const messageText = document.querySelector('#messageText').value;
    const delay = parseInt(document.querySelector('#messageDelay').value);
    const button = document.querySelector('#messagesFormButton');
    const newMessage = {
        text: messageText,
        sendAt: Date.now() + delay * 1000,
        status: 'Pending',
        new: true
    };
    messages.push(newMessage);
    messages.sort((a, b) => a.sendAt - b.sendAt);
    storage.save(messages);
    updateTable();
    this.reset();
    button.blur();
});

setInterval(updateTable, 300);

// очистка всех сообщений - дополнительный функционал
function clearAllMessages() {
    if (!messages.length) {
        alert('There are no messages to delete');
    }
    else if (confirm('Are you sure you want to delete all messages?')) {
        messages = [];
        storage.save(messages);
        updateTable();
    }
}