const Base = require("./base");

class Guardian extends Base{

    constructor(member, actCount, leadCount){
        super();
        this.id = member.id;
        this.clanId = member.guild.id;
        this.member = member;
        if (actCount) this.activitiesCount = actCount; 
        else this.activitiesCount = 0;
        if (leadCount) this.leaderCount = leadCount;
        else this.leaderCount = 0;
        this.leadMultiplier = 4;
        this.actMultiplier = 2;
        this.score = this.calcScore();
    }

    calcScore(){
        return this.activitiesCount * this.actMultiplier + this.leaderCount * this.leadMultiplier;
    }

    actCountInc(){
        this.activitiesCount++;
        this.score = this.calcScore();
    }

    leadCountInc(){
        this.leaderCount++;
        this.score = this.calcScore();
    }

    actCountDec(){
        this.activitiesCount--;
        this.score = this.calcScore();
    }

    leadCountDec(){
        this.leaderCount--;
        this.score = this.calcScore();
    }
}

module.exports = Guardian;