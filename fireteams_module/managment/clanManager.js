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
        return clan.config;
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
        fs.mkdirSync(path.join(this.path, `clan_${clan.id}`), async (err) => {
            if (err){
                console.log(`Ошибка при создании файла настроек для сервера "${guild.name}": ${err.message}`);
                throw err;
            } 
            console.log(`Директория "${this.path}/clan_${clan.id}" (${guild.name}) создана!`);
        });
        
        this.cache.set(clan.id, clan);           
    }

    async delete(guild){
        this.cache.delete(guild.id);
        const pathToClan = path.join(this.path, `clan_${guild.id}`);
        fs.rmdir(pathToClan, async (err) => {
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

    #dateSet(timeText, dateText){
        //принимает время в формате "ЧЧ:ММ"
        if (!timeText.includes(':')){
            throw new Error('Неправильный формат времени!');
        }
        //принимает дату в формате "ДД.ММ" или "ДД.ММ.ГГ", или "ДД.ММ.ГГГГ"
        if (dateText && !dateText.includes('.')){
            throw new Error('Неправильный формат Даты!');
        }
    
        const hour = parseInt(timeText.split(':')[0]); //парсит часы
        const minute = parseInt(timeText.split(':')[1]); //парсит минуты
    
        const today = new Date();
        let day, month, year;
    
        if (dateText){
            day = parseInt(dateText.split('.')[0]); //парсит день
            month = parseInt(dateText.split('.')[1]) - 1; //парсит месяц
        } else {
            day = today.getDate();
            month = today.getMonth();
        }
    
        if (dateText && dateText.split('.').length == 3){ //проверяет: введён ли пользователем год?
            if (dateText.split('.')[2].length == 2){
                year = parseInt('20' + dateText.split('.')[2]); //если введён в формате "ГГ", добавляет "20" - "20ГГ" и парсит
            } else if (dateText.split('.')[2].length == 4){
                year = parseInt(dateText.split('.')[2]); //если введён в формате "ГГГГ", просто парсит
            } else {
                throw new Error('Формат года некорректен! Или пишите год целиком, или последние две цифры. Третьего не дано');
            }
        } else {
            year = today.getFullYear(); //если год не введёт, просто берёт текущий
        }
    
        //обычные проверки на корректность введённого времени
        //чтобы не было даты в виде 28:76 34.13.20223, например
        if (hour < 0 || hour > 23){
            throw new Error('Время сбора введено некорректно!');
        }
        if (minute < 0 || minute > 59){
            throw new Error('Время сбора введено некорректно!');
        }
    
        switch (month + 1){
            case 1:
            case 3:
            case 5:
            case 7:
            case 8:
            case 10:
            case 12: 
                if (day < 0 || day > 31) {
                    throw new Error('Дата сбора введёна некорректно!');
                }
                break;
            case 4:
            case 6:
            case 9:
            case 11:
                if (day < 0 || day > 30) {
                    throw new Error('Дата сбора введёна некорректно!');
                }
                break;
            case 2: //проверка даже для високосного года - зачем?
                if (year%4 != 0){
                    if (day < 0 || day > 28) {
                        throw new Error('Дата сбора введёна некорректно!');
                    }
                } else {
                    if (day < 0 || day > 29) {
                        throw new Error('Дата сбора введёна некорректно!');
                    }
                }            
                break;
            default: throw new Error('Дата сбора введёна некорректно!');
        }
        //только после всех проверок устанавливается дата
        const activityDate = new Date(year, month, day, hour, minute, 0);
        //и сразу проверяется на актуальность
        if (activityDate - today < 0){
            throw new Error('Введена прошедшая дата!');
        }
    
        return activityDate;
    }

    #generateId(cache){
        let id = '0451';
        const maxId = 10000;
        if (cache.has(id)){
            do{
                id = Math.floor(Math.random() * maxId);
            } while (cache.has(id))      
        }
        if (id == '0451'){
            return id.toString();
        }
        return id.toString();
    }

    utility = {
        dateSet: this.#dateSet,
        generateId: this.#generateId
    }
}

module.exports = ClanManager;