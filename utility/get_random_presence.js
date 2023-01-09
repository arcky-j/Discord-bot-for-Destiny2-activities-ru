//функция для выбора рандомного статуса вот и всё, что она делает
function getRandomPresence(){
    const count = 30;
    const rand = Math.floor(Math.random()*count);
    //изначально образ бота создан на основе финального босса Шпиля Хранителя, поэтому статусы соответствующие
    //их легко поменять: name - это содержание, а type - тип активности; 0 - "играет в", 2 - "слушает", 3 - "смотрит", 5 - "соревнуется в"
    //и в зависимости от их количества надо поменять константу count
    switch (rand){
        case 0: return {activities: [{name: 'как рождаются и умирают звёзды', type: 3}]};
        case 1: return {activities: [{name: 'прятки со Стражами', type: 0}]};
        case 2: return {activities: [{name: 'выговоры Свидетеля', type: 2}]};
        case 3: return {activities: [{name: 'за микроволновкой', type: 3}]};
        case 4: return {activities: [{name: 'как стражи не могут получить лук', type: 3}]};
        case 5: return {activities: [{name: 'огневой мощи с Атеоном', type: 5}]};
        case 6: return {activities: [{name: 'распитии пива из радиолярий', type: 5}]};
        case 7: return {activities: [{name: 'карты с олегами помладше', type: 0}]};
        case 8: return {activities: [{name: 'саундтрек из Сада Спасения', type: 2}]};
        case 9: return {activities: [{name: 'жалобы игроков', type: 2}]};
        case 10: return {activities: [{name: 'шёпот тьмы', type: 2}]};
        case 11: return {activities: [{name: 'повести Вольтера в пересказе Распутина', type: 2}]};
        case 12: return {activities: [{name: 'рассчёт вероятностей', type: 0}]};
        case 13: return {activities: [{name: 'в бесконечные просторы симуляций', type: 3}]};
        case 14: return {activities: [{name: 'остроумии с Осирисом', type: 5}]};
        case 15: return {activities: [{name: 'еврейские анекдоты Калуса', type: 2}]};
        case 16: return {activities: [{name: 'мудрые советы Священного Разума', type: 2}]};
        case 17: return {activities: [{name: 'потрескивание реактора', type: 2}]};
        case 18: return {activities: [{name: 'на неудачный соло фловлесс', type: 3}]};
        case 19: return {activities: [{name: 'создании самого несмешного статуса', type: 5}]};
        case 20: return {activities: [{name: 'разадачу респектов', type: 0}]};
        case 21: return {activities: [{name: 'расслыку weasel', type: 0}]};
        case 22: return {activities: [{name: 'пятнашки с взрывными гарпиями', type: 0}]};
        case 23: return {activities: [{name: 'тишину', type: 2}]};
        case 24: return {activities: [{name: 'кэширование бесконечного леса', type: 0}]};
        case 25: return {activities: [{name: 'выключение Bungie API', type: 0}]};
        case 26: return {activities: [{name: 'за порталом на Европе', type: 3}]};
        case 27: return {activities: [{name: 'за падением серверов Bungie', type: 3}]};
        case 28: return {activities: [{name: 'догони меня гьяллархорн', type: 0}]};
        case 29: return {activities: [{name: 'расстреле Стражей', type: 5}]};
        default: return {activities: [{name: 'советы по созданию статуса', type: 2}]};
    }
}

module.exports = getRandomPresence;