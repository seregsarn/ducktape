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
        color: 'yellow'
    }
];
monsters.forEach(function(elt) {
    monsters[elt.name] = elt;
});
