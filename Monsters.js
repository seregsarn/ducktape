var monsters = [
    {
        name: 'player_dummy',
        glyph: '@',
        color: 'white',
        background: 'blue',
        flags: ['open_doors'],
    },{
        name: 'astrojag',
        glyph: 'f',
        color: 'yellow',
        flags: ['open_doors'],
        brain: AI.random_walk
    }
];
var Monster = {
    has_flag: function(str) {
        return this.flags ? this.flags.includes(str) : false;
    }
};
monsters.forEach(function(elt) {
    monsters[elt.name] = elt;
    elt.__proto__ = Monster;
});
