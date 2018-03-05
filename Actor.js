function Actor() {
    this.id = Identifier.get();
    this.name = '';
    this.speed = 12;
    this.x = 0; this.y = 0;
    this.map = null;
}
Actor.prototype.act = function() {
    console.log(this.name + " is acting");
    var dx, dy;
    dx = Math.round(ROT.RNG.getUniform() * 2) - 1;
    dy = Math.round(ROT.RNG.getUniform() * 2) - 1;
    this.move(dx, dy);
    if (ROT.RNG.getPercentage() > 900) {
        console.log(this.name + " dies!");
        this.map.removeMob(this);
        Game.time.remove(this);
    }
};
Actor.prototype.getSpeed = function() { return this.speed; };
Actor.prototype.render = function(display,x,y) {
    display.draw(x,y, this.type.glyph, this.type.color, this.type.background);
};
Actor.prototype.a = function() {
    var w, c;
    if (this.name !== '') return this.name;
    w = (this.type ? this.type.name : 'unknown actor');
    c = w.charAt(0);
    if ("aeiou".indexOf(c)) return "an " + w;
    return "a " + w;
};
Actor.prototype.the = function() {
    var w;
    if (this.name !== '') return this.name;
    w = (this.type ? this.type.name : 'unknown actor');
    return "the " + w;
};
Actor.prototype.move = function(dx,dy) {
    var tx = this.x + dx;
    var ty = this.y + dy;
    if (tx < 0 || tx > this.map.w-1 || ty < 0 || ty > this.map.h-1) {
        return false;
    }
    var target = this.map.at(tx,ty);
    if (!target) return false; // can't walk through the nothing whee
    if (target.solid) {
        if (target.name == 'DOOR') {
            if (this == Game.player) {
                Message.log('You open the door.');
            } else {
                // todo: visibility check
                Message.log('%The opens the door.'.format(this) );
            }
            this.map.write(tx,ty,'OPENDOOR');
            this.map.updateTile(Game.screen, tx, ty);
            return true;
        }
        return false;
    }
    this.map.updateTile(Game.screen, this.x, this.y);
    this.x = tx; this.y = ty;
    this.render(Game.screen, this.x, this.y);
    return true;
}
