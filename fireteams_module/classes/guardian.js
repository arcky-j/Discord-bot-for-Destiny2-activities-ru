const Base = require("./base");

class Guardian extends Base{

    constructor(member, clan){
        super();
        this.id = member.id;
        this.clan = clan;
        this.member = member;
    }

    toString(){
        return this.member.toString();
    }
}

module.exports = Guardian;