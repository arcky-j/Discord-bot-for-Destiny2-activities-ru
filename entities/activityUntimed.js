const ActivityBron = require("./activityBron");

module.exports = class ActivityUntimed extends ActivityBron{
    constructor(id, mess, name, quant, leader, br1, br2){
        super(id, mess, name, quant, leader, br1, br2);
        this.timer = setTimeout(() => {
            try{
                this.state = this.states.get(0);
                this.refreshMessage();
            } catch (err){
                console.log('Ошибка таймера: ' + err.message)
            }
        }, this.day * 3);
    }

    start(){
        this.state = this.states.get(0);
        clearTimeout(this.timer);
        this.sendAlerts('start');
        this.refreshMessage();
    }
    delete(){
        clearTimeout(this.timer);
        super.delete();

    }
    refreshMessage(){
        super.refreshMessage();
        if (this.state == 'Заполнен'){
            try{
                this.leader.send({content:`Ваш сбор по готовности заполнен!`, embeds: this.message.embeds});
            } catch(err){
                console.log(`Ошибка рассылки для пользователя ${this.leader.tag}: ${err.message}`);
            }
        }
    }
    sendAlerts(reason){
        switch(reason){
            case 'start': //рассылка при скором начале активности
                if (!this.message){
                    break;
                }               
                if (this.bron.size > 0){
                    this.bron.forEach(async (us, id) => {
                        us.send({content:`Активность «${this.name}» начата лидером активности! Вы получаете это сообщение, так как вам было забронировано место.`, embeds: this.message.embeds})
                        .catch(err => console.log(`Ошибка рассылки для пользователя ${us.tag}: ${err.message}`));
                    });
                }
            default: super.sendAlerts(reason);
        }
    }
}