module.exports = class Base{
    static client;

    constructor(){
        this.client = Base.client;
    }
}