var blockers = [
    {
        name: "big chasm with cable",
        traversal: ['rubber chicken with a pulley in the middle'],
        directional: "maybe"
    },{
        name: "chasm",
        traversal: ['grapple bow', 'ladder', 'climbing shoes'],
        directional: "maybe"
    },{
        name: "crush trap",
        traversal: ['pole'],
        removal: ['long range screwdriver'],
        directional: "no"
    },{
        name: "boarded up area",
        removal: ['crowbar'],
        directional: "no",
    },{
        name: "lava",
        traversal: ['grapple bow'],
        removal: ['water bucket'],
        directional: "no"
    },{
        name: "methane pocket",
        traversal: ['torch', 'flint', ['fire arrows','bow']],
        directional: "no"
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
    },{
        name: "laser beam",
        traversal: ['mirror', 'periscope'],
        directional: "no"
    },{
        name: "razorgrass field",
        traversal: ['shoes'],
        removal: ['scythe'],
        directional: "no"
    }
];
blockers.random = function() {
    var b = blockers.choose();
    if (b.count && b.count > 0) b = blockers.choose();
    return b;
};