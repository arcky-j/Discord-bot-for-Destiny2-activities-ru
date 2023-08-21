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
        const data = this.#toJSON(this.config);
        fs.writeFile(this.path, data, async (error) =>{
            if (error){
                console.error(error);
                this.sendLog(`Не удалось сохранить файл с настройками сервера ${this.clan}:\n${error.message}`, 'Запись логов: ошибка');
            }
        });
    }

    async delete(){
        fs.unlink(this.path, async (error) =>{
            if (error){
                console.error(error);
                this.sendLog(`Не удалось удалить файл с настройками сервера ${this.clan}\n${error.message}`, 'Запись логов: ошибка');
            }
        });

    }

    #toJSON(sett){        
        const data = {
            guildId: sett.guildId,
            rolesToTag: new Array(),
            rolesForNew: new Array(),
            channelJoin: undefined,
            messageJoin: sett.messageJoin,
            messageAccept: sett.messageAccept,
            channelLeave: undefined,
            messageLeave: sett.messageLeave,
            logChannel: undefined,
            archChannel: undefined,
            statsOn: false
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
        if (sett.archiveChannel){
            data.archChannel = sett.archiveChannel.id
        }
        if (sett.statsOn){
            data.statsOn = true;
        }
        return JSON.stringify(data);
    }

    async #fromJSON(data){ 
        try {
            data = JSON.parse(data);
        } catch (err){
            console.log(`Невозможно загрузить файл ${this.path}: ${err.message}`);
            this.delete();
            return;
        }
        const sett = new Settings(this);

        if (data.rolesToTag.length > 0){
            data.rolesToTag.forEach(async (value, index) => {
                const role = await this.clan.guild.roles.fetch(value).catch();
                if (role){
                    sett.rolesToTag.push(role);
                }
            });
        }
        if (data.rolesForNew.length > 0){
            data.rolesForNew.forEach(async (value, index) => {
                const role = await this.clan.guild.roles.fetch(value).catch();
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
        if (data.archChannel){
            const ch = await this.client.channels.fetch(data.archChannel).catch();
            if (ch){
                sett.archiveChannel = ch;
            }           
        }  
        if (data.statsOn){
            sett.statsOn = true;
        }
        sett.messageJoin = data.messageJoin;
        sett.messageAccept = data.messageAccept;
        sett.messageLeave = data.messageLeave;
        return sett;
    }

    async initSettings(){
        if (fs.existsSync(this.path)){
            fs.readFile(this.path, async (error, data) =>{
                if (error){
                    console.error(error);
                    throw error;
                }                  
                const sett = await this.#fromJSON(data);    
                this.config = sett;       
                console.log(`Настройки для сервера ${this.clan} загружены.`);
                sett.sendLog(`Настройки для сервера загружены.`, 'Запись логов');
                this.clan.config = sett;
            });
        } else {
            console.log(`Файл настроек для сервера "${this.clan}" не обнаружен; настройки сервера не загружены; запуск инициализации...`);  
            const sett = new Settings(this);
            const settJSON = this.#toJSON(sett);
            fs.appendFile(this.path, settJSON, async (err) => {
                if (err){
                    console.log(`Ошибка при создании файла настроек для сервера "${this.clan}": ${err.message}`);
                    throw err;
                } 
                console.log(`Файл "${this.path}" (${this.clan}) создан!`);
            });
            
            this.clan.config = sett;
        } 
    }
}

module.exports = SettingsManager;