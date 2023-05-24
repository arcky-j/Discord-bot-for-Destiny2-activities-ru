const ActivityBron = require("./activityBron");
const ActivityEvents = require('../consts/activityEvents');

module.exports = class ActivityUntimed extends ActivityBron{
    constructor(id, clan, name, quant, leader, br1, br2){
        super(id, clan, name, quant, leader, br1, br2);
        this.timer = setTimeout(async () => {
            try{
                this.state = this.states[0];
                this.refreshMessage();
            } catch (err){
                console.log('Ошибка таймера: ' + err.message)
            }
        }, this.day * 3);
    }

    start(){
        this.state = this.states[0];
        clearTimeout(this.timer);
        this.sendAlerts('start');
        this.refreshMessage();
        this.client.emit(ActivityEvents.Started, this);
    }

    async delete(){
        clearTimeout(this.timer);
        super.delete();

    }
    
    async refreshMessage(){
        super.refreshMessage();
        if (this.state == this.states[2]){
            const embed = this.client.genEmbed(`Ваш сбор по готовности (${this}) заполнен!`, 'Уведомление');
            this.leader.send({embeds: [embed, this.message.embeds[0]]})
            .catch(err => {
                console.log(`Ошибка рассылки для пользователя ${this.leader.tag}: ${err.message}`);
            });
        }
    }

    async sendAlerts(reason){
        switch(reason){
            case 'start': //рассылка при скором начале активности
                if (!this.message){
                    break;
                }               
                if (this.bron.size > 0){
                    this.bron.forEach(async (us, id) => {
                        const embed = this.client.genEmbed(`Активность «${this}» начата лидером (${this.leader}) активности! Вы получаете уведомление, потому что вам забронировано место.`, 'Уведомление');
                        us.send({embeds:[embed, this.message.embeds[0]]})
                        .catch(err =>{
                            console.log(`Ошибка рассылки для пользователя ${us.tag}: ${err.message}`);
                        });
                    });
                }
            default: super.sendAlerts(reason);
        }
    }
}