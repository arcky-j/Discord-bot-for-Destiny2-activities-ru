const {Events, Collection} = require('discord.js');
//срабатывает при удалении сообщения
module.exports = {
    name: Events.MessageDelete,
    async execute(message) {
        //если удалённое сообщение хранилось как сообщение сбора или лог, удаляет и из своей памяти
        if (message.customId){
            const client= message.client;
            if (message.fireteam){
                if (client.fireteams.has(message.customId)){
                    const fireteam = client.fireteams.get(message.customId);
                    if (message.guildId){
                        const sett = client.settings.get(message.guildId);
                        sett.sendLog(`Удаление сбора ${fireteam.name} (${fireteam.id})`, 'Запись логов: уведомление');
                    }
                    fireteam.delete();
                    client.fireteams.delete(message.customId);
                    
                }              
            } else if (message.customActivity){
                if (client.activities.has(message.customId)){
                    const activity = client.activities.get(message.customId);
                    if (message.guildId){
                        const sett = client.settings.get(message.guildId);
                        sett.sendLog(`Удаление кастомного сбора ${activity.name} (${activity.id})`, 'Запись логов: уведомление');
                    }
                    activity.delete();
                    client.activities.delete(message.customId);
                }              
            }
        }
    },
};