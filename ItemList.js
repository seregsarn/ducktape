var ItemList = [
    {
        name: 'stale bread',
        adjective: 'scrap of',
        //glyph: String.fromCodePoint(0x1F956),
        //glyph: String.fromCodePoint(0x1F35E),
        //glyph: String.fromCodePoint(0x00B5),
        glyph: '$',
        color: 'white',
        prob: 5
    },{
        name: 'rope',
        adjective: 'coil of',
        glyph: '\xA7',
        color: 'yellow',
        prob: 1
    },{
        name: 'twine',
        adjective: 'length of',
        glyph: '~',
        color: 'white',
        prob: 1
    },{
        name: 'stick',
        glyph: '-',
        color: 'brown',
        prob: 1
    },{
        name: 'pole',
        adjective: 'ten foot',
        glyph: '/',
        color: 'brown',
        prob: 1
    },{
        name: 'screwdriver',
        glyph: '\x87',
        color: 'orange',
        prob: 1
    },{
        name: 'knife',
        glyph: '\x86',
        color: 'silver',
        prob: 1
    },{
        name: 'oil',
        adjective: 'can of',
        glyph: '\xAC',
        color: 'darkgray',
        prob: 1
    },{
        name: 'herring',
        glyph: '%',
        color: 'red',
        prob: 1
    },{
        name: 'crowbar',
        glyph: '\x83',
        color: 'red',
        prob: 1
    },{
        name: 'pipe',
        glyph: '\xA6',
        color: 'silver',
        prob: 1
    },{
        name: 'lens',
        glyph: ')',
        color: 'lightcyan',
        prob: 1
    },{
        name: 'mirror',
        glyph: '\xFE',
        color: 'white',
        prob: 1
    },{
        name: 'flint',
        glyph: '*',
        color: 'darkgray',
        prob: 1
    },{
        name: 'hook',
        glyph: '?',
        color: 'silver',
        prob: 1
    },{
        name: 'rubber chicken',
        glyph: '$',
        color: 'lightyellow',
        prob: 1
    },{
        name: 'pulley',
        glyph: '0',
        color: 'silver',
        prob: 1
    },{
        name: 'bucket',
        glyph: '\xFB',
        color: 'grey',
        prob: 1
    },{ // only get the water bucket by filling a regular bucket
        name: 'water bucket',
        glyph: '\xFB',
        color: 'blue',
        prob: 0
    },{
        name: 'shoes',
        glyph: '&',
        color: 'green',
        prob: 1
/*
    },{
        name: 'helmet',
        glyph: '&',
        color: 'green',
        prob: 1
*/
//=======================
// crafted items
    },{
        name: 'piton',
        glyph: '^',
        color: 'blue',
        recipe: ['stick', 'knife']
    },{
        name: 'arrows',
        glyph: '^',
        color: 'brown',
        recipe: ['stick', 'flint']
    },{
        name: 'torch',
        adjective: 'oil-soaked',
        glyph: '\xCE',
        color: 'brown',
        recipe: ['stick', 'oil']
    },{
        name: 'bow',
        glyph: ')',
        color: 'brown',
        recipe: ['stick', 'twine']
    },{
        name: 'spear',
        glyph: '/',
        color: 'red',
        recipe: ['pole', 'knife']
    },{
        name: 'grappling hook',
        glyph: '?',
        color: 'gold',
        recipe: ['rope', 'hook']
    },{
        name: 'grapple bow',
        glyph: ')',
        color: 'gold',
        recipe: ['grappling hook', 'bow']
    },{
        name: 'catchpole',
        glyph: 'P',
        color: 'brown',
        recipe: ['pole', 'rope']
    },{
        name: 'ladder',
        //glyph: '\xB6',
        glyph: 'H',
        color: 'brown',
        recipe: ['stick', 'pole']
    },{
        name: 'long range screwdriver',
        glyph: '!',
        color: 'orange',
        recipe: ['screwdriver', 'pole']
    },{
        name: 'telescope',
        glyph: '!',
        color: 'gold',
        recipe: ['pipe', 'lens']
    },{
        name: 'periscope',
        glyph: '\xED',
        color: 'white',
        recipe: ['mirror', 'pole']
    },{
        name: 'blowgun',
        glyph: '/',
        color: 'silver',
        recipe: ['pipe', 'arrows']
    },{
        name: 'fire arrows',
        glyph: '/',
        color: 'silver',
        recipe: ['oil', 'arrows']
    },{
        name: 'climbing shoes',
        glyph: ']',
        color: 'green',
        recipe: ['piton', 'shoes']
    },{
        name: 'scythe',
        glyph: '7',
        color: 'brown',
        recipe: ['hook', 'pole']
    },{
        name: 'rope ladder',
        //glyph: '\xB6',
        glyph: 'H',
        color: 'white',
        recipe: ['piton', 'rope']
    },{
        name: 'rubber chicken with a pulley in the middle',
        glyph: '%',
        color: 'lightyellow',
        recipe: ['rubber chicken', 'pulley']
    },{
        name: 'Grapes of Yendor',
        //glyph: '%',
        glyph: '\x89',
        //glyph: String.fromCodePoint(0x1f347),
        color: 'magenta',
        artifact: true
    }
];
var items = {
    prob_table: {},
    random: function() {
        var idx = ROT.RNG.getWeightedValue(this.prob_table);
        return ItemList[idx];
    },
    get: function(name) {
        var idx = ItemList.findIndex(elt => elt.name == name);
        return ItemList[idx];
    },
    dependencies: function(type) {
        var t = type;
        if (typeof t == 'string') t = items.get(t);
        var r;
        var deps = [];
        if (t.recipe !== undefined) {
            for (r = 0; r < t.recipe.length; r++) {
                var rr = items.get(t.recipe[r]);
                if (rr === undefined) console.error('unimplemented dependency: ', t.name, " depends on ",r, t.recipe[r], ", which doesn't exist");
                //console.log('deps: ', rr);
                deps = deps.concat(items.dependencies(rr));
            }
        } else {
            deps.push(t);
        }
        return deps;
    }
};
ItemList.forEach(function(it, idx) {
    if (it.prob === undefined) return;
    items.prob_table[idx] = it.prob ? it.prob : 0;
});