//просто функция для получения псевдо-рандомного цвета в rgb
function getRandomColor(){
    const rand = Math.floor(Math.random()*20);
    switch(rand){
        case 0: return 0xed7777; //алый
        case 1: return 0xd1271b; //красный
        case 2: return 0xe8ae6f; //песчаный
        case 3: return 0xf5850c; //охра
        case 4: return 0xede47e; //лимонный
        case 5: return 0xdbd002; //жёлтый
        case 6: return 0xbee86f; //лаймовый
        case 7: return 0x1fde29; //зелёный
        case 8: return 0x5fe39f; //бирюзовый
        case 9: return 0x6edbd9; //голубой
        case 10: return 0x09aba8; //тёмно-голубой
        case 11: return 0x6685e3; //светло-синий
        case 12: return 0x0e3ac2; //синий
        case 13: return 0x9e68d4; //пурпурный
        case 14: return 0x5a2391; //тёмно-фиолетовый
        case 15: return 0x7a07ed; //фиолетовый
        case 16: return 0xa864b3; //розовый
        case 17: return 0xffffff; //белый
        case 18: return 0x000000; //чёрный
        default: return 0x777f80; //серый
    }
}

module.exports = getRandomColor;