const ActivityUntimed = require("./activityUntimed");
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
const ActivityEvents = require('../consts/activityEvents');
const fs = require('node:fs');
const path = require('node:path');

module.exports = class FireteamUntimed extends ActivityUntimed{
    pathToFireteams = path.join('.', 'data', 'fireteamsUntimed');
    constructor(id, guildId, name, quant, leader, br1, br2){
        super(id, guildId, name, quant, leader, br1, br2);
        this.members.set(leader.id, leader);
        this.client.emit(ActivityEvents.Created, this);
    }
    
    createEmbed(color, descript, banner, media){
        const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(this.name)
        .setDescription(descript)
        .addFields(
            {name: 'Время и дата', value: `По готовности`, inline: false},
            {name: 'Статус', value: `Открыт`, inline: true},
            {name: 'Лидер', value: `${this.leader}`, inline: true},
            {name: 'Боевая группа', value: `${this.getMembersString()}`, inline: false}
        )
        .setThumbnail(banner)
        .setFooter({text: `ID: ${this.id}`});
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
                    .setLabel('Я точно иду!')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId(`activity_cancel_${this.id}`)
                    .setLabel('Я передумал')
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
                    .setCustomId(`activityLead_changeLeader_${this.id}`)
                    .setLabel('Передать лид.')
                    .setStyle(ButtonStyle.Secondary),                   
                new ButtonBuilder()
                    .setCustomId(`activityLead_close_${this.id}`)
                    .setLabel('Отменить')
                    .setStyle(ButtonStyle.Danger)      
            );          
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId(`activityLead_bronAdd_${this.id}`)
                .setLabel('Добавить бронь')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId(`activityLead_bronDelete_${this.id}`)
                .setLabel('Удалить бронь')
                .setStyle(ButtonStyle.Secondary)
        );
        return [row, row2];
    }

    remove(id){
        if (id == this.leader.id){ //проверка на лидерство
            throw new Error('Лидер не может покинуть боевую группу!');
        }
        super.remove(id);
    }

    changeLeader(user){
        if (user.id == this.leader.id){ //проверка на случай попытки сменить себя на себя
            throw new Error('Лидер пытается сменить себя на себя! чзх? я не буду это комментировать...');
        }

        if (user.bot){ //на всякий случай проверка, пытаются ли сделать лидером бота
            throw new Error('Возмутительно! Я не думал, что кому-то придёт назначать лидером бота, но и к этому я был готов');
        }

        if (this.members.has(user.id)){ 
            this.leader = user; //если новый лидер был в боевой группе, просто передаёт лидерство
        } else{
            //если нового лидера нет ни в боевой группе, ни в резерве              
            if (this.state == 'Заполнен'){                    
                this.members.delete(this.leader.id); //если группа была заполнена, удаляет предыдущего лидера
                this.members.set(user.id, user); //и только потом записывает нового лидера в боевую группу 
                this.leader = user;                
            } else {
                this.members.set(user.id, user); //если места есть, просто добавляет нового Стража и делает его лидером
                this.leader = user; 
            }
            //this.checkQuantity();
        }   
        this.client.emit(ActivityEvents.ChangedLeader, this, user);
        this.refreshMessage();
    }

} 