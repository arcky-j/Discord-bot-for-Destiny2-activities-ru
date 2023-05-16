//класс для сохранения и менеджмента настроек бота на сервере
const {EmbedBuilder} = require('discord.js');
const fs = require('node:fs');
const path = require('node:path');
const Base = require('./base');

class Settings extends Base{
    guildId; 
    rolesToTag = []; //роли для тэгов в сборах
    rolesForNew = []; //роли для присвоения новичкам на сервере
    channelJoin; //канал уведомлений о прибывших
    messageJoin; //уведомление о прибытии
    messageAccept; 
    channelLeave; //канал уведомлений о ливах 
    messageLeave; //уведомление о ливах
    logChannel;

    pathToSettings = path.join('.', 'data', 'settings');

    //static client;

    constructor(id){
        super();
        this.guildId = id;
        this.messageJoin = '# прибыл на сервер!';
        this.messageAccept = '# принял правила сервера!';
        this.messageLeave = '# покинул сервер';        
    }

    setRoleTags(r0, r1, r2, r3, r4){
        this.rolesToTag = [];
        if (r0){
            this.rolesToTag.push(r0);
            }  
        if (r1){
            this.rolesToTag.push(r1);
        }
        if (r2){
            this.rolesToTag.push(r2);
        }
        if (r3){
            this.rolesToTag.push(r3);
        }
        if (r4){
            this.rolesToTag.push(r4);
        }
        this.save();
    }

    setRolesForNew(r0, r1, r2){
        this.rolesForNew = [];
        if (r0){
            this.rolesForNew.push(r0.id);
        }
        if (r1){
            this.rolesForNew.push(r1.id);
        }
        if (r2){
            this.rolesForNew.push(r2.id);
        }
        this.save();
    }

    setJLChannels(chJ, chL){
        this.channelJoin = undefined;
        this.channelLeave = undefined;
        if (chJ){
            this.channelJoin = chJ;
        }
        if (chL){
            this.channelLeave = chL;
        }
        this.save();
    }

    setLogChannel(ch){
        this.logChannel = undefined;
        if (ch){
            this.logChannel = ch;
        }
        this.save();
    }

    setJALMessages(messJ, messA, messL){
        if (messJ){
            this.messageJoin = messJ;
        }
        if (messA){
            this.messageAccept = messA;
        }
        if (messL){
            this.messageLeave = messL;
        }
        this.save();
    }

