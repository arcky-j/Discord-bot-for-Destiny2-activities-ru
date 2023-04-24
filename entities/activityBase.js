const Base = require("./base");

module.exports = class ActivityBase extends Base{
    id;
    message;
    name;
    quantity;
    leaderId;
    members = new Map();
    state;
    states = new Map([[0, 'Закрыт'], [1, 'Открыт'], [2, 'Заполнен']]);
    delTimer;
    day = 86400000;

    //static client;

    constructor(id, mess, name, quant, leader){
        super();
        this.id = id;
        this.message = mess;
        this.name = name;
        this.quantity = quant;
        this.leaderId = leader.id;
        //this.members.set(leader.id, leader);
        this.state = this.states.get(1);
    }

    add(user){
        if (this.members.has(user.id)){ //проверка на присутствие в боевой группе
            throw new Error('Пользователь уже записан!'); 
        } 
        if (this.state == 'Заполнен'){ //проверка на количество стражей
            throw new Error('Сбор уже укомплектован!');
        }
        if (user.bot){ //проверка на случай, если кто-то насильно догадается записать в сбор бота
            throw new Error('Возмутительно! Я не думал, что кому-то придёт в голову совать в сбор бота, но и к этому я был готов');
        }
        this.members.set(user.id, user);
        this.checkQuantity();
        this.refreshMessage();
    }

    remove(id){
        if (!this.members.has(id)){ //проверка на отсутствие в боевой группе
            throw new Error('Пользователь не был записан в эту боевую группу! Не в моих силах его из неё убрать'); 
        } 
        
        this.members.delete(id); //удаление из боевой группы
        this.checkQuantity();
        this.refreshMessage();
    }

    changeLeader(user){
        if (user.id == this.leaderId){ //проверка на случай попытки сменить себя на себя
            throw new Error('Лидер пытается сменить себя на себя! чзх? я не буду это комментировать...');
        }

        if (user.bot){ //на всякий случай проверка, пытаются ли сделать лидером бота
            throw new Error('Возмутительно! Я не думал, что кому-то придёт назначать лидером бота, но и к этому я был готов');
        }
       
        this.leaderId = user.id; 
        
        this.refreshMessage();
    }
    checkQuantity(){
        if (this.state == 'Закрыт'){
            return;
        }
        if (this.members.size == this.quantity){
            this.state = this.states.get(2);
        } else {
            this.state = this.states.get(1);
        }
    }
    //рассылка оповещений в личные сообщения
    sendAlerts(reason){
        switch(reason){
            case 'del': //рассылка при удалении активности
                if (!this.message){
                    break;
                }
                this.members.forEach( async (us, id) =>{
                    if (this.leaderId != id) //рассылает оповещение всем участникам кроме лидера
                    us.send({content: `Активность «${this.name}», в которую вы были записаны, была отменёна пользователем ${this.getLeader().tag}.`, embeds:this.message.embeds})
                    .catch(err => console.log(`Ошибка рассылки для пользователя ${us.tag}: ${err.message}`));
                });
                break;
            case 'admin_del': //рассылка при удалении активности администратором
                if (!this.message){
                    break;
                }
                this.members.forEach( async (us, id) =>{
                    us.send({content: `Активность «${this.name}», в которую вы были записаны, была отменёна администратором. Более подробная информация в канале сбора.`, embeds: this.message.embeds})
                    .catch(err => console.log(`Ошибка рассылки для пользователя ${us.tag}: ${err.message}`));
                });
                break;
            case 'start': //рассылка при скором начале активности
                if (!this.message){
                    break;
                }               
                this.members.forEach(async (us, id) =>{ //если есть резервы и боевой группы не хватает, оповещает резервистов
                    if (id != this.leaderId)
                    us.send({content:`Активность «${this.name}» начата лидером активности!`, embeds: this.message.embeds})
                    .catch(err => console.log(`Ошибка рассылки для пользователя ${us.tag}: ${err.message}`));                      
                });
        }
    }
    refreshMessage(){
        if (!this.message){
            return;
        }
        const embed = this.message.embeds[0];
        embed.fields[1].value = this.state;
        if (this.state == 'Закрыт'){
            this.delTimer = setTimeout(() => {
                if (this.message){
                    this.message.delete().catch(`Ошибка удаления сбора ${this.id}`);                  
                }
            }, this.day);
            if (this.message){
                this.message.edit({content: '', embeds: [embed], components: []}).catch(() => console.log(`Ошибка закрытия сбора ${this.id}`));
            }
            return;
        }
        embed.fields[2].value = `<@${this.leaderId}>`;
        embed.fields[3].value = this.getMembersString();
        this.message.edit({embeds: [embed]}).catch(() => console.log(`Ошибка изменения сбора ${this.id}`));
        
    }
    updateMessage(){
        const embed = this.message.embeds[0];
        embed.fields[1].value = this.state;
        embed.fields[2].value = `<@${this.leaderId}>`;
        embed.fields[3].value = this.getMembersString();
        return embed;
    }
    delete(){
        clearTimeout(this.delTimer);
        this.message = undefined;
    }
    //вспомогательный метод для создания строки с участниками боевой группы
    getMembersString(){
        let str = '';
        this.members.forEach(function(value1, value2, mp){
            str += `<@${value2}>\n`;
        });
        return str; //возвращает строку со всеми участниками боевой группы в столбик
    }
    start(){
        this.state = this.states.get(0);
        this.sendAlerts('start');
        this.refreshMessage();
    }
    //несколько устаревшие, но не самые деструктивные методы, которые где-то ещё есть
    //вспомогательный метод для нахождения лидера боевой группы
    getLeader(){
        const lead = this.members.get(this.leaderId);
        return lead;
    }
    //вспомогательный метод для проверки пользователя на лидерство
    isLeader(id){
        if (id == this.leaderId){
            return true;
        } else {
            return false;
        }
    }
    //вспомогательный метод для проверки пользователя на присутствие в боевой группе
    hasMember(id){
        return this.members.has(id);
    }
}