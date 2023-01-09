const {Events, Collection} = require('discord.js');
//срабатывает при удалении сообщения
module.exports = {
    name: Events.MessageDelete,
    execute(message) {
        const client= message.client;
        //если удалённое сообщение хранилось как сообщение сбора или лог, удаляет и из своей памяти
        if (client.timer.actMessages.has(message.id)){
            client.timer.actMessages.delete(message.id);
            client.fireteams.delete(message.id);
        }
        if (client.timer.logMessages.has(message.id)){
            client.timer.logMessages.delete(message.id);
        }
        //если удалённое сообщение содержало в себе голосование, удалить голосование
        if (client.polls.has(message.id)){
            client.polls.delete(message.id);
        }
    },
};