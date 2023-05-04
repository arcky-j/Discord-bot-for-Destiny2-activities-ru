const Base = require('./base');
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Collection} = require('discord.js');

module.exports = class MapVote extends Base{
    id;
    message;
    users = new Collection();
    voteCount = 1;
    totalVotes;
    initLength;
    mapPool = [];

    constructor(id, users, maps){
        super();
        this.id = id;
        this.users = users;
        this.users.forEach(element => {
            element.votes = 0;
        });
        this.totalVotes = this.voteCount * this.users.size;
        maps.forEach((val) => {
            this.mapPool.push(val);
        });
        this.initLength = this.mapPool.length;
    }

    createEmbed(creatorId){
        let usStr = '';
        this.users.forEach((val) => {
            usStr += `${val}\n`;
        });
        const embed = new EmbedBuilder()
        .setTitle(`Голосование ${this.id}`)
        .setDescription(`${usStr}\nКаждый может убрать ${this.voteCount} карту. Нажмите на соответствующую кнопку, чтобы удалить карту`)
        .setFields({name: 'Пул карт:', value: this.getMapsString()})
        .setFooter({text: creatorId});
        return embed;
    }

    createActionRow(){
        if (this.mapPool.length > 1){
            const buttons = [];
            this.mapPool.forEach((val) =>{
                const bt = new ButtonBuilder()
                .setCustomId(`mapVote_${val}_${this.id}`)
                .setLabel(val)
                .setStyle(ButtonStyle.Danger);
                buttons.push(bt);
            })
            
            const row = new ActionRowBuilder()
                .addComponents(buttons);
            return row;
        } else {
            const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('map_vote_start')
                    .setLabel('Старт матча')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('map_vote_close')
                    .setLabel('Закрыть тикет')
                    .setStyle(ButtonStyle.Danger)         
            );
            return row;
        }  
    }

    vote(map, userId){
        const user = this.users.get(userId);
        if (user.votes >= this.voteCount){
            throw new Error('Пользователь отдал максимальное количество голосов!');
        }
        const filter = (mapF) => mapF == map;
        const id = this.mapPool.findIndex(filter);
        if (id == -1){
            throw new Error('Не удалось найти нужную карту!');
        }
        this.mapPool.splice(id, 1);
        user.votes++;
        return this.updateMessage();          
    }

    refreshMessage(){
        const embed = this.message.embeds[0];
        embed.fields[0].value = this.getMapsString();
        const row = this.createActionRow();
        this.message.edit({embeds: [embed], components: [row]}).catch(err => {
            console.log(`Ошибка изменения голосования ${this}: ${err.message}`);
            if (this.message.guildId){
                const sett = MapVote.client.settings.get(this.message.guildId);
                sett.sendLog(`Ошибка изменения голосования ${this}: ${err.message}`, 'Запись логов: ошибка');
            }
        });
    }

    updateMessage(){
        const embed = this.message.embeds[0];
        if (this.mapPool.length <= this.initLength - this.totalVotes){
            const random = Math.floor(Math.random() * this.mapPool.length);
            const map = this.mapPool[random]
            embed.fields[0].value = map;
            embed.fields[0].name = 'Карта выбрана!';
            this.mapPool = [map];
        } else{
            embed.fields[0].value = this.getMapsString();
        }
        const row = this.createActionRow();
        return [embed, row];
    }

    start(){
        this.users.forEach((val) =>{
            val.voice.setDeaf(true).catch(err => {
                console.log(`Ошибка выдачи наушников ${val.tag}: ${err.message}`);
                if (val.guild.id){
                    const sett = MapVote.client.settings.get(val.guild.id);
                    sett.sendLog(`Ошибка выдачи наушников ${val}: ${err.message}`, 'Запись логов: ошибка');
                }
            });
            val.voice.setMute(true).catch(err => {
                console.log(`Ошибка выдачи микрофона ${val.tag}: ${err.message}`);
                if (val.guild.id){
                    const sett = MapVote.client.settings.get(val.guild.id);
                    sett.sendLog(`Ошибка выдачи микрофона ${val}: ${err.message}`, 'Запись логов: ошибка');
                }
            });
        });
    }

    delete(){
        this.users.forEach((val) =>{
            val.voice.setDeaf(false).catch(err => {
                console.log(`Ошибка взятия наушников ${val.tag}: ${err.message}`);
                if (val.guild.id){
                    const sett = MapVote.client.settings.get(val.guild.id);
                    sett.sendLog(`Ошибка взятия наушников ${val}: ${err.message}`, 'Запись логов: ошибка');
                }
            });
            val.voice.setMute(false).catch(err => {
                console.log(`Ошибка взятия микрофона ${val.tag}: ${err.message}`);
                if (val.guild.id){
                    const sett = MapVote.client.settings.get(val.guild.id);
                    sett.sendLog(`Ошибка взятия микрофона ${val}: ${err.message}`, 'Запись логов: ошибка');
                }
            });
            delete val.votes;
        });
        this.message.delete().catch(err => {
            console.log(`Ошибка удаления голосования ${this}: ${err.message}`);
            if (this.message.guildId){
                const sett = MapVote.client.settings.get(this.message.guildId);
                sett.sendLog(`Ошибка удаления голосования ${this}: ${err.message}`, 'Запись логов: ошибка');
            }
        });
    }

    getMapsString(){
        let mapString = '';
        this.mapPool.forEach(element => {
            mapString += `${element}\n`
        });
        return mapString;
    }

    toString(){
        return `Голосование №${this.id}`
    }
}