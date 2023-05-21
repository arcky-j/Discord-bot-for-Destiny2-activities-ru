const DiscManager = require('./discManager');
const Settings = require('../classes/settings');
const path = require('node:path');
const fs = require('node:fs');

class SettingsManager extends DiscManager{

    constructor(clan){
        super();
        this.clan = clan;
        this.path = path.join(this.basePath, 'clans', `clan_${clan.id}`, 'settings.json');
        if (!fs.existsSync(this.path)){
            fs.mkdirSync(path.dirname(this.path), {recursive:true});
        }
        this.initSettings();
    }

    async save(){
        const data = this.toJSON(this);
        fs.writeFile(this.path, data, async (error) =>{
            if (error){
                console.error(error);
                this.sendLog(`Не удалось сохранить файл с настройками сервера ${this.clan.id}`, 'Запись логов: ошибка');
            }
        });
    }

    async delete(){
        fs.unlink(this.path, async (error) =>{
            if (error){
                console.error(error);
                this.sendLog(`Не удалось удалить файл с настройками сервера ${this.clan.id}`, 'Запись логов: ошибка');
            }
        });

    }

    toJSON(sett){
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

    async fromJSON(data){ 
        data = JSON.parse(data);
        const sett = new Settings(data.guildId);
        const guild = await this.client.guilds.fetch(data.guildId);

        if (!guild){
            message.delete().catch();
            throw new Error('Сервер настроек не обнаружен');
        }

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

    async initSingle(guild){
        const sett = new Settings(guild.id);
        const settJSON = this.toJSON(sett);
        fs.appendFile(this.path, settJSON, async (err) => {
            if (err){
                console.log(`Ошибка при создании файла настроек для сервера "${val.name}": ${err.message}`);
                throw err;
            } 
            console.log(`Файл "${this.path}" (${guild.name}) создан!`);
        });
        
        this.config = sett;           
    }

    async initSettings(){
        if (fs.existsSync(this.path)){
            fs.readFile(this.path, async (error, data) =>{
                if (error){
                    console.error(error);
                    throw error;
                }                  
                const sett = await this.fromJSON(data);    
                this.config = sett;       
                console.log(`Настройки для сервера ${this.clan.guild.name} загружены.`);
                sett.sendLog(`Настройки для сервера загружены.`, 'Запись логов');
            });
        } else {
            console.log(`Файл настроек для сервера "${this.clan.guild.name}" не обнаружен; настройки сервера не загружены; запуск инициализации...`);  
            this.initSingle(this.clan.guild);
        } 
    }
}

module.exports = SettingsManager;