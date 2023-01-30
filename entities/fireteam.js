//класс, содержащий в себе всё для работы со сборами
class FireTeam{
    id; 
    name; //название активности
    actType; //тип активности
    quantity; //необходимое количество Стражей
    members = new Map(); //словарь для хранения боевой группы
    reservs = new Map(); //словарь для хранения резерва
    date = new Date(); //дата начала активности
    embed;

    constructor(id, leader, name, nDate, typ, quan){
        this.id = id;
        this.name = name;
        this.members.set(leader.id, leader);
        this.members.leaderId = leader.id;
        this.date = nDate;
        this.actType = typ;
        switch (typ){
            case 'raid': this.quantity = 6;
                break;
            case 'dungeon': this.quantity = 3;
                break;
            default: if (quan !== undefined) this.quantity = quan;
                    else this.quantity = 6;
                break;
        }
    }
    //добавление Стража в боевую группу
    memberAdd(id, user){
        if (this.members.has(id)){ //проверка на присутствие в боевой группе
            throw new Error('Ты уже записан в боевую группу!'); 
        } 

        if (this.members.size == this.quantity){ //проверка на количество стражей
            throw new Error('Сбор уже укомплектован!');
        }
        if (user.bot){ //проверка на случай, если кто-то насильно догадается записать в сбор бота
            throw new Error('Возмутительно! Я не думал, что кому-то придёт в голову совать в сбор бота, но и к этому я был готов');
        }
        this.members.set(id, user); //добавление в боевую группу

        if (this.reservs.has(id)){ //удаление из резервов, если Страж там был
            this.reservs.delete(id);
        }
    }
    //удаление Стража из боевой группы
    memberDel(id){
        if (!this.members.has(id)){ //проверка на отсутствие в боевой группе
            throw new Error('Пользователь не был записан в эту боевую группу! Не в моих силах его из неё убрать'); 
        } 

        if (id == this.members.leaderId){ //проверка на лидерство
            throw new Error('Лидер не может покинуть боевую группу!');
        }

        this.members.delete(id); //удаление из боевой группы
    }
    //добавление Стража в резерв
    reservAdd(id, user){
        if (this.reservs.has(id)){ //проверка на запись в резерв
            throw new Error('Этот пользователь уже записан в резерв!'); 
        } 

        if (id == this.members.leaderId){ //проверка на лидерство
            throw new Error('Лидер не может записаться в резерв!'); 
        } 
        
        this.reservs.set(id, user); //запись в резерв

        if (this.members.has(id)){ //удаление из боевой группы, если нужно
            this.members.delete(id);
        }
    }
    //удаление Стража из резерва
    reservDel(id){
        if (!this.reservs.has(id)){ //проверка на отсутствие в резерве
            throw new Error('Ты в резерве не был! Увы, я не смогу тебя оттуда удалить'); 
        } 
        this.reservs.delete(id); //удаление из резерва
    }
    //смена лидера со всеми проверками
    changeLeader(id,newId, nUser){
        if (id != this.members.leaderId){ //первостепенная проверка на лидерство
            throw new Error('Только лидер может назначить другого лидера!');
        }

        if (newId == id){ //проверка на случай попытки сменить себя на себя
            throw new Error('Лидер пытается сменить себя на себя! чзх? я не буду это комментировать...');
        }

        if (nUser.bot){ //на всякий случай проверка, пытаются ли сделать лидером бота
            throw new Error('Возмутительно! Я не думал, что кому-то придёт назначать лидером бота, но и к этому я был готов');
        }

        if (this.members.has(newId)){ 
            this.members.leaderId = newId; //если новый лидер был в боевой группе, просто передаёт лидерство
        } else if(this.reservs.has(newId)) {
            this.reservs.delete(newId); //если новый лидер был в резерве, то сперва удаляет его из резервов
            if (this.members.size == this.quantity){
                this.memberDel(id); //если группа была заполнена, удаляет предыдущего лидера
            }       
            this.members.set(newId, nUser); //и только потом записывает нового лидера в боевую группу                 
            this.members.leaderId = newId;
        } else{
            this.members.leaderId = '';  //если нового лидера нет ни в боевой группе, ни в резерве              
            if (this.members.size == this.quantity){                    
                this.memberDel(id); //если группа была заполнена, удаляет предыдущего лидера
                this.members.set(newId, nUser); //и только потом записывает нового лидера в боевую группу 
                this.members.leaderId = newId;                
            } else {
                this.members.set(newId, nUser); //если места есть, просто добавляет нового Стража и делает его лидером
                this.members.leaderId = newId; 
            }
        }
    }
    //смена даты
    changeDate(id,newDate){
        if (id == this.members.leaderId){ //проверка на лидерство
            this.date = newDate; //установка даты
        } else {
            throw new Error('Только лидер может сменить дату/время сбора!');
        }        
    }
    setEmbed(embed){
        this.embed = embed;
    }
    //рассылка оповещений в личные сообщения
    sendAlerts(reason){
        switch(reason){
            case 'del': //рассылка при удалении активности
                this.members.forEach( async (us, id) =>{
                    if (this.members.leaderId != id) //рассылает оповещение всем участникам кроме лидера
                    us.send({content: `Активность ${this.name} на ${this.getDateString()}, в которую вы были записаны, была отменёна пользователем ${this.getLeader().tag}.`, embeds:[this.embed]});
                });
                break;
            case 'uptime': //рассылка при скором начале активности
                this.members.forEach( async (us, id) =>{ //оповещает всех участников
                    us.send({content: `${this.name} начнётся в ближайшие **10 минут**!\n`, embeds: [this.embed]});
                });
                if (this.reservs.size > 0 && this.members.size < this.quantity)
                this.reservs.forEach( async (us, id) =>{ //если есть резервы и боевой группы не хватает, оповещает резервистов
                    us.send({content:`${this.name} начнётся в ближайшие **10 минут**! Вы были записаны в резерв и получаете это сообщение, потому что боевая группа меньше необходимого!`, embeds: [this.embed]});
                });
                break;
            case 'dateChange': //рассылка при переносе активности
                this.members.forEach( async (us, id) =>{
                    if (this.members.leaderId != id) //рассылает оповещение всем участникам кроме лидера
                    us.send({content: `Активность ${this.name}, в которую вы записаны, перенесёна пользователем ${this.getLeader().tag}! Новое время: ${this.getDateString()}`, embeds: [this.embed]});
                });
                break;
            case 'admin_del': //рассылка при удалении активности администратором
                this.members.forEach( async (us, id) =>{
                    us.send({content: `Активность ${this.name} на ${this.getDateString()}, в которую вы были записаны, была отменёна администратором. Более подробная информация в канале сбора.`, embeds: [this.embed]});
                });
                break;
        }
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
    //вспомогательный метод для создания строки с участниками боевой группы
    getMembersString(){
        let str = '';
        this.members.forEach(function(value1, value2, mp){
            if (value2 == mp.leaderId){
                str += `<@${value1.id}> - *Лидер* \n`;
            } else {
                str += `<@${value1.id}>\n`;
            }
        });
        return str; //возвращает строку со всеми участниками боевой группы в столбик
    }
    //вспомогательный метод для создания строки с резервистами
    getReservsString(){
        let str = '';
        if (this.reservs.size == 0){
            return 'Резерв пуст';
        }
        this.reservs.forEach(function(value1, value2){
            str += `<@${value1.id}>\n`;
        });
        return str; //возвращает строку со всеми резервистами в столбик
    }
    //вспомогательный метод для нахождения лидера боевой группы
    getLeader(){
        let lead;
        this.members.forEach(function(value1, value2, mp){
            if (value2 == mp.leaderId){
                lead = value1;
            }
        });
        return lead;
    }
    //вспомогательный метод для нахождения id (иногда его достаточно) лидера боевой группы
    getLeaderId(){
        let leadId;
        this.members.forEach(function(value1, value2, mp){
            if (value2 == mp.leaderId){
                leadId = value2;
            }
        });
        return leadId;
    }
    //вспомогательный метод для проверки пользователя на лидерство
    isLeader(id){
        if (id == this.members.leaderId){
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

module.exports = FireTeam;