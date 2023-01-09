//класс, содержащий данные ресета
const {EmbedBuilder} = require('discord.js');
//попытка в полуавтоматизацию ресетов; полная без подключение bungie API нереальна
class Reset{
    info; //доп информация к ресету
    nightfall; //сумрак в ресете
    bonusRep; //бонусная репутация в ресете
    raid; //рейд в ротации
    dungeon; //подземелье в ротации
    isReady; //готов ли ресет к отправке?

    xur; //информация о зуре
    trials; //информация о испытаниях осириса
    isReadyFri; //готов ли пятничный ресет к отправке?

    channel; //канал, куда выкладывается ресет
    updater0; //первый пользователь, обновляющий ресет
    updater1; //второй пользователь, обновляющий ресет
    isAlerted; //оповещены ли ответственные за ресет?
    constructor(){

    }
    //метод для записи информации для ресета
    upload(inf, nf, bonus, raid, dung){
        this.info = inf;
        this.nightfall = nf;
        this.bonusRep = bonus;
        this.raid = raid;
        this.dungeon = dung;
        this.isReady = true;
    }
    //метод для записи информации о прилёте зура  (и не только)
    uploadFri(xur, trials){
        this.xur = xur;
        this.trials = trials;
        this.isReadyFri = true;
    }
    //метод для установки чата ресета
    setChannel(channel){
        this.channel = channel;
    }
    //метод для установки обновителей ресета
    setUpdaters(upd0, upd1){
        this.updater0 = upd0;
        this.updater1 = upd1;
    }
    //метод для отправки ресета
    send(){
        this.isAlerted = false; //включает оповещения
        if (!this.channel){ //проверяет, есть ли канал для отправки ресета
            return;
        }
        if (!this.isReady){ //проверяет, готов ли ресет
            return;
        }
        const today = new Date(); //получает и оформляет сегодняшнюю дату
        let day = today.getDate();
        let month = today.getMonth() + 1;
        if (day < 10){
            day = `0${day}`;
        }
        if (month < 10){
            month = `0${month}`;
        }
        const color = this.setRandomColor();
        const embed = new EmbedBuilder() //формирует embed
            .setTitle(`Ресет ${day}.${month}!`)
            .setDescription(this.info)
            .addFields(
                {name: 'Сумрачный налёт', value: this.nightfall},
                {name: 'Бонусная репутация', value: this.bonusRep},
                {name: 'Рейд в ротации', value: this.raid},
                {name: 'Подземелье в ротации', value: this.dungeon}
            )
            .setThumbnail('https://i.ibb.co/pdRdLHT/image.png')
            .setColor(color)
            .setFooter({text: 'Всем респект!'});

        this.channel.send({embeds: [embed]}); //отправляет сообщение с ресетом и сбрасывает все значения
        this.isReady = false;
        this.info = undefined;
        this.nightfall = undefined;
        this.bonusRep = undefined;
        this.raid = undefined;
        this.dungeon = undefined;
    }
    //метод для отправки пятничного ресета
    sendFri(){ //всё работает по аналогии с обычным ресетом, просто в embed записываются другие значения
        this.isAlerted = false;
        if (!this.channel){
            return;
        }
        if (!this.isReadyFri){
            return;
        }
        const today = new Date();
        let day = today.getDate();
        let month = today.getMonth() + 1;
        if (day < 10){
            day = `0${day}`;
        }
        if (month < 10){
            month = `0${month}`;
        }
        const color = this.setRandomColor();
        const embed = new EmbedBuilder()
            .setTitle(`Пятничный ресет ${day}.${month}!`)
            .addFields(
                {name: 'Зур', value: this.xur},
                {name: 'Испытания Осириса', value: this.trials}
            )
            .setThumbnail('https://i.ibb.co/pdRdLHT/image.png')
            .setColor(color)
            .setFooter({text: 'Всем респект!'});

        this.channel.send({embeds: [embed]});
        this.isReadyFri = false;
        this.xur = undefined;
        this.trials = undefined;
    }
    //вспомогательный метод для случайного цвета
    setRandomColor(){
        const rand = Math.floor(Math.random()*5);
        switch(rand){
            case 0: return 0x83d479;
            case 1: return 0x58dbd3;
            case 2: return 0xb539d4;
            case 3: return 0xc95353;
            case 4: return 0xe8e464;
            default: return 0x777f80;
        }
    }
    //метод для оповещения о ресете
    alertUpdaters(){
        if (!this.channel){ //проверка, есть ли куда отправлять ресет
            return;
        }
        if (this.isReady){ //проверка, готов ли ресет, если да, то не уведомляет уже
            return;
        }
        if (this.isAlerted){ //проверка, были ли уже уведомлены ответственные
            return;
        }
        if (this.updater0){
            this.updater0.send({content: 'До ресета осталось 10 минут. Воспользуйтесь командой /upload_reset для отправки оповещения'});
        }
        if (this.updater1){
            this.updater1.send({content: 'До ресета осталось 10 минут. Воспользуйтесь командой /upload_reset для отправки оповещения'});
        }
        this.isAlerted = true;
    }
    //метод для оповещения о пятничном ресете
    alertFriUpdaters(){ //работает по аналогии с предыдущим методом
        if (!this.channel){
            return;
        }
        if (this.isReadyFri){
            return;
        }
        if (this.isAlerted){
            return;
        }
        if (this.updater0){
            this.updater0.send({content: 'До прилёта Зура осталось 10 минут. Воспользуйтесь командой /upload_fri_reset для отправки оповещения'});
        }
        if (this.updater1){
            this.updater1.send({content: 'До прилёта Зура осталось 10 минут. Воспользуйтесь командой /upload_fri_reset для отправки оповещения'});
        }
        this.isAlerted = true;
    }
}

module.exports = Reset;