const DiscManager = require('./discManager');
const Guardian = require('../classes/guardian');
const {Collection} = require('discord.js');
const path = require('node:path');
const fs = require('node:fs');

class GuardianManager extends DiscManager{

    constructor(clan){
        super();
        this.clan = clan;
        this.cache = new Collection();
        this.path = path.join(this.basePath, 'clans', `clan_${clan.id}`, 'guardians');
        if (!fs.existsSync(this.path)){
            fs.mkdirSync(this.path, {recursive:true});
            console.log(`Директория data/clans/clan_${clan.id}/guardians была успешно создана.`);
        }
        this.initAll();
    }

    set(guardian){
        this.cache.set(guardian.id, guardian);
        this.save(guardian);
    }

    get(id){
        return this.cache.get(id);
    }

    async save(guardian){
        const pathToGuardian = path.join(this.path, `guardian_${guardian.id}.json`);
        const data = this.toJSON(guardian);
        fs.writeFile(pathToGuardian, data, async (err) =>{
            if (err){
                console.error(err);
            }
        })
    }

    async delete(guardian){
        this.cache.delete(guardian.id);
        const pathToGuardian = path.join(this.path, `guardian_${guardian.id}.json`);
        fs.unlink(pathToGuardian, async (err) =>{
            if (err){
                console.error(err);
            }
        });
    }

    toJSON(guardian){
        if (!(guardian instanceof Guardian)){
            return;
        }
        
        const data = {
            id: guardian.id,
            clanId: guardian.clanId,
            actCount: guardian.activitiesCount,
            leadCount: guardian.leaderCount
        };

        return JSON.stringify(data);
    }

    async fromJSON(data){
        data = JSON.parse(data);
        const guild = await this.client.guilds.fetch(data.clanId).catch();
        if (!guild){
            message.delete().catch();
            throw new Error('Сервер стража не обнаружен');
        }

        const member = await guild.members.fetch(data.id).catch();
        if (!member){
            message.delete().catch();
            throw new Error('Страж не обнаружен на сервере');
        }
        const guardian = new Guardian(member, data.actCount, data.leadCount);
        
        return guardian;
    }

    async initAll(){
        if (!fs.existsSync(this.path)){
            fs.mkdirSync(this.path, {recursive:true});
        }
        const files = fs.readdirSync(this.path).filter(f => f.endsWith('.json'));
        if (files.length > 0){
            files.forEach((val) => {
                fs.readFile(path.join(this.path, val), async (error, data) =>{
                    if (error){
                        console.error(error);
                        throw error;
                    }
                    try{
                        const guardian = await this.fromJSON(data);
                        this.cache.set(guardian.id, guardian);
                    } catch (err){
                        console.log(`Невозможно загрузить стража ${val}. Причина: ${err.message} Производится удаление...`);
                        fs.unlink(path.join(this.path, val), async (err) => {
                            if (err){
                                console.error(err);
                            }
                        });
                    }                   
                });
            });
        }
    }
}

module.exports = GuardianManager;