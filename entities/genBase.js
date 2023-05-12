const Base = require('./base');
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');

module.exports = class GenBase extends Base{
    //id;
    message;
    raids;
    dungs;
    custom;
    descript;

    constructor(raids, dungs, custom, descript){
        super();
        this.raids = raids;
        this.dungs = dungs;
        this.custom = custom;
        this.descript = descript;
    }

    createEmbed(banner, color){
        const embed = new EmbedBuilder()
        .setTitle('Мастер сборов');

        if (this.descript){
            embed.setDescription('Альтернативный метод создания сборов.\n' + this.descript);
        } else {
            embed.setDescription('Альтернативный метод создания сборов.\n');
        }

        if (color){
            embed.setColor(color);
        } else {
            embed.setColor(0x7df5db);
        }

        if (banner){
            embed.setThumbnail(banner);
        }

        return embed;
    }

    createActionRow(){
        const buttons = [];

        if (this.raids){
            const raidBt = new ButtonBuilder()
            .setCustomId('gen_raid')
            .setLabel('Сбор в рейд')
            .setStyle(ButtonStyle.Primary);
            buttons.push(raidBt);
        }

        if (this.dungs){
            const dungBt = new ButtonBuilder()
            .setCustomId('gen_dung')
            .setLabel('Сбор в подземелье')
            .setStyle(ButtonStyle.Primary);
            buttons.push(dungBt);
        }

        if (this.custom){
            const customBt = new ButtonBuilder()
            .setCustomId('gen_custom')
            .setLabel('Прочие сборы')
            .setStyle(ButtonStyle.Primary);
            buttons.push(customBt);
        }

        const row = new ActionRowBuilder().setComponents(buttons)
        return row;
    }
}