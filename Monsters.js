var monsters = [
    {
        name: 'player_dummy',
        //glyph: '@',
        glyph: String.fromCodePoint(0x1F986),
        color: 'white',
        background: 'blue',
        flags: ['open_doors'],
        probability: 0,
        stats: {
            level: 1,
            maxhp: 100,
            attack: 0,
            damage: 0,
            armor: 100000,
        }
    },{
        name: 'astrojag',
        glyph: 'f',
        color: 'yellow',
        flags: ['open_doors'],
        brain: AI.random_walk,
        probability: 1,
        stats: {
            level: 1,
            maxhp: 3,
            attack: 0,
            damage: 0,
            armor: 0,
        },
    }
];
var Monster = {
    has_flag: function(str) {
        return this.flags ? this.flags.includes(str) : false;
    }
};
monsters.prob_table = {};
monsters.forEach(function(elt) {
    monsters[elt.name] = elt;
    elt.__proto__ = Monster;
    monsters.prob_table[elt.name] = elt.probability;
});
monsters.random = function() {
    return monsters[ROT.RNG.getWeightedValue(monsters.prob_table)];
};
