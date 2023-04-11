const ActivityBase = require("./activityBase");
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');

module.exports = class CustomActivity extends ActivityBase{
    date;

    constructor(id, mess, name, quant, leader, date){
        super(id, mess, name, quant, leader);
        this.date = date;
    }

    createActionRow(){
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('go_activity')
                    .setLabel('Я иду!')
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

    refreshMessage(){
        this.refreshDate();
        super.refreshMessage();
    }
    updateMessage(){
        this.refreshDate();
        super.updateMessage();
    }
    refreshDate(){
        const embed = this.message.embeds[0];
        embed.fields[0].value = this.date;
    }
}

