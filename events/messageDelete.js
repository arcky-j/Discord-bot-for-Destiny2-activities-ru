const {Events} = require('discord.js');
//срабатывает при удалении сообщения
module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        //если удалённое сообщение хранилось как сообщение сбора или лог, удаляет и из своей памяти
        if (message.customId){
            const client= message.client;
            const clan = client.d2clans.get(message.guildId);          
            const activity = clan.activities.get(message.customId);
            if (!activity){
                client.mapVotes.delete(message.customId);    
                return;         
            }
            if (message.guildId){
                const sett = client.d2clans.getConfig(message.guildId);
                sett.sendLog(`Удаление сбора ${activity.name} (${activity.id})`, 'Запись логов: уведомление');
            }
            activity.delete();
            clan.activities.delete(activity);
        }
    },
};