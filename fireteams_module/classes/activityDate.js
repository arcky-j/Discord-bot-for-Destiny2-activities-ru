const ActivityBron = require("./activityBron");

module.exports = class ActivityDate extends ActivityBron{
    date = new Date();
    today;
    timer;
    interval;
    tenMinutes = 600000;

    constructor(id, guildId, name, quant, leader, date, br1, br2){
        super(id, guildId, name, quant, leader, br1, br2);
        this.today = new Date();
        this.date = date;
        this.setTimer();
    }

    //смена даты
    changeDate(newDate){
        this.date = newDate; //установка даты    
        clearTimeout(this.timer);
        this.setTimer();
        this.sendAlerts('dateChange'); 
        this.refreshMessage();
    }
    async setTimer(){
        if (this.today > this.date){
            this.state = this.states[0];
            return;
        }        
        const t = this.date - this.today - this.tenMinutes; 
        if (this.t > 2147483647){
            this.interval = setInterval(async () => {
                if (this.t < 2147483647){
                    clearInterval(this.interval);
                    this.setTimer();
                }
            }, this.day * 20);
            return;
        } 
        this.timer = setTimeout(() => {
            if (this.date - this.today > this.tenMinutes)
            this.sendAlerts('uptime');
            setTimeout(async () => {
                try{
                    this.state = this.states[0];
                    this.refreshMessage();
                } catch (err){
                    console.log('Ошибка таймера: ' + err.message)
                }
            }, this.tenMinutes);
        }, t);          
    }
    //вспомогательный метод для создания строки с датой-временем
    getDateString(){
        //получает отдельные части даты
        const h = this.date.getHours();
        const m = this.date.getMinutes();

        const day = this.date.getDate();
        const mon = this.date.getMonth() + 1;
        const year = this.date.getFullYear();
        //если число однозначное, добавляет 0 в начале
        let hT = h, mT = m, dayT = day, monT = mon;
        if (h<10) hT = `0${h}`;
        if (m<10) mT = `0${m}`;
        if (day<10) dayT = `0${day}`;
        if (mon<10) monT = `0${mon}`;

        return `**${hT}:${mT}** МСК **${dayT}.${monT}.${year}**`; //возвращает строку со временем в предпочитаемом формате
    }
    async sendAlerts(reason){
        switch(reason){
            case 'uptime': //рассылка при скором начале активности
                if (!this.message){
                    break;
                }
                this.members.forEach( async (us, id) =>{ //оповещает всех участников
                    const embed = ActivityDate.client.genEmbed(`Активность «${this}» начнётся в ближайшие **10 минут**!`, 'Уведомление');
                    us.send({embeds:[embed, this.message.embeds[0]]})
                    .catch(err =>{
                        console.log(`Ошибка рассылки для пользователя ${us.tag}: ${err.message}`);
                        if (this.guildId){
                            const sett = ActivityDate.client.settings.get(this.guildId);
                            sett.sendLog(`Ошибка рассылки (скорое начало сбора ${this}) для пользователя ${us}: ${err.message}`, 'Запись логов: ошибка');
                        }
                    });
                });
                if (this.bron.size > 0 && this.members.size < this.quantity)
                this.bron.forEach( async (us, id) =>{ //если есть резервы и боевой группы не хватает, оповещает резервистов
                    const embed = ActivityDate.client.genEmbed(`Активность «${this}» начнётся в ближайшие **10 минут**! Вам было забронировано место, поэтому вы получаете это сообщение!`, 'Уведомление');
                    us.send({embeds:[embed, this.message.embeds[0]]})
                    .catch(err =>{
                        console.log(`Ошибка рассылки для пользователя ${us.tag}: ${err.message}`);
                        if (this.guildId){
                            const sett = ActivityDate.client.settings.get(this.guildId);
                            sett.sendLog(`Ошибка рассылки (скорое начало сбора ${this}) для пользователя ${us}: ${err.message}`, 'Запись логов: ошибка');
                        }
                    });
                });
                break;
            case 'dateChange': //рассылка при переносе активности
                if (!this.message){
                    break;
                }
                this.members.forEach( async (us, id) =>{
                    if (this.leader.id != id) {//рассылает оповещение всем участникам кроме лидера
                        const embed = ActivityDate.client.genEmbed(`Активность «${this}» перенесёна пользователем ${this.leader}! Новое время: ${this.getDateString()}`, 'Уведомление');
                        us.send({embeds:[embed, this.message.embeds[0]]})
                        .catch(err =>{
                            console.log(`Ошибка рассылки для пользователя ${us.tag}: ${err.message}`);
                            if (this.guildId){
                                const sett = ActivityDate.client.settings.get(this.guildId);
                                sett.sendLog(`Ошибка рассылки (смена даты сбора ${this}) для пользователя ${us}: ${err.message}`, 'Запись логов: ошибка');
                            }
                        });
                    }                 
                });
                break;
            default: super.sendAlerts(reason);
        }
    }
    async delete(){
        clearInterval(this.interval);
        clearTimeout(this.timer);
        super.delete();
    }
    async refreshMessage(){
        this.refreshDate();
        super.refreshMessage();
    }
    updateMessage(){
        this.refreshDate();
        return super.updateMessage();
    }
    refreshDate(){
        const embed = this.message.embeds[0];
        embed.fields[0].value = this.getDateString();
    }
}