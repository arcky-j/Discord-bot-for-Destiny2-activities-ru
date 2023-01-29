//класс для работы со временем
const getRandomPresence = require('./get_random_presence.js');

class CustomTimer{
     
    fireteamsStarted = new Map(); //уже начатые сборы
    actMessages = new Map(); //сообщения со сборами, чтобы их проще отслеживать и удалять
    logMessages = new Map(); //сообщения с логами, чтобы их проще отслеживать и удалять
    client;

    constructor(cl){
        this.client = cl;
        this.day = 86400000;
    }
    //метод для калибровки минутного таймера
    //существует только для красоты, можно обойтись лишь одним минутным таймером
    //но в таком виде все проверки происходят в первые 10 секунд минуты
    //и в теории, такая система предотвращает накопление погрешности, но на практике разницы или нет, или она пренебрежительно мала
    //как показали тесты, память от этого не нагружается, поэтому решение пусть и лишнее, но не деструктивное

    checkSeconds(){
        let date;
        const interval = setInterval(() =>{
            date = new Date();
            if (date.getSeconds()==0){ 
                this.checkMinutes(); //ровно в 00 секунд запускает минутный таймер
                clearInterval(interval); //и удаляется
            }
        }, 1000);
    }
    //основной таймер

    checkMinutes(){
        let date;
        console.log('Минутный таймер запущен');    
        const interval = setInterval(() =>{
            date = new Date();
            this.checkEvents(date); //все проверки в отдельном методе
            if (date.getSeconds() > 10){ //если задержки накопилось на 10 секунд, отправляется на калибровку
                console.log(`Запуск калибровки минутного таймера`);
                this.checkSeconds();
                clearInterval(interval);
            }
        }, 60000);
    }
    //метод, осуществляющий проверки

    checkEvents(today){
        //раз в час он проверяет надо ли ему почистить сообщения логов и сборов и, если прошло больше суток с создания сообщений, он их чистит
        if (today.getMinutes() == 0){
            if (this.fireteamsStarted.size > 0)
            {
                this.fireteamsStarted.forEach((val, id, mp) => {
                    if (val.date - today < -this.day){
                        try {
                            this.actMessages.get(id).delete();
                            this.actMessages.delete(id);
                            mp.delete(id);
                        } catch (err) {
                            console.log(`Неизвестная ошибка удаления старого сбора: ${err.message}`);
                        }                       
                    }
                });
            }

            if (this.logMessages.size > 0){
                this.logMessages.forEach((val, id, mp) =>{
                    try {
                        if (val.createdAt - today < -this.day)
                        this.logMessages.get(id).delete();
                        mp.delete(id);
                    } catch (err){
                        console.log(`Неизвестная ошибка удаления старых логов: ${err.message}`);
                    }                  
                });
            }
            //меняет боту статус
            this.client.user.setPresence(getRandomPresence());
            //раз в сутки сохраняет кэш пользователей и выкладывает в консоль использование памяти (просто из исследовательского интереса)
            if (today.getHours() == 0){
                this.client.cacheManager.saveCache();  
                const used = process.memoryUsage();
                console.log('Использование памяти:');
                for (let key in used) {
                    console.log(`${key} ${Math.round(used[key] / 1024 / 1024 * 100) / 100} MB`);
                }
            }
        }     

        //за 10 минут до начала активности присылает участникам личные уведомления
        if (this.client.fireteams.size > 0){
            this.client.fireteams.forEach((val, id, mp) => {
                if (val.date - today < 600000){
                    if (!val.isAlerted){
                        this.fireteamsStarted.set(id, val);
                        val.sendAlerts('uptime');
                        val.isAlerted = true;
                    }
                    if (val.date - today < 0){
                        mp.delete(id);
                    }
                }
            });
        } 
        //рассылка уведомлений о ресете за 10 минут до него
        if (today.getMinutes() > 49 && today.getHours() == 19 && today.getDay() == 2){
            this.client.reset.alertUpdaters();
        }
        //оправка ресета, если он готов
        if (today.getHours() == 20 && today.getDay() == 2){
            this.client.reset.send();
        }
        //рассылка уведомлений о пятничном ресете за 10 минут до него
        if (today.getMinutes() > 49 && today.getHours() == 19 && today.getDay() == 5){
            this.client.reset.alertFriUpdaters();
        }
        //оправка пятничного ресета, если он готов
        if (today.getHours() == 20 && today.getDay() == 5){
            this.client.reset.sendFri();
        }
    }
}

module.exports = CustomTimer;