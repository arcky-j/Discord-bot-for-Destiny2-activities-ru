const ActivityBron = require("./activityBron");

module.exports = class ActivityUntimed extends ActivityBron{
    constructor(id, mess, name, quant, leader, br1, br2){
        super(id, mess, name, quant, leader, br1, br2);
        this.timer = setTimeout(() => {
            this.state = this.states.get(0);
            this.refreshMessage();
        }, this.day * 7);
    }

    start(){
        this.state = this.states.get(0);
        clearTimeout(this.timer);
        this.sendAlerts('start');
        this.refreshMessage();
    }

    sendAlerts(reason){
        switch(reason){
            case 'start': //рассылка при скором начале активности               
                this.members.forEach(async (us, id) =>{ //если есть резервы и боевой группы не хватает, оповещает резервистов
                    if (id != this.leaderId)
                    try{
                        us.send({content:`${this.name} начат лидером активности!`, embeds: this.message.embeds});                      
                    } catch (err){
                        console.log(`Ошибка рассылки для пользователя ${us.tag}: ${err.message}`)
                    }
                });
                if (this.bron.size > 0){
                    this.bron.forEach(async (us, id) => {
                        try{
                            us.send({content:`${this.name} начат лидером активности! Вы получаете это сообщение, так как вам было забронировано место.`, embeds: this.message.embeds});
                        } catch (err){
                            console.log(`Ошибка рассылки для пользователя ${us.tag}: ${err.message}`)
                        }
                    });
                }
            default: super.sendAlerts(reason);
        }
    }
}