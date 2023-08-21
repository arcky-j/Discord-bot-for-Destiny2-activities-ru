const DiscManager = require('./discManager');
const Activity = require('../classes/activity');
const {Collection} = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');

class ActivityManager extends DiscManager{
    
    constructor(clan){
        super();
        this.cache = new Collection();
        this.clan = clan;
        this.path = path.join(this.basePath, 'clans', `clan_${clan.id}`, 'activities');
        if (!fs.existsSync(this.path)){
            fs.mkdirSync(this.path, {recursive:true});
            console.log(`Директория data/clans/clan_${clan.id}/activities/ была успешно создана.`);
        }
        setTimeout(() => {
            this.clan.config.sendLog(`Инициализация сборов на сервере...`, 'Запись логов');
            this.initAll();
        }, 10000);
    }

    set(activity){
        this.cache.set(activity.id, activity);
        this.save(activity);
    }

    get(id){
        return this.cache.get(id);
    }

    save(activity){
        const pathToTeam = path.join(this.path, `activity_${activity.id}.json`);
        const data = this.#toJSON(activity);
        fs.writeFile(pathToTeam, data, async (err) =>{
            if (err){
                console.error(err);
                const sett = this.clan.config;
                sett.sendLog(`Не удалось сохранить в файл ${activity}): ${err.message}`, 'Запись логов: ошибка');
            }
        });
    }

    delete(activity){
        this.cache.delete(activity.id);
        const pathToTeam = path.join(this.path, `activity_${activity.id}.json`);
        fs.unlink(pathToTeam, async (err) =>{
            if (err){
                console.error(err);
                const sett = this.clan.config;
                sett.sendLog(`Не удалось удалить файл с ${activity}): ${err.message}`, 'Запись логов: ошибка');
            }
        });
    }

    async initAll(){
        const files = fs.readdirSync(this.path).filter(f => f.endsWith('.json'));
        const today = new Date();
        for (const file of files){
            fs.readFile(path.join(this.path, file), async (error, data) =>{
                if (error){
                    console.error(error);
                    throw error;
                }
                try{
                    const activity = await this.#fromJSON(data);
                    this.clan.activities.set(activity);
                    console.log(`Загружена боевая группа ${activity}`);
                    this.clan.config.sendLog(`Загружена боевая группа ${activity}`, 'Запись логов: успех');
                } catch (err){
                    console.log(`Невозможно загрузить боевую группу ${file}. Причина: ${err.message} Производится удаление...`);
                    this.clan.config.sendLog(`Невозможно загрузить боевую группу ${file}`, 'Запись логов: ошибка');
                    fs.unlink(path.join(this.path, file), async (err) => {
                        if (err){
                            console.error(err);
                        }
                    });
                }                   
            });
        }
    }

    #toJSON(team){
        if (!(team instanceof Activity)){
            return;
        }

        const data = {
            id: team.id,
            message: team.message.id,
            channel: team.message.channelId,
            name: team.name,
            quantity: team.quantity,
            leader: team.leader.id,
            date: undefined,
            members: new Array(),
            state: team.state,
            guild: team.guildId,
        };

        if (team.date instanceof Date){
            data.date = team.date.toJSON();
            data.reservs = new Array();
            data.bron = new Array();
            data.timed = true;
        } else {
            data.date = team.date;
        }

        team.members.forEach((val, id) =>{
            data.members.push(id);
        });

        if (team.reservs && team.reservs.size > 0){
            team.reservs.forEach((val, id) => {
                data.reservs.push(id);
            });
        }

        if (team.bronList && team.bronList.size > 0){
            team.bronList.forEach((val, id) =>{
                data.bron.push(id);
            });
        }   

        return JSON.stringify(data);
    }

    async #fromJSON(data){
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
        const guild = this.clan.guild;
        const leader = await guild.members.fetch(data.leader).catch();
        if (!leader){
            message.delete().catch();
            throw new Error('Лидер сбора не обнаружен');
        }
        let date;
        if (data.timed){
            date = new Date(data.date);
        } else {
            date = data.date;
        }

        const activity = new Activity({id: data.id, clan: this.clan, date:date, name: data.name, quant: data.quantity, leader: leader, state: data.state, message: message});
        for (const id of data.members){
            if (id == leader.id) continue;
            const user = await guild.members.fetch(id).catch();
            if (user){
                activity.members.set(id, user);
            }
        }

        if (activity.reservs){
            for (const id of data.reservs){
                const user = await guild.members.fetch(id).catch();
                if (user){
                    activity.reservs.set(id, user);
                }
            }
        }
        
        if (activity.bronList){
            for (const id of data.bron){
                const user = await guild.members.fetch(id).catch();
                if (user){
                    activity.bronList.set(id, user);
                }
            }
        }

        return activity;
    }
}

module.exports = ActivityManager;