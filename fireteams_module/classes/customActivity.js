const ActivityBase = require("./activityBase");
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = class CustomActivity extends ActivityBase{
    date;
    role;
    guild;
    pathToActivities = path.join('.', 'data', 'customActivities');

    constructor(id, guildId, name, quant, leader, date, role){
        super(id, guildId, name, quant, leader);
        this.date = date;
        if (role){
            this.role = role;
            CustomActivity.client.guilds.fetch(role.guild.id)
            .then(guild => this.guild = guild);
        }        
    }

    createEmbed(color, descript, banner, media){
        const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(this.name)
        .setDescription(descript)
        .addFields(
            {name: 'Время и дата', value: `${this.date}`, inline: false},
            {name: 'Статус', value: `Открыт`, inline: true},
            {name: 'Лидер', value: `${this.leader}`, inline: true},
            {name: 'Участники', value: '...', inline: false}
        )
        .setFooter({text: `ID: ${this.id}`});
        if (banner){
            embed.setThumbnail(banner)
        }
        if (media){
            embed.setImage(media);
        }
        return embed;
    }   

    createActionRow(){
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('activity_go')
                    .setLabel('Я участвую!')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('activity_cancel')
                    .setLabel('Передумал')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('settings')
                    .setLabel('Настройки')
                    .setStyle(ButtonStyle.Secondary)             
            );
        return row;
    }
    
    createSettingsRow(){
        const row = new ActionRowBuilder()
            .addComponents(               
                new ButtonBuilder()
                    .setCustomId('activity_start')
                    .setLabel('Старт')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('change_date')
                    .setLabel('Перенести')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('change_leader')
                    .setLabel('Передать лид.')
                    .setStyle(ButtonStyle.Secondary),                    
                new ButtonBuilder()
                    .setCustomId('close')
                    .setLabel('Отменить')
                    .setStyle(ButtonStyle.Danger)         
            );
        return row;
    } 

    add(user){
        super.add(user);
        if (this.role){
            this.guild.members.fetch(user.id).then(gMember => gMember.roles.add(this.role.id).catch());           
        }
    }

    remove(id){
        super.remove(id);
        if (this.role){
            this.guild.members.fetch(id).then(gMember => gMember.roles.remove(this.role.id).catch());           
        }
    }

    changeDate(date){
        this.date = date;
        this.refreshMessage();
    }

    async refreshMessage(){
        if (!this.message){
            return;
        }
        this.refreshDate();
        await super.refreshMessage();
        this.save();
    }

    updateMessage(){
        if (!this.message){
            return;
        }
        this.refreshDate();
        const embed = super.updateMessage();
        this.save();
        return embed;
    }

    refreshDate(){
        const embed = this.message.embeds[0];
        embed.fields[0].value = this.date;
    }

    static async initAll(){
        const pathToActivities = path.join('.', 'data', 'customActivities');
        if (!fs.existsSync(pathToActivities)){
            fs.mkdirSync(pathToActivities, {recursive:true});
            console.log('Директория для хранения кастомных сборов была успешно создана.')
        }
        const files = fs.readdirSync(pathToActivities).filter(f => f.endsWith('.json'));
        if (files.length > 0){
            files.forEach((val) => {
                fs.readFile(path.join(pathToActivities, val), async (error, data) =>{
                    if (error){
                        console.error(error);
                        throw error;
                    }
                    try{
                        const activity = await this.fromJSON(data);
                        this.client.activities.set(activity.id, activity);
                        setTimeout(() => {
                            //activity.checkQuantity();
                            activity.refreshMessage();
                        }, 10000);
                        console.log(`Загружена кастомная активность ${activity}`);
                        if (activity.guildId){
                            const sett = CustomActivity.client.settings.get(activity.guildId);
                            sett.sendLog(`Загружена кастомная активность ${activity}`, 'Запись логов: успех');
                        }
                    } catch (err){
                        console.log(`Невозможно загрузить кастомную активность ${val}. Причина: ${err.message} Производится удаление...`);
                        fs.unlink(path.join(pathToActivities, val), async (err) => {
                            if (err){
                                console.error(err);
                            }
                        });
                    }                   
                });
            });
        }
    }

    async save(){
        const pathToActivity = path.join(this.pathToActivities, `activity_${this.id}.json`);
        const data = await CustomActivity.toJSON(this);
        fs.writeFile(pathToActivity, data, async (err) =>{
            if (err){
                console.error(err);
                if (this.guildId){
                    const sett = CustomActivity.client.settings.get(this.guildId);
                    sett.sendLog(`Не удалось сохранить в файл ${this}): ${err.message}`, 'Запись логов: ошибка');
                }
            }
        })
    }

    async delete(){
        const pathToActivity = path.join(this.pathToActivities, `activity_${this.id}.json`);
        fs.unlink(pathToActivity, async (err) =>{
            if (err){
                console.error(err);
                if (this.guildId){
                    const sett = CustomActivity.client.settings.get(this.guildId);
                    sett.sendLog(`Не удалось удалить файл с ${this}): ${err.message}`, 'Запись логов: ошибка');
                }
            }
        });
        super.delete();
    }

    static async toJSON(activity){
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

    static async fromJSON(data){
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
        message.customActivity = true;
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
}

