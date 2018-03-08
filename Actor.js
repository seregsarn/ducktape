function Actor(type) {
    this.id = Identifier.get();
    // pick what kind of dude we are.
    if (type !== undefined) {
        if (typeof type == 'string') type = monsters[type];
        this.type = type;
    } else {
        this.type = monsters.random();
    }
    this.stats = Object.assign({}, this.type.stats);
    this.hp = this.stats.maxhp;
    this.dead = false;
    this.name = '';
    this.speed = 12;
    this.x = 0; this.y = 0;
    this.map = null;
    this.visible = false;
}
Actor.prototype.getSpeed = function() { return this.speed; };
Actor.prototype.act = function() {
    if (this.type && this.type.brain) {
        return this.type.brain.apply(this);
    }
    // no brain, just sit here and do nothing
    return true;
};
// draw functions
Actor.prototype.render = function(display,x,y) {
    display.draw(x,y, this.type.glyph, this.type.color, this.type.background);
};
// text formatting
Actor.prototype.a = function() {
    var w, c;
    if (this.name !== '') return this.name;
    w = (this.type ? this.type.name : 'unknown actor');
    c = w.charAt(0).toLowerCase();
    if ("aeiou".indexOf(c)) return "an " + w;
    return "a " + w;
};
Actor.prototype.the = function() {
    var w;
    if (this.name !== '') return this.name;
    w = (this.type ? this.type.name : 'unknown actor');
    return "the " + w;// + "("+this.id + ")";
};
Actor.prototype.your = function() {
    return this.the() + "'s";
};
Actor.prototype.verb = function(word) {
    // third person
    if (word.charAt(word.length - 1) == 's')
        return word + "es";
    return word + "s";
};

// actions the actor can take
Actor.prototype.move = function(dx,dy) {
    var tx = this.x + dx;
    var ty = this.y + dy;
    if (tx < 0 || tx > this.map.w-1 || ty < 0 || ty > this.map.h-1) {
        return false;
    }
    var target = this.map.at(tx,ty);
    if (!target) return false; // can't walk through the nothing whee
    if (target.solid) {
        if (target.name == 'DOOR' && this.type && this.type.has_flag('open_doors')) {
            this.map.write(tx,ty,'OPENDOOR');
            this.map.updateTile(Game.screen, tx, ty);
            this.map.updateFov(Game.player);
            ActorMessage(this,
                "%The %{verb,open} the door.".format(this,this));
            // TODO: if you can't see the actor, but _can_ see the door, print a more cryptic message instead.
            //LocationMessage(tx, ty, "The door opens.");
            return true;
        }
        return false;
    }
    var slope = cave_slope_check(this.map.at(this.x, this.y), target);
    if (slope > 0.5) {
        if (this == Game.player) {
            Message.log("You can't climb that slope.");
        }
        return false;
    } else if (slope < -0.5) {
        if (this == Game.player) {
            Message.log("You can't descend that slope.");
        }
        return false;
    }
    var other = this.map.mobAt(tx, ty);
    if (other !== undefined) {
        return this.melee(other);
    }
    // TODO visibility check before/after moving so we're not wasting stuff that's going to be redrawn later anyway
    this.map.updateTile(Game.screen, this.x, this.y);
    this.x = tx; this.y = ty;
    this.render(Game.screen, this.x, this.y);
    return true;
};

Actor.prototype.loseHp = function(amt) {
    this.hp -= amt;
    if (this.hp <= 0) {
        this.die();
    }
};

Actor.prototype.melee = function(other) {
    //ActorMessage(this, "%The %{verb,bump} into %the.".format(this,this,other));
    // TODO: actual combat mechanics
    var roll = Dice(1,20);
    roll += this.stats.attack;
    if (roll > other.stats.level * 3) {
        // hit, roll base 1d4 damage
        roll = Dice(1,4);
        // add damage bonus if applicable
        roll += this.stats.damage ? this.stats.damage : 0;
        // subtract armor.
        roll -= other.stats.armor;
        if (roll >= other.hp) {
            ActorMessage(this, "%The %{verb,kill} %the!".format(this, this, other));
            other.loseHp(roll);
        } else if (roll <= 0) {
            ActorMessage(this, "%Your attack glances harmlessly off %the.".format(this, other));
            // don't bother taking the hit if armor absorbed it all.
        } else {
            ActorMessage(this, "%The %{verb,hit} %the.".format(this, this, other));
            other.loseHp(roll);
        }
    } else {
        ActorMessage(this, "%The %{verb,miss} %the.".format(this,this, other));
    }
    return true;
};

Actor.prototype.die = function() {
    this.dead = true;
    this.map.removeMob(this);
    Game.time.remove(this);
};