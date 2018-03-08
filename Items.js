function Item(type) {
    this.id = Identifier.get();
    this.map = null;
    if (type !== undefined) {
        if (typeof type == 'string') this.type = items.get(type);
        else this.type = type;
    } else {
        this.type = items.random();
    }
    this.x = this.y = 0;
}
Item.prototype.a = function() {
    if (!this.type) return "an unknown object";
    if (this.type.artifact) return this.the();
    var nm = (this.type.adjective ? this.type.adjective + " " : "") + this.type.name;
    if (nm.charAt(0).match(/[aeiou]/)) return 'an '+ nm;
    return 'a ' + nm;
};
Item.prototype.the = function() {
    if (!this.type) return "the unknown object";
    var nm = (this.type.adjective ? this.type.adjective + " " : "") + this.type.name;
    return 'the ' + nm;
};
Item.prototype.render = function(display,x,y) {
    display.draw(x,y, this.type.glyph, this.type.color, this.type.background);
};

