var blockers = [
    { // done
        code: "BIGCHASM",
        name: "big chasm with cable",
        traversal: ['rubber chicken with a pulley in the middle'],
        directional: "maybe",
    },{ // done
        code: "CHASM",
        name: "chasm",
        traversal: ['grapple bow'],//, 'ladder', 'climbing shoes'],
        directional: "maybe"
/*    },{
        code: "CRUSH",
        name: "crush trap",
        traversal: ['pole'],
        removal: ['long range screwdriver'],
        directional: "no"
    },{
        code: "BOARDS",
        name: "boarded up area",
        removal: ['crowbar'],
        directional: "no",
*/
    },{
        code: "LAVA",
        name: "lava",
        traversal: ['grapple bow'],
        removal: ['water bucket'],
        directional: "no",
/*    },{
        code: "METHANE",
        name: "methane pocket",
        traversal: ['torch', 'flint', ['fire arrows','bow']],
        directional: "no"
*/
/*    },{
        name: "fog cloud",
        traversal: ['torch'],
        directional: "no"
*/
/*    },{
        name: "poison gas cloud",
        traversal: ['rebreather'],
        directional: "no"
*/
/*    },{
        code: "LASER",
        name: "laser beam",
        traversal: ['mirror', 'periscope'],
        directional: "no"
*/    },{
        code: "RAZORGRASS",
        name: "razorgrass field",
        traversal: ['shoes'],
        removal: ['scythe'],
        directional: "no"
/*    },{
        code: "WATER",
        name: "water",
        directional: "no",
*/    }
];
blockers.random = function() {
    var b = blockers.choose();
    if (b.count && b.count > 0) b = blockers.choose();
    return b;
};