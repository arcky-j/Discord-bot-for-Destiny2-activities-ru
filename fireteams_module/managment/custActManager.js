const DiscManager = require('./discManager');
const CustomActivity = require('../classes/customActivity');
const path = require('node:path');
const fs = require('node:fs');

class CustomActivitiesManager extends DiscManager{

    constructor(clan){
        super();
        this.clan = clan;
        this.path = path.join(this.basePath, 'clans', `clan_${clan.id}`, 'activities', 'customActivities');
        if (!fs.existsSync(this.path)){
            fs.mkdirSync(this.path, {recursive:true});
            console.log(`Директория data/clans/clan_${clan.id}/activities/customActivities была успешно создана.`);
        }
    }

    async save(activity){
        const pathToActivity = path.join(this.path, `activity_${activity.id}.json`);
        const data = this.toJSON(activity);
        fs.writeFile(pathToActivity, data, async (err) =>{
            if (err){
                console.error(err);
                if (activity.guildId){
                    const sett = this.client.settings.get(activity.guildId);
                    sett.sendLog(`Не удалось сохранить в файл ${activity}): ${err.message}`, 'Запись логов: ошибка');
                }
            }
        })
    }

    async delete(activity){
        const pathToActivity = path.join(this.path, `activity_${activity.id}.json`);
        fs.unlink(pathToActivity, async (err) =>{
            if (err){
                console.error(err);
                if (activity.guildId){
                    const sett = CustomActivity.client.settings.get(activity.guildId);
                    sett.sendLog(`Не удалось удалить файл с ${activity}): ${err.message}`, 'Запись логов: ошибка');
                }
            }
        });
    }

    toJSON(activity){
        if (!(activity instanceof CustomActivity)){
            return;
        }
        
        const data = {
            id: activity.id,
            message: activity.message.id,
            channel: activity.message.channelId,
            name: activity.name,
            quantity: activity.quantity,
            date: activity.date,
            leader: activity.leader.id,
            members: new Array(),
            state: activity.state,
            role: undefined,
            guild: activity.guildId
        };
        if (activity.role){
            data.role = activity.role.id;
        }
        if (activity.members.size > 0){
            activity.members.forEach((val, id) =>{
                data.members.push(id);
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
        let guild;
        let role;
        if (data.role){
            guild = await this.client.guilds.fetch(data.guild).catch();
            if (!guild){
                message.delete().catch();
                throw new Error('Сервер сбора не обнаружен');
            }
            role = await guild.roles.fetch(data.role).catch();
            if (!role){
                message.delete().catch();
                throw new Error('Роль сбора не обнаружен');
            }
        }
        const leader = await this.client.users.fetch(data.leader).catch();
        if (!leader){
            message.delete().catch();
            throw new Error('Лидер сбора не обнаружен');
        }
        const activity = new CustomActivity(data.id, guild.id, data.name, data.quantity, leader, data.date, role);
        activity.message = message;
        activity.state = data.state;
        if (data.members.length > 0){
            await data.members.forEach(async (val) =>{               
                const user = await this.client.users.fetch(val).catch();
                if (user){
                    activity.members.set(val, user);
                }               
            });
        }
        return activity;
    }

    async initAll(){
        if (!fs.existsSync(this.path)){
            fs.mkdirSync(this.path, {recursive:true});
            console.log('Директория для хранения кастомных сборов была успешно создана.')
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
                        const activity = await this.fromJSON(data);
                        this.client.activities.cache.set(activity.id, activity);
                        setTimeout(() => {
                            //activity.checkQuantity();
                            activity.refreshMessage();
                        }, 10000);
                        console.log(`Загружена кастомная активность ${activity}`);
                        if (activity.guildId){
                            const sett = this.client.settings.get(activity.guildId);
                            sett.sendLog(`Загружена кастомная активность ${activity}`, 'Запись логов: успех');
                        }
                    } catch (err){
                        console.log(`Невозможно загрузить кастомную активность ${val}. Причина: ${err.message} Производится удаление...`);
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

module.exports = CustomActivitiesManager;