function Actor() {
    this.id = Identifier.get();
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
Actor.prototype.verb = function(word) {
    if (this == Game.player) {
        // second person
        return word;
    } else {
        // third person
        return word + "s";
    }
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
            return true;
        }
        return false;
    }
    var other = this.map.mobAt(tx, ty);
    if (other !== undefined) {
if (this == Game.player) {
ActorMessage(this, "%The %{verb,kill} %the!".format(this, this, other));
other.die();            
return;
}
        ActorMessage(this, "%The %{verb,bump} into %the.".format(this,this,other));
        return false;
    }
    this.map.updateTile(Game.screen, this.x, this.y);
    this.x = tx; this.y = ty;
    this.render(Game.screen, this.x, this.y);
    return true;
};

Actor.prototype.die = function() {
    this.map.removeMob(this);
    Game.time.remove(this);
};