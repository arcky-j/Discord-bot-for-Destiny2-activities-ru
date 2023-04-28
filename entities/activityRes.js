const ActivityDate = require("./activityDate");

module.exports = class ActivityRes extends ActivityDate{
    reservs = new Map();

    constructor(id, mess, name, quant, leader, date, br1, br2){
        super(id, mess, name, quant, leader, date, br1, br2);
    }

    add(user){      
        super.add(user);
        if (this.reservs.has(user.id)){
            this.reservs.delete(user.id);
            this.refreshMessage();
        }      
    }

    moveReserv(user){
        if (this.reservs.has(user.id)){ //проверка на запись в резерв
            this.reservs.delete(user.id);
        } else {
            if (user.id == this.leader.id){ //проверка на лидерство
                throw new Error('Лидер не может записаться в резерв!'); 
            }
            
            this.reservs.set(user.id, user); //запись в резерв

            if (this.members.has(user.id)){ //удаление из боевой группы, если нужно
                this.members.delete(user.id);
            }
        }
        //await this.refreshMessage();
    }

    moveReservUpdate(user){
        this.moveReserv(user);
        return this.updateMessage();
    }

    moveReservRefresh(user){
        this.moveReserv(user);
        this.refreshMessage();
    }

    async refreshMessage(){
        this.refreshReservs();
        super.refreshMessage();
    }
    updateMessage(){
        this.refreshReservs();
        return super.updateMessage();
    }
    refreshReservs(){
        const embed = this.message.embeds[0];
        embed.fields[4].value = this.getReservsString();
    }
    async sendAlerts(reason){
        switch(reason){
            case 'uptime': //рассылка при скором начале активности
                if (!this.message){
                    break;
                }
                if (this.reservs.size > 0 && this.members.size < this.quantity)
                this.reservs.forEach( async (us, id) =>{ //если есть резервы и боевой группы не хватает, оповещает резервистов
                    const embed = ActivityRes.client.genEmbed(`Активность «${this}» начнётся в ближайшие **10 минут**! Вы были записаны в резерв и получаете это сообщение, потому что боевая группа меньше необходимого!`, 'Уведомление');
                    us.send({embeds:[embed, this.message.embeds[0]]})
                    .catch(err =>{
                        console.log(`Ошибка рассылки для пользователя ${us.tag}: ${err.message}`);
                        if (this.guildId){
                            const sett = ActivityRes.client.settings.get(this.guildId);
                            sett.sendLog(`Ошибка рассылки (скорое начало сбора ${this}) для пользователя ${us}: ${err.message}`, 'Запись логов: ошибка');
                        }
                    });
                });
                //super.sendAlerts(reason);
            default: super.sendAlerts(reason);
        }
    }
    getReservsString(){
        let str = '';
        if (this.reservs.size == 0){
            return '...';
        }
        this.reservs.forEach(function(value1, value2){
            str += `${value1}\n`;
        });
        return str; //возвращает строку со всеми резервистами в столбик
    }
}