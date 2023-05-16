const {Settings, FireteamUntimed, FireteamRes, CustomActivity, getRandomPresence} = require('../fireteams_module');
const fs = require('node:fs');
const path = require('node:path');
//срабатывает при запуске бота
module.exports = {
    name: Events.ClientReady,
    async execute(client) {
        //оповещает в консоли, ставит первый статус и подгружает нужные кэши
        //console.log(`${client.user.tag} на связи и готов фаршмачить`);
        client.user.setPresence({activities: [{name: 'побег из микроволновки', type: 0}]}); //напоминаю, что все статусы созданы под образ босса Шпиля Хранителя и их всегда можно поменять  
        setInterval(async () => {
            client.user.setPresence(getRandomPresence());
        }, 3600000);//3600000
        await Settings.initSettings().catch(err => console.log(`Ошибка инициализации настроек серверов: ${err.message}`));    
        FireteamUntimed.initAll().catch(err => console.log(`Ошибка загрузки сборов по готовности: ${err.message}`)); 
        FireteamRes.initAll().catch(err => console.log(`Ошибка загрузки стандартных сборов: ${err.message}`)); 
        CustomActivity.initAll().catch(err => console.log(`Ошибка загрузки кастомных сборов: ${err.message}`));

        client.guilds.cache.forEach((val, id) =>{
            const pathToGuardians = path.join('.', 'data', 'guardians', `guild_${id}`);
            if (!fs.existsSync(pathToGuardians)){
                fs.mkdirSync(pathToGuardians, {recursive: true});
                console.log(`Создана директория ${pathToGuardians}`);
            }
            const guardians = fs.readdirSync(pathToGuardians).filter(f => f.endsWith('.json'));
            if (guardians.length > 0){
                guardians.forEach((valGuard) => {
                    fs.readFile(path.join(pathToGuardians, valGuard), (error, data) =>{
                        if (error){
                            console.error(error);
                        }
                        const guard = JSON.parse(data);
                        val.members.fetch(guard.member).catch(err => {
                            console.log(err);
                            fs.unlink(path.join(pathToGuardians, valGuard), (error) =>{
                                if (error){
                                    console.error(error);
                                }
                            });
                        });
                    });
                });
            }         
        });
    },
};