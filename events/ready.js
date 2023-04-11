const Settings = require('../utility/settings.js');
const {Events} = require('discord.js');
const getRandomPresence = require('../utility/get_random_presence');
//срабатывает при запуске бота
module.exports = {
    name: Events.ClientReady,
    execute(client) {
        //оповещает в консоли, ставит первый статус и подгружает нужные кэши
        //console.log(`${client.user.tag} на связи и готов фаршмачить`);
        client.user.setPresence({activities: [{name: 'побег из микроволновки', type: 0}]}); //напоминаю, что все статусы созданы под образ босса Шпиля Хранителя и их всегда можно поменять  
        setInterval(() => {
            client.user.setPresence(getRandomPresence());
        }, 3600000);//3600000
        setInterval(() => {
            client.cacheManager.saveCache(); 
            const used = process.memoryUsage();
            console.log('Использование памяти:');
            for (let key in used) {
                console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
            }
        }, 86400000);
        client.cacheManager.loadAll();
    },
};