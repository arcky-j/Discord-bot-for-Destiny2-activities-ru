const ActivityUntimed = require("./activityUntimed");
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = class FireteamUntimed extends ActivityUntimed{
    pathToFireteams = path.join('.', 'data', 'fireteamsUntimed');
    constructor(id, guildId, name, quant, leader, br1, br2){
        super(id, guildId, name, quant, leader, br1, br2);
        this.members.set(leader.id, leader);
    }
    
    createEmbed(color, descript, banner, media){
        const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle(this.name)
        .setDescription(descript)
        .addFields(
            {name: 'Время и дата', value: `По готовности`, inline: false},
            {name: 'Статус', value: `Инициализация`, inline: true},
            {name: 'Лидер', value: `...`, inline: true},
            {name: 'Боевая группа', value: '...', inline: false}
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
                    .setCustomId('activity_go')
                    .setLabel('Я точно иду!')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('activity_cancel')
                    .setLabel('Я передумал')
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
                    .setCustomId('change_leader')
                    .setLabel('Передать лид.')
                    .setStyle(ButtonStyle.Secondary),                   
                new ButtonBuilder()
                    .setCustomId('close')
                    .setLabel('Отменить')
                    .setStyle(ButtonStyle.Danger)      
            );          
        const row2 = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('bron_add')
                .setLabel('Добавить бронь')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('bron_delete')
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
        this.refreshMessage();
    }

    async refreshMessage(){
        if (!this.message){
            return;
        }
        await super.refreshMessage();
        this.save();
    }

    updateMessage(){
        if (!this.message){
            return;
        }
        const embed = super.updateMessage();
        this.save();
        return embed;
    }

    static async initAll(){
        const pathToFireteams = path.join('.', 'data', 'fireteamsUntimed');
        if (!fs.existsSync(pathToFireteams)){
            fs.mkdirSync(pathToFireteams, {recursive:true});
            console.log('Директория для хранения боевых групп по готовности была успешно создана.')
        }
        const files = fs.readdirSync(pathToFireteams).filter(f => f.endsWith('.json'));
        if (files.length > 0){
            files.forEach((val) => {
                fs.readFile(path.join(pathToFireteams, val), async (error, data) =>{
                    if (error){
                        console.error(error);
                        throw error;
                    }
                    try{
                        const fireteam = await this.fromJSON(data);
                        this.client.activities.set(fireteam.id, fireteam);
                        setTimeout(() => {
                            //fireteam.checkQuantity();
                            fireteam.refreshMessage();
                        }, 10000);
                        console.log(`Загружена боевая группа ${fireteam}`);
                        if (fireteam.guildId){
                            const sett = FireteamUntimed.client.settings.get(fireteam.guildId);
                            sett.sendLog(`Загружена боевая группа ${fireteam}`, 'Запись логов: успех');
                        }
                    } catch (err){
                        console.log(`Невозможно загрузить боевую группу ${val}. Причина: ${err.message} Производится удаление...`);
                        fs.unlink(path.join(pathToFireteams, val), async (err) => {
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
        const pathToTeam = path.join(this.pathToFireteams, `fireteam_${this.id}.json`);
        const data = await FireteamUntimed.toJSON(this);
        fs.writeFile(pathToTeam, data, async (err) =>{
            if (err){
                console.error(err);
                if (this.guildId){
                    const sett = FireteamUntimed.client.settings.get(this.guildId);
                    sett.sendLog(`Не удалось сохранить в файл ${this}: ${err.message}`, 'Запись логов: ошибка');
                }
            }
        })
    }

    async delete(){
        const pathToTeam = path.join(this.pathToFireteams, `fireteam_${this.id}.json`);
        fs.unlink(pathToTeam, async (err) =>{
            if (err){
                console.error(err);
                if (this.guildId){
                    const sett = FireteamUntimed.client.settings.get(this.guildId);
                    sett.sendLog(`Не удалось удалить файл с ${this}: ${err.message}`, 'Запись логов: ошибка');
                }
            }
        });
        super.delete();
    }

    static async toJSON(team){
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
        message.fireteam = true;
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
} 