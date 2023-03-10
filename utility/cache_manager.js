//класс для работы с диском
//по сути нужен только для работы команды рассылки по ролям, чтобы после перезапуска бота всех заного не кэшировать вручную
//теоретически, ускоряет повседневную работу взамен долгой инициализации, но так ли это на практике - не знаю
const fs = require('node:fs');
const Settings = require('./settings.js');
const path = require('node:path');
class CacheManager{
    userManager; //это всё объекты клиента для работы с кэшами пользователей
    usersCache; 
    guildManager;
    guildsCache;

    client;

    pathToUsers; //путь к файлу с сохранёнными пользователями

    constructor(userManager, guildManager, client){
        this.client = client;
        this.userManager = userManager;
        this.usersCache = userManager.cache;
        this.guildManager = guildManager;
        this.guildsCache = guildManager.cache;
        this.pathToUsers = path.join('.', 'data', 'users.json');
        this.pathToSettings = path.join('.', 'data', 'setting.json');
    }
    //сохранение кэша пользователей
    saveCache(){ //обычное сохранение в JSON; сохраняет пользователей в виде массива id
        const idArray = [];
        this.usersCache.forEach((val, id) => {
            idArray.push(id);
        });
        const data = JSON.stringify(idArray) ;
        fs.writeFile(this.pathToUsers, data, 'utf8', (err) => {
            if (err) console.log(err);
        });
    }
    //загрузка кэша пользователей

    async loadCache(){
        if (!fs.existsSync(this.pathToUsers)){ //если файл с сохранёнными пользователями не обнаружен, пытается его создать (вместе с папкой data)
            console.log('файл "./data/users.json" не обнаружен; кэш пользователей не загружен;');
            fs.mkdirSync(path.join('.', 'data'), {recursive:true});
            fs.appendFile(this.pathToUsers, '[]', (err) => {
                if (err) console.log('Ошибка при создании файла "users.json"');
                console.log('файл "./data/users.json" создан!');
            });
            return;
        }
        fs.readFile(this.pathToUsers, 'utf8', async (err, data) => {
            if (err) {console.log(err);} 
            else {
                const users = JSON.parse(data);
                if (users.length == 0){
                    console.log('файл с кэшэм пользователей пуст, кэш не инициализированн');
                    return;
                }
                try {
                    await this.readUsers(users); //метод для общего кэша
                    await this.readMembers(users); //метод для кэшей отдельных серверов
                } catch (err){
                    console.log(`Ошибка с загрузкой кэша пользователей: ${err.message}`)
                }               
                console.log(`Всего загружено ${this.usersCache.size} пользователя(ей)`);
            }            
        });
    }
    //команда для загрузки общего кэша пользователей
    readUsers(array){
        return new Promise((resolve, reject) => {
            array.forEach(async (val) => {
                try {
                    this.usersCache.set(val, await this.userManager.fetch(val)); //просто фетчит id из массива - для записи в кэш этого достаточно
                    if (array.length == this.usersCache.size){
                        resolve(console.log('Кэш пользователей загружен')); //выходит из промиса только когда профетчит всё, что может
                    }
                } catch (err){
                    console.log(`Ошибка с загрузкой кэша пользователей: ${err.message}`)
                }            
            });
        });
    }
    //команда для загрузки кэша пользователей под каждый отдельный сервер; выглядит жутко, но работает
    readMembers(array){
        return new Promise((resolve, reject) => {
            let count = 0;
            array.forEach(async (value) => {
                for(let i = 0; i < this.guildsCache.size; i++){ //дважды использовал бы foreach, но в нём не работает continue
                    const guild = this.guildsCache.at(i);
                    try {
                        await guild.members.fetch(value); //пытается фетчить пользователей для каждого сервера                   
                    } catch {
                        count++;             
                        continue; //если пользователя из общего кэша нет на определённом сервере, просто пропускает ошибку
                    }
                    count++;                                    
                }
                if (count == array.length*this.guildsCache.size){ 
                    resolve(console.log(`Кэши участников сервера загружены`)); //выходит из промиса только когда профетчит всё, что может
                }
            });
        });
    } 

    saveSetting(sett){
        let settArr = [];
        fs.readFileSync(this.pathToSettings, 'utf-8', (err, data) =>{
            if (err) console.log(err);
            else {
                settArr = JSON.parse(data);
            }
        });
        for (let i = 0; i < settArr.length; i++){
            if (settArr[i] == sett){
                settArr[i] = sett;
            }
        }
        settArr.push(sett);
        const data = JSON.stringify(settArr);
        fs.writeFile(this.pathToSettings, data, 'utf8', (err) => {
            if (err) console.log(err);
            console.log('Настройки сохранены');
        });
    }

    loadSettings(){
        this.guildManager.cache.forEach(async (val, id) =>{
            this.client.settings.set(id, new Settings(id));
        });
        console.log('Объекты настроек серверов инициализированны');
        // if (!fs.existsSync(this.pathToSettings)){ //если файл с сохранёнными пользователями не обнаружен, пытается его создать (вместе с папкой data)
        //     console.log('файл "./data/settings.json" не обнаружен; настройки серверов не загружены;');
        //     fs.appendFile(this.pathToSettings, '[]', (err) => {
        //         if (err) console.log('Ошибка при создании файла "settings.json"');
        //         console.log('файл "./data/settings.json" создан!');
        //     });
        //     return;
        // }
        // fs.readFile(this.pathToSettings, 'utf-8', async(err, data) =>{
        //     if (err) console.log(err);
        //     else {
        //         const settings = JSON.parse(data);
        //         if (settings.length == 0){
        //             console.log('Файлов настроек не обнаружено!');
        //             return;
        //         }
        //         try {
        //             settings.forEach(async (val) =>{
        //                 const sett = client.settings.get(val.guildId);                        
        //                 if (val.rolesToTag.length > 0){
        //                     sett.rolesToTag = val.rolesToTag;
        //                 }
        //                 if (val.resetChannel){
        //                     sett.resetChannel = val.resetChannel;
        //                 }
        //                 if (val.resetUpdaters.length > 0){
        //                     sett.resetUpdaters = val.resetUpdaters;
        //                 }
        //                 if (val.rolesForNew.length > 0){
        //                     sett.rolesForNew = val.rolesForNew;
        //                 }
        //                 if (val.channelJoin){
        //                     sett.channelJoin = val.channelJoin;
        //                 }
        //                 if (val.channelLeave){
        //                     sett.channelLeave = val.channelLeave;
        //                 }
        //                 sett.messageJoin = val.messageJoin;
        //                 sett.messageLeave = val.messageLeave;
        //             });
        //         } catch (error) {
        //             console.log(error);
        //         }
        //         console.log(`Настройки для серверов (${settings.length}) загружены`);
        //     }
        // });
    }

    //команда для инициализации всего (тут были другие загручики, вдруг они появятся снова)

    async loadAll(){
        this.loadCache();
        this.loadSettings();
    }
}

module.exports = CacheManager;