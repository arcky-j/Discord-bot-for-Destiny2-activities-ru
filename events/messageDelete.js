const {Events, Collection} = require('discord.js');
//срабатывает при удалении сообщения
module.exports = {
    name: Events.MessageDelete,
    execute(message) {
        const client= message.client;
        //если удалённое сообщение хранилось как сообщение сбора или лог, удаляет и из своей памяти
        if (message.customId){
            if (message.fireteam){
                if (client.fireteams.has(message.customId)){
                    client.fireteams.get(message.customId).delete();
                    client.fireteams.delete(message.customId);
                }              
            } else if (message.customActivity){
                if (client.activities.has(message.customId)){
                    client.activities.get(message.customId).delete();
                    client.activities.delete(message.customId);
                }              
            }
        }
    },
};