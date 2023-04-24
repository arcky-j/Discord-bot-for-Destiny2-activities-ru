const ActivityUntimed = require("./activityUntimed");
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');

module.exports = class FireteamUntimed extends ActivityUntimed{
    pathToFireteams = path.join('.', 'data', 'fireteamsUntimed');
    constructor(id, mess, name, quant, leader, br1, br2){
        super(id, mess, name, quant, leader, br1, br2);
        this.members.set(leader.id, leader);
    }

    remove(id){
        if (id == this.leaderId){ //проверка на лидерство
            throw new Error('Лидер не может покинуть боевую группу!');
        }
        super.remove(id);
    }

    createActionRow(){
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('go_fireteam')
                    .setLabel('Я точно иду!')
                    .setStyle(ButtonStyle.Success),
                new ButtonBuilder()
                    .setCustomId('cancel_fireteam')
                    .setLabel('Я передумал')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('fireteam_start')
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
            {name: 'Время и дата', value: `По готовности`, inline: true},
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

    changeLeader(user){
        if (user.id == this.leaderId){ //проверка на случай попытки сменить себя на себя
            throw new Error('Лидер пытается сменить себя на себя! чзх? я не буду это комментировать...');
        }

        if (user.bot){ //на всякий случай проверка, пытаются ли сделать лидером бота
            throw new Error('Возмутительно! Я не думал, что кому-то придёт назначать лидером бота, но и к этому я был готов');
        }

        if (this.members.has(user.id)){ 
            this.leaderId = user.id; //если новый лидер был в боевой группе, просто передаёт лидерство
        } else{
            //если нового лидера нет ни в боевой группе, ни в резерве              
            if (this.state == 'Заполнен'){                    
                this.members.delete(this.leaderId); //если группа была заполнена, удаляет предыдущего лидера
                this.members.set(user.id, user); //и только потом записывает нового лидера в боевую группу 
                this.leaderId = user.id;                
            } else {
                this.members.set(user.id, user); //если места есть, просто добавляет нового Стража и делает его лидером
                this.leaderId = user.id; 
            }
            this.checkQuantity();
        }   
        this.refreshMessage();
    }

    refreshMessage(){
        super.refreshMessage();
        this.save();
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
                        this.client.fireteams.set(fireteam.id, fireteam);
                        setTimeout(() => {
                            fireteam.checkQuantity();
                            fireteam.refreshMessage();
                        }, 10000);
                        console.log(`Загружена боевая группа ${fireteam.name} (${fireteam.id})`);
                    } catch (err){
                        console.log(`Невозможно загрузить боевую группу ${val}. Причина: ${err.message} Производится удаление...`);
                        fs.unlink(path.join(pathToFireteams, val), (err) => {
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
        const pathToTeam = path.join(this.pathToFireteams, `fireteam_${this.id}.json`);
        const data = FireteamUntimed.toJSON(this);
        fs.writeFile(pathToTeam, data, (err) =>{
            if (err){
                console.error(err);
                throw err;
            }
        })
    }

    delete(){
        const pathToTeam = path.join(this.pathToFireteams, `fireteam_${this.id}.json`);
        fs.unlink(pathToTeam, (err) =>{
            if (err){
                console.error(err);
            }
        });
    }

    static toJSON(team){
        if (!(team instanceof FireteamUntimed)){
            return;
        }
        
        const data = {
            id: team.id,
            message: team.message.id,
            channel: team.message.channelId,
            name: team.name,
            quantity: team.quantity,
            leaderId: team.leaderId,
            members: new Array(),
            state: team.state,
            bron: new Array(),
            bronMessages: new Array(),
            bronChannels: new Array()
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
        const leader = await this.client.users.fetch(data.leaderId).catch();
        if (!leader){
            message.delete().catch();
            throw new Error('Лидер сбора не обнаружен');
        }
        const fireteam = new FireteamUntimed(data.id, message, data.name, data.quantity, leader);
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