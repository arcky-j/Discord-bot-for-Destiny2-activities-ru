//класс для работы с диском
//по сути нужен только для работы команды рассылки по ролям, чтобы после перезапуска бота всех заного не кэшировать вручную
//теоретически, ускоряет повседневную работу взамен долгой инициализации, но так ли это на практике - не знаю
const fs = require('node:fs');
const path = require('node:path');
class CacheManager{
    userManager; //это всё объекты клиента для работы с кэшами пользователей
    usersCache; 
    guildManager;
    guildsCache;

    pathToUsers; //путь к файлу с сохранёнными пользователями

    constructor(userManager, guildManager){
        this.userManager = userManager;
        this.usersCache = userManager.cache;
        this.guildManager = guildManager;
        this.guildsCache = guildManager.cache;
        this.pathToUsers = path.join('.', 'data', 'users.json');
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
                this.usersCache.set(val, await this.userManager.fetch(val)); //просто фетчит id из массива - для записи в кэш этого достаточно
                if (array.length == this.usersCache.size){
                    resolve(console.log('Кэш пользователей загружен')); //выходит из промиса только когда профетчит всё, что может
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
    

    //команда для инициализации всего (тут были другие загручики, вдруг они появятся снова)

    async loadAll(){
        this.loadCache();
    }
}

module.exports = CacheManager;