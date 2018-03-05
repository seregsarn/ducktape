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
    if (ROT.RNG.getPercentage() > 90) {
        console.log(this.name + " dies!");
        this.map.removeMob(this);
        Game.time.remove(this);
    }
};
Actor.prototype.getSpeed = function() { return this.speed; };
Actor.prototype.render = function(display,x,y) {
    display.draw(x,y, this.type.glyph, this.type.color, this.type.background);
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
            this.map.write(tx,ty,'OPENDOOR');
            return true;
        }
        return false;
    }
    this.map.updateTile(Game.screen, this.x, this.y);
    this.x = tx; this.y = ty;
    this.render(Game.screen, this.x, this.y);
    return true;
}
