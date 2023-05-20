const DiscManager = require('./discManager');
const Clan = require('../classes/clan');
const {Collection} = require('discord.js');

const path = require('node:path');
const fs = require('node:fs');

class ClanManager extends DiscManager{

    constructor(){
        super();
        this.cache = new Collection();
        this.path = path.join(this.basePath, 'clans');
        this.initAll();
    }

    set(clan){
        this.cache.set(clan.id, clan);
    }

    get(id){
        return this.cache.get(id);
    }

    getActivity(clanId, actId){
        const clan = this.cache.get(clanId);
        return clan.activities.get(actId);
    }

    getGuardian(clanId, guardId){
        const clan = this.cache.get(clanId);
        return clan.guardians.get(guardId);
    }

    getConfig(clanId){
        const clan = this.cache.get(clanId);
        return clan.settings.config;
    }

    setActivity(clanId, act){
        const clan = this.cache.get(clanId);
        clan.activities.set(act.id, act);
    }

    setGuardian(clanId, guard){
        const clan = this.cache.get(clanId);
        clan.guardians.set(guard.id, guard);
    }

    async initSingle(guild){
        const clan = new Clan(guild);
        const clanJSON = JSON.stringify(sett);
        fs.mkdirSync(path.join(this.path, `clan_${clan.id}`), clanJSON, async (err) => {
            if (err){
                console.log(`Ошибка при создании файла настроек для сервера "${guild.name}": ${err.message}`);
                throw err;
            } 
            console.log(`Файл "${this.path}/clan_${clan.id}" (${guild.name}) создан!`);
        });
        
        this.cache.set(clan.id, clan);           
    }

    async delete(guild){
        this.cache.delete(guild.id);
        const pathToClan = path.join(this.path, `clan_${guild.id}`);
        fs.unlink(pathToClan, async (err) => {
            if (err){
                console.error(err);
            }
        });
    }

    async initAll(){
        if (!fs.existsSync(this.path)){
            fs.mkdirSync(this.path, {recursive:true});
            console.log(`Инициализация ${this.path}`);
            this.client.guilds.cache.forEach( async (val, id) => {
                const clan = new Clan(val);
                this.cache.set(clan.id, clan);
            });
            return;
        }
        const clans = fs.readdirSync(this.path).filter(f => f.match(/clan_/));
        if (clans.length > 0){
            clans.forEach(async (val) => {
                const id = val.split('_')[1];
                const guild = await this.client.guilds.fetch(id);
                if (!guild){
                    console.log(`Невозможно загрузить клан ${val}. Причина: сервер не обнаружен Производится удаление...`);
                    fs.unlink(path.join(this.path, val), async (err) => {
                        if (err){
                            console.error(err);
                        }
                    });
                    return;
                }
                const clan = new Clan(guild);
                this.cache.set(clan.id, clan);               
            });
        }
    }
}

module.exports = ClanManager;