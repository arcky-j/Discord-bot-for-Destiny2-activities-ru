const ActivityBase = require("./activityBase");
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const ActivityEvents = require('../consts/activityEvents');

module.exports = class CustomActivity extends ActivityBase{
    date;
    role;
    pathToActivities = path.join('.', 'data', 'customActivities');

    constructor(id, clan, name, quant, leader, date, role){
        super(id, clan, name, quant, leader);
        this.date = date;
        if (role){
            this.role = role;
        }        
        this.client.emit(ActivityEvents.Created, this);
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
                    .setCustomId(`activity_go_${this.id}`)
                    .setLabel('Я участвую!')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`activity_cancel_${this.id}`)
                    .setLabel('Передумал')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId(`activityLead_settings_${this.id}`)
                    .setLabel('Настройки')
                    .setStyle(ButtonStyle.Secondary)             
            );
        return row;
    }
    
    createSettingsRow(){
        const row = new ActionRowBuilder()
            .addComponents(               
                new ButtonBuilder()
                    .setCustomId(`activityLead_start_${this.id}`)
                    .setLabel('Старт')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`activityLead_changeDate_${this.id}`)
                    .setLabel('Перенести')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId(`activityLead_changeLeader_${this.id}`)
                    .setLabel('Передать лид.')
                    .setStyle(ButtonStyle.Secondary),                    
                new ButtonBuilder()
                    .setCustomId(`activityLead_close_${this.id}`)
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
        this.client.emit(ActivityEvents.ChangedDate, this, date);
    }

    async refreshMessage(){
        if (!this.message){
            return;
        }
        this.refreshDate();
        await super.refreshMessage();
    }

    refreshDate(){
        const embed = this.message.embeds[0];
        embed.fields[0].value = this.date;
    }

}

