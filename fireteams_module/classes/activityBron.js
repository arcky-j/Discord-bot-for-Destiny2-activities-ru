const ActivityBase = require("./activityBase");
const {ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection} = require('discord.js');
const ActivityEvents = require('../consts/activityEvents');

module.exports = class ActivityBron extends ActivityBase{
    bron = new Collection(); //словарь для забронированных Стражей
    bronSize; //максимальный размер брони

    constructor(id, clan, name, quant, leader, br1, br2){
        super(id, clan, name, quant, leader);        
        this.bronSize = Math.ceil(quant/2 - 1);
        if (br1){
            this.bronAdd(br1);        
        }
        if (br2){
            this.bronAdd(br2);                        
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
            const err = new Error('Пользователь уже записан в боевую группу!'); 
            this.client.emit(ActivityEvents.Error, this, err);
            throw err; 
        } 
        if (user.id == this.leader.id){ //проверка на присутствие в боевой группе
            const err = new Error('Нельзя забронировать место лидеру, что это вообще за чушь?'); 
            this.client.emit(ActivityEvents.Error, this, err);
            throw err;
        } 
        if (this.bron.has(user.id)){ //проверка на присутствие в списке брони
            const err = new Error('Пользователю уже забронировано место!'); 
            this.client.emit(ActivityEvents.Error, this, err);
            throw err;
        } 
        if (this.bron.size == this.bronSize){ //проверка на заполненность брони
            const err = new Error('Вы уже забронировали максимум! Для этой активности это ' + this.bronSize + ' места');
            this.client.emit(ActivityEvents.Error, this, err);
            throw err; 
        } 
        if (this.state == this.states[2]){ //проверка на количество стражей с учётом брони
            const err = new Error('Сбор уже укомплектован!');
            this.client.emit(ActivityEvents.Error, this, err);
            throw err;
        }
        if (user.bot){ //проверка на случай, если кто-то насильно догадается записать в сбор бота
            const err = new Error('Возмутительно! Я не думал, что кому-то придёт в голову совать в сбор бота, но и к этому я был готов');
            this.client.emit(ActivityEvents.Error, this, err);
            throw err;
        }   
        const embed = this.client.genEmbed(`Вам было забронировано место в ${this}.\nСсылка на сообщение: ${this.message.url}`, 'Уведомление');
        user.send({embeds: [embed]})
        .then(m => {
            this.bron.set(user.id, user);
            //this.checkQuantity();
            this.refreshMessage();
        })
        .catch(async err =>{
            console.log(`Ошибка бронирования пользователя ${user.tag}: ${err.message}`);
        });
        
    }

    //удаление из брони
    bronDel(id){
        if (!this.bron.has(id)){ //проверка на присутствие в боевой группе
            const err = new Error('Пользователю не было забронировано место!');
            this.client.emit(ActivityEvents.Error, this, err);
            throw err; 
        }
        this.bron.delete(id);
        //this.checkQuantity();
        this.refreshMessage();       
    }

    //перевод из брони в боевую группу
    bronToMember(user){
        if (!this.bron.has(user.id)){ //проверка на присутствие в боевой группе
            const err = new Error('Пользователю не было забронировано место!');
            this.client.emit(ActivityEvents.Error, this, err);
            throw err; 
        }
        this.bron.delete(user.id);
        this.members.set(user.id, user);
        this.refreshMessage(); 
    }

    changeLeader(user){
        if (this.bron.has(user.id)){
            this.bronToMember(user);
        }
        super.changeLeader(user);
    }
    
    checkQuantity(){
        if (this.state == this.states[0]){
            return;
        }
        if (this.members.size + this.bron.size == this.quantity){
            this.state = this.states[2];
        } else {
            this.state = this.states[1];
        }
    }

    getMembersString(){
        let str = '';
        this.members.forEach(function(value1, value2, mp){
            str += `${value1}\n`;
        });
        if (this.bron.size > 0){
            this.bron.forEach(function(value1, value2, mp){
                str += `#бронь (${value1})\n`;
            });
        }       
        return str;
    }
}