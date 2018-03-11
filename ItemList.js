var ItemList = [
    {
        name: 'stale bread',
        adjective: 'scrap of',
        glyph: '%',
        emojiGlyph: String.fromCodePoint(0x1F956),
        //emojiGlyph: String.fromCodePoint(0x1F35E),
        //emojiGlyph: String.fromCodePoint(0x00B5),
        color: '#F9E79F',
        // icon: 'bread', // no need for an icon, it is autoconsumed.
        prob: 5
    },{
        name: 'rope',
        adjective: 'coil of',
        glyph: '\xA7',
        color: 'yellow',
        icon: 'rope-coil',
        prob: 1
    },{
        name: 'twine',
        adjective: 'length of',
        glyph: '~',
        color: 'white',
        icon: 'twine',
        prob: 1
    },{
        name: 'stick',
        glyph: '-',
        color: 'brown',
        icon: 'stick',
        prob: 1,
        weapon: true,
        attackBonus: 0,
        damageBonus: 1,
    },{
        name: 'pole',
        adjective: 'ten foot',
        glyph: '/',
        color: 'brown',
        icon: 'bo',
        prob: 1,
        weapon: true,
        attackBonus: 2,
        damageBonus: 1,
    },{
        name: 'screwdriver',
        glyph: '\x87',
        color: 'orange',
        icon: 'screwdriver',
        prob: 1,
        weapon: true,
        attackBonus: 1,
        damageBonus: 1,
    },{
        name: 'knife',
        glyph: '\x86',
        color: 'silver',
        icon: 'knife',
        prob: 1,
        weapon: true,
        attackBonus: 1,
        damageBonus: 2,
    },{
        name: 'oil',
        adjective: 'can of',
        glyph: '\xAC',
        color: 'darkgray',
        icon: 'oil',
        prob: 1,
    },{
        name: 'herring',
        glyph: '%',
        color: 'red',
        use: 'direction',
        icon: 'herring',
        prob: 1,
    },{
        name: 'crowbar',
        glyph: '\x83',
        color: 'red',
        use: 'direction',
        icon: 'crowbar',
        prob: 1,
        weapon: true,
        attackBonus: 2,
        damageBonus: 2,
    },{
        name: 'pipe',
        glyph: '\xA6',
        color: 'silver',
        icon: 'pipe',
        prob: 1,
        weapon: true,
        attackBonus: 2,
        damageBonus: 1,
    },{
        name: 'lens',
        glyph: ')',
        color: 'lightcyan',
        icon: 'lens',
        prob: 1
    },{
        name: 'mirror',
        glyph: '\xFE',
        color: 'white',
        icon: 'mirror',
        use: 'direction',
        prob: 1
    },{
        name: 'flint',
        glyph: '*',
        color: 'darkgray',
        icon: 'flint',
        prob: 1
    },{
        name: 'hook',
        glyph: '?',
        color: 'silver',
        icon: 'hook',
        prob: 1
    },{
        name: 'rubber chicken',
        glyph: '$',
        color: 'lightyellow',
        icon: 'rubber-chicken',
        prob: 1
    },{
        name: 'pulley',
        glyph: '0',
        color: 'silver',
        icon: 'pulley',
        prob: 1
    },{
        name: 'bucket',
        glyph: '\xFB',
        color: 'grey',
        use: 'instant',
        icon: 'bucket',
        prob: 1
    },{ // only get the water bucket by filling a regular bucket
        name: 'water bucket',
        glyph: '\xFB',
        color: 'blue',
        prob: 0,
        use: 'instant',
        icon: 'bucket-water',
        recipe: ['bucket', 'water']
    },{
        name: 'shoes',
        glyph: '&',
        color: 'green',
        icon: 'boots',
        prob: 1,
        armor: true,
        armorValue: 1,
/*
    },{
        name: 'helmet',
        glyph: '&',
        color: 'green',
        prob: 1
*/
//=======================
// crafted items
/*
    },{
        name: 'piton',
        glyph: '^',
        color: 'blue',
        recipe: ['stick', 'knife']
*/
    },{
        name: 'arrows',
        adjective: 'quiver of',
        glyph: '^',
        color: 'brown',
        icon: 'arrow',
        recipe: ['stick', 'flint'],
        attackBonus: 0,
        damageBonus: 1,
    },{
        name: 'torch',
        adjective: 'oil-soaked',
        glyph: '\xCE',
        color: 'brown',
        icon: 'torch',
        recipe: ['stick', 'oil']
    },{
        name: 'bow',
        glyph: ')',
        color: 'brown',
        icon: 'bow',
        recipe: ['stick', 'twine'],
        use: 'target',
        range: 6,
        attackBonus: 1,
        damageBonus: 3,
    },{
        name: 'spear',
        glyph: '/',
        color: 'red',
        icon: 'spear',
        recipe: ['pole', 'knife'],
        weapon: true,
        attackBonus: 1,
        damageBonus: 3,
    },{
        name: 'grappling hook',
        glyph: '?',
        color: 'gold',
        icon: 'grapple',
        recipe: ['rope', 'hook']
    },{
        name: 'grapple bow',
        glyph: ')',
        color: 'gold',
        recipe: ['grappling hook', 'bow'],
        icon: 'grapple-bow',
        use: 'target',
        range: 5,
/*    },{
        name: 'catchpole',
        glyph: 'P',
        color: 'brown',
        recipe: ['pole', 'rope']
*/
/*
    },{
        name: 'ladder',
        //glyph: '\xB6',
        glyph: 'H',
        color: 'brown',
        icon: 'ladder',
        recipe: ['stick', 'pole']
*/
    },{
        name: 'long range screwdriver',
        glyph: '!',
        color: 'orange',
        recipe: ['screwdriver', 'pole'],
        weapon: true,
        attackBonus: 2,
        damageBonus: 1,
    },{
        name: 'telescope',
        glyph: '!',
        color: 'gold',
        icon: 'spyglass',
        recipe: ['pipe', 'lens']
    },{
        name: 'periscope',
        glyph: '\xED',
        color: 'white',
        icon: '',
        recipe: ['mirror', 'pole']
    },{
        name: 'blowgun',
        glyph: '/',
        color: 'silver',
        icon: '',
        recipe: ['pipe', 'arrows'],
        use: 'target',
        range: 6,
    },{
        name: 'fire arrows',
        glyph: '/',
        color: 'silver',
        icon: 'flaming-arrow',
        recipe: ['oil', 'arrows'],
        attackBonus: 0,
        damageBonus: 3,
/*    },{
        name: 'climbing shoes',
        glyph: ']',
        color: 'green',
        icon: 'climb-boot',
        recipe: ['piton', 'shoes'],
        armor: true,
        armorValue: 2,
*/
    },{
        name: 'scythe',
        glyph: '7',
        color: 'brown',
        icon: 'scythe',
        recipe: ['hook', 'pole'],
        weapon: true,
        attackBonus: 1,
        damageBonus: 3,
        use: 'direction',
/*
    },{
        name: 'rope ladder',
        //glyph: '\xB6',
        glyph: 'H',
        color: 'white',
        recipe: ['piton', 'rope']
*/
    },{
        name: 'rubber chicken with a pulley in the middle',
        glyph: '%',
        color: 'lightyellow',
        recipe: ['rubber chicken', 'pulley'],
        icon: 'rubber-chicken-with-a-pulley-in-the-middle',
        use: 'instant'
    },{
        name: 'Grapes of Yendor',
        glyph: '%',
        //glyph: '\x89',
        emojiGlyph: String.fromCodePoint(0x1f347),
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
                if (t.recipe[r] == 'water') {
                    deps.push('water');
                    continue;
                }
                var rr = items.get(t.recipe[r]);
                if (rr === undefined) console.error('unimplemented dependency: ', t.name, " depends on ",r, t.recipe[r], ", which doesn't exist");
                //console.log('deps: ', rr);
                deps = deps.concat(items.dependencies(rr));
            }
        } else {
            deps.push(t);
        }
        return deps;
    },
    combine: function(i1, i2) {
        var i;
//console.log("items: ",i1,i2);
        for (i = 0; i < ItemList.length; i++) {
            var res = ItemList[i];
            if (res.artifact) continue;
            if (res.recipe === undefined) continue;
//console.log("recipe: ",res.recipe);
            if (!res.recipe.includes(i1.type.name) || !res.recipe.includes(i2.type.name)) continue;
            // found the recipe!
            return res;
        }
        return null;
    }
};
ItemList.forEach(function(it, idx) {
    if (it.prob === undefined) return;
    items.prob_table[idx] = it.prob ? it.prob : 0;
});