    async sendLog(message, title){
        if (this.logChannel){
            const embed = Settings.client.genEmbed(message, title);
            this.logChannel.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением лога на сервере ${this.guildId}: ${err.message}\nСброс канала с логами...`);
                this.logChannel = undefined;
            });
        }
    }

    async sendJoinAlert(member){
        const color = member.roles.highest.color;
        if (this.messageJoin.match(/#/)){
            const embed = new EmbedBuilder().setTitle('Уведомление').setDescription(this.messageJoin.replace('#', `<@${member.user.id}> (**${member.user.tag}**)`)).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelJoin.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления о прибытии в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления о прибытии в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelJoin = undefined;
            }); //оповещает о прибытии
        } else {
            const embed = new EmbedBuilder().setTitle('Уведомление (стандартное - в тексте уведомления нет *#*)').setDescription(`<@${member.user.id}> (**${member.user.tag}**) прибыл на сервер!`).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelJoin.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления о прибытии в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления о прибытии в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelJoin = undefined;
            });
        }
    }

    async sendAcceptAlert(member){
        const color = member.roles.highest.color;
        if (this.messageAccept.match(/#/)){
            const embed = new EmbedBuilder().setTitle('Уведомление').setDescription(this.messageAccept.replace('#', `<@${member.user.id}> (**${member.user.tag}**)`)).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelJoin.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления о принятии правил в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления о принятии правил в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelJoin = undefined;
            }); 
        } else {
            const embed = new EmbedBuilder().setTitle('Уведомление (стандартное - в тексте уведомления нет *#*)').setDescription(`<@${member.user.id}> (**${member.user.tag}**) принял правила сервера!`).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelJoin.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления о принятии правил в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления о принятии правил в ${this.channelJoin}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelJoin = undefined;
            });
        }
    }

    async sendLeaveAlert(member){
        const color = member.roles.highest.color;
        if (this.messageLeave.match(/#/)){
            const embed = new EmbedBuilder().setTitle('Уведомление').setDescription(this.messageLeave.replace('#', `**${member.user.tag}**`)).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelLeave.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления об уходе в ${this.channelLeave}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления об уходе в ${this.channelLeave}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelLeave = undefined;
            }); //оповещает об уходе
        } else {
            const embed = new EmbedBuilder().setTitle('Уведомление (стандартное - в тексте уведомления нет *#*)').setDescription(`**${member.user.tag}** покинул сервер!`).setTimestamp(new Date()).setThumbnail(member.displayAvatarURL()).setColor(color);
            this.channelLeave.send({embeds: [embed]}).catch(err => {
                console.log(`Ошибка с отправлением уведомления об уходе в ${this.channelLeave}: ${err.message}\nСброс канала с уведомлениями...`);
                this.sendLog(`Ошибка с отправлением уведомления об уходе в ${this.channelLeave}: ${err.message}\nСброс канала с уведомлениями...`); 
                this.channelLeave = undefined;
            });
        }
    }

    async save(){
        const pathGuildSetting = path.join(this.pathToSettings, `guild_${this.guildId}.json`);
        const data = await Settings.toJSON(this);
        fs.writeFile(pathGuildSetting, data, async (error) =>{
            if (error){
                console.error(error);
                this.sendLog(`Не удалось сохранить файл с настройками сервера`, 'Запись логов: ошибка');
            }
        });
    }

    async delete(){
        const pathGuildSetting = path.join(this.pathToSettings, `guild_${this.guildId}.json`);
        Settings.client.settings.delete(this.guildId);
        fs.unlink(pathGuildSetting, async (error) =>{
            if (error){
                console.error(error);
                this.sendLog(`Не удалось удалить файл с настройками сервера`, 'Запись логов: ошибка');
            }
        });

    }

    static async initSingle(guild){
        const sett = new Settings(guild.id);
        const pathGuildSetting = path.join('.', 'data', 'settings', `guild_${guild.id}.json`);
        const settJSON = JSON.stringify(sett);
        fs.appendFile(pathGuildSetting, settJSON, async (err) => {
            if (err){
                console.log(`Ошибка при создании файла настроек для сервера "${val.name}": ${err.message}`);
                throw err;
            } 
            console.log(`Файл "${pathGuildSetting}" (${guild.name}) создан!`);
        });
        this.client.settings.set(guild.id, sett);           
    }

    static async initSettings(){     
        if (!fs.existsSync(path.join('.', 'data', 'settings'))){
            fs.mkdirSync(path.join('.', 'data', 'settings'), {recursive: true});
        }
        this.client.guilds.cache.forEach(async (val, id) =>{
            const pathGuildSetting = path.join('.', 'data', 'settings', `guild_${id}.json`);
            if (fs.existsSync(pathGuildSetting)){
                fs.readFile(pathGuildSetting, async (error, data) =>{
                    if (error){
                        console.error(error);
                        throw error;
                    }                  
                    const sett = await Settings.fromJSON(JSON.parse(data));    
                    this.client.settings.set(id, sett);       
                    console.log(`Настройки для сервера ${val.name} загружены.`);
                    sett.sendLog(`Настройки для сервера загружены.`, 'Запись логов');
                });
            } else {
                console.log(`Файл настроек для сервера "${val.name}" не обнаружен; настройки сервера не загружены; запуск инициализации...`);  
                const sett = new Settings(id);              
                const settJSON = JSON.stringify(sett);
                fs.appendFile(pathGuildSetting, settJSON, async (err) => {
                    if (err){
                        console.log(`Ошибка при создании файла настроек для сервера "${val.name}": ${err.message}`);
                        throw err;
                    }                    
                    this.client.settings.set(id, sett);
                    console.log(`Файл "${pathGuildSetting}" (${val.name}) создан!`);
                });
            }          
        });
        console.log('Объекты настроек серверов инициализированны');
    }

    static async toJSON(sett){
        if (!(sett instanceof Settings)){
            return;
        }
        
        const data = {
            guildId: sett.guildId,
            rolesToTag: new Array(),
            rolesForNew: new Array(),
            channelJoin: undefined,
            messageJoin: sett.messageJoin,
            messageAccept: sett.messageAccept,
            channelLeave: undefined,
            messageLeave: sett.messageLeave,
            logChannel: undefined
        };

        if (sett.rolesToTag.length > 0){
            sett.rolesToTag.forEach(val =>{
                data.rolesToTag.push(val.id);
            });
        }

        if (sett.rolesForNew.length > 0){
            sett.rolesForNew.forEach(val =>{
                data.rolesForNew.push(val);
            });
        }
        
        if (sett.channelJoin){
            data.channelJoin = sett.channelJoin.id;
        }
        if (sett.logChannel){
            data.logChannel = sett.logChannel.id;
        }
        if (sett.channelLeave){
            data.channelLeave = sett.channelLeave.id;
        }
        const dataJS = JSON.stringify(data);
        return dataJS;
    }

    static async fromJSON(data){ //сделай то же, но для сохранения - для фетча хватит и айди - вдруг забудешь
        const sett = new Settings(data.guildId);
        const guild = await this.client.guilds.fetch(data.guildId);
        if (data.rolesToTag.length > 0){
            data.rolesToTag.forEach(async (value, index) => {
                const role = await guild.roles.fetch(value).catch();
                if (role){
                    sett.rolesToTag.push(role);
                }
            });
        }
        if (data.rolesForNew.length > 0){
            data.rolesForNew.forEach(async (value, index) => {
                const role = await guild.roles.fetch(value).catch();
                if (role){
                    sett.rolesForNew.push(value);
                }
            });
        }
        if (data.channelJoin){
            const ch = await this.client.channels.fetch(data.channelJoin).catch();
            if (ch){
                sett.channelJoin = ch;
            }        
        }  
        if (data.channelLeave){
            const ch = await this.client.channels.fetch(data.channelLeave).catch();
            if (ch){
                sett.channelLeave = ch;
            }   
        }
        if (data.logChannel){
            const ch = await this.client.channels.fetch(data.logChannel).catch();
            if (ch){
                sett.logChannel = ch;
            }           
        }  
        sett.messageJoin = data.messageJoin;
        sett.messageAccept = data.messageAccept;
        sett.messageLeave = data.messageLeave;
        return sett;
    }

    getString(){
        let strT = '';
        this.rolesToTag.forEach((val) => {
            strT += `${val} `;
        });

        let strN = '';
        this.rolesForNew.forEach((val) =>{
            strN += `<@&${val}> `;
        });

        let strCHJ = '';
        if (this.channelJoin){
            strCHJ = `${this.channelJoin}`;
        }

        let strCHL = '';
        if (this.channelLeave){
            strCHL = `${this.channelLeave}`;
        }

        let strLog = '';
        if (this.logChannel){
            strLog = `${this.logChannel}`;
        }

        const str = `Роли, упоминаемые в сборах: ${strT}\nРоли для новоприбывших: ${strN}\nКанал для уведомлений о прибытии: ${strCHJ}\nУведомление о прибытии: ${this.messageJoin}\nУведомление о принятии правил: ${this.messageAccept}\nКанал для уведомлений об уходе: ${strCHL}\nУведомление об уходе: ${this.messageLeave}\nКанал с логами: ${strLog}`;
        return str;
    }
}

module.exports = Settings;