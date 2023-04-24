const ActivityBase = require("./activityBase");
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = class CustomActivity extends ActivityBase{
    date;
    roleId;
    guild;
    pathToActivities = path.join('.', 'data', 'customActivities');

    constructor(id, mess, name, quant, leader, date, role){
        super(id, mess, name, quant, leader);
        this.guild = leader.guild;
        this.date = date;
        this.roleId = role;
    }

    createActionRow(){
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('go_activity')
                    .setLabel('Я участвую!')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel_activity')
                    .setLabel('Передумал')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('activity_start')
                    .setLabel('Старт')
                    .setStyle(ButtonStyle.Secondary)             
            );
        return row;
    }
    
    createEmbed(color, descript, banner, media){
        const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(this.name)
        .setDescription(descript)
        .addFields(
            {name: 'Время и дата', value: `...`, inline: true},
            {name: 'Статус', value: `Инициализация`, inline: true},
            {name: 'Лидер', value: `...`, inline: true},
            {name: 'Участники', value: '...', inline: false}
        )
        .setThumbnail(banner)
        .setFooter({text: `ID: ${this.id}`});
        if (media){
            embed.setImage(media);
        }
        return embed;
    }    

    add(user){
        super.add(user);
        if (this.roleId){
            user.roles.add(this.roleId).catch();
        }
    }

    remove(id){
        const member = this.members.get(id);
        super.remove(id);
        if (member && this.roleId){
            member.roles.remove(this.roleId).catch();
        }
    }

    refreshMessage(){
        this.refreshDate();
        super.refreshMessage();
        this.save();
    }
    updateMessage(){
        this.refreshDate();
        super.updateMessage();
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
                            activity.checkQuantity();
                            activity.refreshMessage();
                        }, 10000);
                        console.log(`Загружена кастомная активность ${activity.name} (${activity.id})`);
                    } catch (err){
                        console.log(`Невозможно загрузить кастомную активность ${val}. Причина: ${err.message} Производится удаление...`);
                        fs.unlink(path.join(pathToActivities, val), (err) => {
                            if (err){
                                console.error(err);
                            }
                        });
                    }                   
                });
            });
        }
    }

    save(){
        const pathToActivity = path.join(this.pathToActivities, `activity_${this.id}.json`);
        const data = CustomActivity.toJSON(this);
        fs.writeFile(pathToActivity, data, (err) =>{
            if (err){
                console.error(err);
                throw err;
            }
        })
    }

    delete(){
        const pathToActivity = path.join(this.pathToActivities, `activity_${this.id}.json`);
        fs.unlink(pathToActivity, (err) =>{
            if (err){
                console.error(err);
            }
        });
    }

    static toJSON(activity){
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
            leaderId: activity.leaderId,
            members: new Array(),
            state: activity.state,
            role: activity.roleId,
            guild: activity.guild.id
        };

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
        const guild = await this.client.guilds.fetch(data.guild).catch();
        if (!guild){
            throw new Error('Сервер сбора не обнаружен');
        }
        const leader = await guild.members.fetch(data.leaderId).catch();
        if (!leader){
            message.delete().catch();
            throw new Error('Лидер сбора не обнаружен');
        }
        const activity = new CustomActivity(data.id, message, data.name, data.quantity, leader, data.date, data.role);
        if (data.members.length > 0){
            await data.members.forEach(async (val) =>{               
                const user = await guild.members.fetch(val).catch();
                if (user){
                    activity.members.set(val, user);
                }               
            });
        }
        return activity;
    }
}

