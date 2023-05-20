const DiscManager = require('./discManager');
const FireteamUntimed = require('../classes/fireteamUntimed');
const path = require('node:path');
const fs = require('node:fs');

class FireteamsUntimedManager extends DiscManager{

    constructor(clan){
        super();
        this.clan = clan;
        this.path = path.join(this.basePath, 'clans', `clan_${clan.id}`, 'activities', 'fireteamUntimed');
        if (!fs.existsSync(this.path)){
            fs.mkdirSync(this.path, {recursive:true});
            console.log(`Директория data/clans/clan_${clan.id}/activities/fireteamUntimed была успешно создана.`);
        }
    }

    async save(fireteam){
        const pathToTeam = path.join(this.path, `fireteam_${fireteam.id}.json`);
        const data = this.toJSON(fireteam);
        fs.writeFile(pathToTeam, data, async (err) =>{
            if (err){
                console.error(err);
                if (fireteam.guildId){
                    const sett = FireteamUntimed.client.settings.get(fireteam.guildId);
                    sett.sendLog(`Не удалось сохранить в файл ${fireteam}: ${err.message}`, 'Запись логов: ошибка');
                }
            }
        })
    }

    async delete(fireteam){
        const pathToTeam = path.join(this.path, `fireteam_${fireteam.id}.json`);
        fs.unlink(pathToTeam, async (err) =>{
            if (err){
                console.error(err);
                if (fireteam.guildId){
                    const sett = FireteamUntimed.client.settings.get(fireteam.guildId);
                    sett.sendLog(`Не удалось удалить файл с ${fireteam}: ${err.message}`, 'Запись логов: ошибка');
                }
            }
        });
    }

    toJSON(team){
        if (!(team instanceof FireteamUntimed)){
            return;
        }
        
        const data = {
            id: team.id,
            message: team.message.id,
            channel: team.message.channelId,
            name: team.name,
            quantity: team.quantity,
            leader: team.leader.id,
            members: new Array(),
            state: team.state,
            bron: new Array(),
            bronMessages: new Array(),
            bronChannels: new Array(),
            guild: team.guildId
        };

        team.members.forEach((val, id) =>{
            data.members.push(id);
        });

        if (team.bron.size > 0){
            team.bron.forEach((val, id) =>{
                data.bron.push(id);
            });
            team.bronMessages.forEach((val, id) =>{
                data.bronMessages.push(val.id);
                data.bronChannels.push(val.channelId);
            });
        }   
        return JSON.stringify(data);
    }

    async fromJSON(data){
        data = JSON.parse(data);
        const channel = await this.client.channels.fetch(data.channel).catch();
        if (!channel){
            throw new Error('Канал сбора не обнаружен');
        }
        const message = await channel.messages.fetch(data.message).catch();
        if (!message){
            throw new Error('Сообщение сбора не обнаружено');
        }
        message.customId = data.id;
        const leader = await this.client.users.fetch(data.leader).catch();
        if (!leader){
            message.delete().catch();
            throw new Error('Лидер сбора не обнаружен');
        }
        const fireteam = new FireteamUntimed(data.id, data.guild, data.name, data.quantity, leader);
        fireteam.message = message;
        //fireteam.state = data.state;
        await data.members.forEach(async (val) =>{
            if (val != leader.id){
                const user = await this.client.users.fetch(val).catch();
                if (user){
                    fireteam.members.set(val, user);
                }
            }
        });
        if (data.bron.length > 0){
            await data.bron.forEach(async (val, i) =>{
                const user = await this.client.users.fetch(val).catch();
                if (user){
                    fireteam.bron.set(val, user);
                }
                const channel = await this.client.channels.fetch(data.bronChannels[i]).catch();
                if (channel){
                    const message = await channel.messages.fetch(data.bronMessages[i]).catch();
                    if (message){
                        fireteam.bronMessages.set(val, message);
                    }
                }               
            });
        }
        return fireteam;
    }

    async initAll(){
        if (!fs.existsSync(this.path)){
            fs.mkdirSync(this.path, {recursive:true});
            console.log('Директория для хранения боевых групп по готовности была успешно создана.')
        }
        const files = fs.readdirSync(this.path).filter(f => f.endsWith('.json'));
        if (files.length > 0){
            files.forEach((val) => {
                fs.readFile(path.join(this.path, val), async (error, data) =>{
                    if (error){
                        console.error(error);
                        throw error;
                    }
                    try{
                        const fireteam = await this.fromJSON(data);
                        this.client.activities.cache.set(fireteam.id, fireteam);
                        setTimeout(() => {
                            //fireteam.checkQuantity();
                            fireteam.refreshMessage();
                        }, 10000);
                        console.log(`Загружена боевая группа ${fireteam}`);
                        if (fireteam.guildId){
                            const sett = this.client.settings.get(fireteam.guildId);
                            sett.sendLog(`Загружена боевая группа ${fireteam}`, 'Запись логов: успех');
                        }
                    } catch (err){
                        console.log(`Невозможно загрузить боевую группу ${val}. Причина: ${err.message} Производится удаление...`);
                        fs.unlink(path.join(this.path, val), async (err) => {
                            if (err){
                                console.error(err);
                            }
                        });
                    }                   
                });
            });
        }
    }
}

module.exports = FireteamsUntimedManager;