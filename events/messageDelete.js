const {Events} = require('discord.js');
//срабатывает при удалении сообщения
module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        //если удалённое сообщение хранилось как сообщение сбора или лог, удаляет и из своей памяти
        if (message.customId){
            const client= message.client;
            const activity = client.activities.get(message.customId);
            if (!activity){
                client.mapVotes.delete(message.customId);    
                return;         
            }
            if (message.guildId){
                const sett = client.settings.get(message.guildId);
                sett.sendLog(`Удаление кастомного сбора ${activity.name} (${activity.id})`, 'Запись логов: уведомление');
            }
            activity.delete();
            client.activities.delete(message.customId);             
        }
    },
};