const Settings = require('../utility/settings.js');
const {Events} = require('discord.js');
//срабатывает при запуске бота
module.exports = {
    name: Events.ClientReady,
    execute(client) {
        //оповещает в консоли, ставит первый статус и подгружает нужные кэши
        console.log(`${client.user.tag} на связи и готов фаршмачить`);
        client.user.setPresence({activities: [{name: 'побег из микроволновки', type: 0}]}); //напоминаю, что все статусы созданы под образ босса Шпиля Хранителя и их всегда можно поменять      
        client.cacheManager.loadAll();
        client.guilds.cache.forEach((val, id) => {
            client.settings.set(id, new Settings(id));
        });
        console.log('Настройки для серверов инициализированы');
    },
};