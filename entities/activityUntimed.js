const ActivityBron = require("./activityBron");

module.exports = class ActivityUntimed extends ActivityBron{
    constructor(id, guildId, name, quant, leader, br1, br2){
        super(id, guildId, name, quant, leader, br1, br2);
        this.timer = setTimeout(async () => {
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
    async delete(){
        clearTimeout(this.timer);
        super.delete();

    }
    async refreshMessage(){
        super.refreshMessage();
        if (this.state == 'Заполнен'){
            const embed = ActivityUntimed.client.genEmbed(`Ваш сбор по готовности (${this}) заполнен!`, 'Уведомление');
            this.leader.send({embeds: [embed, this.message.embeds[0]]})
            .catch(err => {
                console.log(`Ошибка рассылки для пользователя ${this.leader.tag}: ${err.message}`);
                if (this.guildId){
                    const sett = ActivityUntimed.client.settings.get(this.guildId);
                    sett.sendLog(`Ошибка оповещения (заполнение сбора ${this}) для пользователя ${this.leader}: ${err.message}`, 'Запись логов: ошибка');
                }
            });
        }
    }

    updateMessage(){
        const embed = super.updateMessage();
        if (this.state == 'Заполнен'){
            const embed = ActivityUntimed.client.genEmbed(`Ваш сбор по готовности (${this}) заполнен!`, 'Уведомление');
            this.leader.send({embeds: [embed, this.message.embeds[0]]})
            .catch(err => {
                console.log(`Ошибка рассылки для пользователя ${this.leader.tag}: ${err.message}`);
                if (this.guildId){
                    const sett = ActivityUntimed.client.settings.get(this.guildId);
                    sett.sendLog(`Ошибка оповещения (заполнение сбора ${this}) для пользователя ${this.leader}: ${err.message}`, 'Запись логов: ошибка');
                }
            });
        }
        return embed;
    }

    async sendAlerts(reason){
        switch(reason){
            case 'start': //рассылка при скором начале активности
                if (!this.message){
                    break;
                }               
                if (this.bron.size > 0){
                    this.bron.forEach(async (us, id) => {
                        const embed = ActivityUntimed.client.genEmbed(`Активность «${this}» начата лидером (${this.leader}) активности! Вы получаете уведомление, потому что вам забронировано место.`, 'Уведомление');
                        us.send({embeds:[embed, this.message.embeds[0]]})
                        .catch(err =>{
                            console.log(`Ошибка рассылки для пользователя ${us.tag}: ${err.message}`);
                            if (this.guildId){
                                const sett = ActivityUntimed.client.settings.get(this.guildId);
                                sett.sendLog(`Ошибка рассылки (старт сбора ${this}) для пользователя ${us.tag}: ${err.message}`, 'Запись логов: ошибка');
                            }
                        });
                    });
                }
            default: super.sendAlerts(reason);
        }
    }
}