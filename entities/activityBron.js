const ActivityBase = require("./activityBase");
const {ActionRowBuilder, ButtonBuilder, ButtonStyle} = require('discord.js');

module.exports = class ActivityBron extends ActivityBase{
    bron = new Map(); //словарь для забронированных Стражей
    bronSize; //максимальный размер брони
    rowBr = new ActionRowBuilder()
    .addComponents(
        new ButtonBuilder()
            .setCustomId('go_bron')
            .setLabel('Да, запишите меня')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('cancel_bron')
            .setLabel('Нет, я отказываюсь')
            .setStyle(ButtonStyle.Danger),
    );
    bronMessages = new Map();

    constructor(id, mess, name, quant, leader, br1, br2){
        super(id, mess, name, quant, leader);        
        this.bronSize = Math.ceil(quant/2 - 1);
        if (br1){
            const embed = ActivityBron.client.genEmbed(`Вы были записаны лидером активности в ${this}. Ссылка на сбор: ${this.message.url}\nПодтверждаете свою готовность?`, 'Уведомление', undefined, undefined, this.id)
            br1.send({embeds: [embed], components:[this.rowBr]})
            .then(async m => {
                this.bron.set(br1.id, br1);
                this.bronMessages.set(br1.id, m);
            })
            .catch(async err =>{
                console.log(`Ошибка бронирования пользователя ${br1.tag}: ${err.message}`);
                if (this.guildId){
                    const sett = ActivityBron.client.settings.get(this.guildId);
                    sett.sendLog(`Ошибка бронирования пользователя ${br1} в сборе ${this}: ${err.message}`, 'Запись логов: ошибка');
                }
            });          
        }
        if (br2){
            const embed = ActivityBron.client.genEmbed(`Вы были записаны лидером активности в ${this}. Ссылка на сбор: ${this.message.url}\nПодтверждаете свою готовность?`, 'Уведомление', undefined, undefined, this.id)
            br2.send({embeds: [embed], components:[this.rowBr]})
            .then(async m => {
                this.bron.set(br2.id, br2);
                this.bronMessages.set(br2.id, m);
            })
            .catch(async err =>{
                console.log(`Ошибка бронирования пользователя ${br2.tag}: ${err.message}`);
                if (this.guildId){
                    const sett = ActivityBron.client.settings.get(this.guildId);
                    sett.sendLog(`Ошибка бронирования пользователя ${br2} в сборе ${this}: ${err.message}`, 'Запись логов: ошибка');
                }
            });      
        }       
    }

    add(user){
        if (this.bron.has(user.id)){ //проверка на присутствие в списке брони
            this.bronToMember(user);
            return;
        }
        super.add(user);
    }

    remove(id){
        if (this.bron.has(id)){ //проверка на присутствие в списке брони
            this.bronDel(id);
            return;
        }
        super.remove(id);
    }
    //бронирование места Сражу
    bronAdd(user){
        if (this.members.has(user.id)){ //проверка на присутствие в боевой группе
            throw new Error('Пользователь уже записан в боевую группу!'); 
        } 
        if (user.id == this.leader.id){ //проверка на присутствие в боевой группе
            throw new Error('Нельзя забронировать место лидеру, что это вообще за чушь?'); 
        } 
        if (this.bron.has(user.id)){ //проверка на присутствие в списке брони
            throw new Error('Пользователю уже забронировано место!'); 
        } 
        if (this.bron.size == this.bronSize){ //проверка на заполненность брони
            throw new Error('Вы уже забронировали максимум! Для этой активности это ' + this.bronSize + ' места'); 
        } 
        if (this.state == 'Заполнен'){ //проверка на количество стражей с учётом брони
            throw new Error('Сбор уже укомплектован!');
        }
        if (user.bot){ //проверка на случай, если кто-то насильно догадается записать в сбор бота
            throw new Error('Возмутительно! Я не думал, что кому-то придёт в голову совать в сбор бота, но и к этому я был готов');
        }   
        const embed = ActivityBron.client.genEmbed(`Вы были записаны лидером активности в ${this}. Ссылка на сбор: ${this.message.url}\nПодтверждаете свою готовность?`, 'Уведомление', undefined, undefined, this.id);
        user.send({embeds: [embed], components:[this.rowBr]})
        .then(async m => {
            this.bron.set(user.id, user);
            this.bronMessages.set(user.id, m);
            await this.checkQuantity();
            await this.refreshMessage();
        })
        .catch(async err =>{
            console.log(`Ошибка бронирования пользователя ${user.tag}: ${err.message}`);
            if (this.guildId){
                const sett = ActivityBron.client.settings.get(this.guildId);
                sett.sendLog(`Ошибка бронирования пользователя ${user} в сборе ${this}: ${err.message}`, 'Запись логов: ошибка');
            }
        });
        
    }
    //удаление из брони
    bronDel(id){
        if (!this.bron.has(id)){ //проверка на присутствие в боевой группе
            throw new Error('Пользователю не было забронировано место!'); 
        }
        const mess = this.bronMessages.get(id);
        const embed = ActivityBron.client.genEmbed(`Ваша бронь в ${this}) была отозвана!`, 'Уведомление');
        mess.edit({embeds: [embed], components: []}).catch();
        this.bron.delete(id);
        this.bronMessages.delete(id); 
        this.checkQuantity();
        this.refreshMessage();       
    }
    //перевод из брони в боевую группу
    bronToMember(user){
        if (!this.bron.has(user.id)){ //проверка на присутствие в боевой группе
            throw new Error('Пользователю не было забронировано место!'); 
        }
        this.bron.delete(user.id);
        const mess = this.bronMessages.get(user.id);
        const embed = ActivityBron.client.genEmbed(`Вы успешно записаны в ${this}! Бронь снята`, 'Уведомление');
        mess.edit({embeds: [embed], components: []})
        .then(async () => {
            this.bronMessages.delete(user.id);
            this.members.set(user.id, user);
            this.refreshMessage();
        })
        .catch(async () => this.refreshMessage());     
    }
    changeLeader(user){
        if (this.bron.has(user.id)){
            this.bronToMember(user);
        }
        super.changeLeader(user);
    }
    checkQuantity(){
        if (this.members.size + this.bron.size == this.quantity){
            this.state = this.states.get(2);
        } else {
            this.state = this.states.get(1);
        }
    }
    getMembersString(){
        let str = '';
        this.members.forEach(function(value1, value2, mp){
            str += `${value1}\n`;
        });
        if (this.bron){
            this.bron.forEach(function(value1, value2, mp){
                str += `#бронь (${value1})\n`;
            });
        }       
        return str;
    }
}