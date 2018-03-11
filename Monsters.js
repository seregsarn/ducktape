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
            //armor: 100000,
            armor: 1,
        }
    },{
        name: 'astrojag',
        glyph: 'f',
        color: 'yellow',
        flags: [],
        brain: AI.seek_player,
        probability: 8,
        stats: {
            level: 1,
            maxhp: 3,
            attack: 0,
            damage: 0,
            armor: 0,
        },
    },{
        name: 'dire astrojag',
        glyph: 'F',
        color: 'orange',
        flags: [],
        brain: AI.seek_player,
        probability: 2,
        stats: {
            level: 3,
            maxhp: 15,
            attack: 1,
            damage: 2,
            armor: 1,
        },
    },{
        name: 'duckeater',
        glyph: 'M',
        color: 'green',
        flags: [],
        brain: AI.seek_player,
        probability: 1,
        stats: {
            level: 5,
            maxhp: 25,
            attack: 3,
            damage: 5,
            armor: 3,
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
monsters.random = function(level) {
    if (level === undefined) level = 10000;
    var idx;
    do {
        idx = ROT.RNG.getWeightedValue(monsters.prob_table);
    } while (monsters[idx].stats.level > level);
//console.log("[",idx,"]",monsters[idx]," <=> ",level);
    return monsters[idx];
};
