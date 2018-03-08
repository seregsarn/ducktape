var tiles = [
    {name: 'FLOOR', glyph: '.', color: 'silver', solid: false, opaque: false },
    {name: 'CORR', glyph: '#', color: 'grey', solid: false, opaque: false },
    {name: 'DOOR', glyph: '+', color: 'brown', solid: true, opaque: true },
    {name: 'OPENDOOR', glyph: '/', color: 'brown', solid: false, opaque: false },
    {name: 'IND_WALL', glyph: '*', color: 'silver', solid: true, opaque: true },
    {name: 'HWALL', glyph: '-', color: 'silver', solid: true, opaque: true },
    {name: 'VWALL', glyph: '|', color: 'silver', solid: true, opaque: true },
    {name: 'CWALL', glyph: '+', color: 'silver', solid: true, opaque: true },
    {name: 'EXIT', glyph: '<', color: 'silver', solid: false, opaque: false },
    {name: 'PEDESTAL', glyph: 'I', color: 'darkgray', solid: false, opaque: false },
    {name: 'HIGHCAVEFLOOR', glyph: '[', color: 'rgb(144,144,96)', solid: false, opaque: false, altitude: 3 },
    {name: 'HIGHSLOPE', glyph: '{', color: 'rgb(124,124,96)', solid: false, opaque: false, altitude: 2.5 },
    {name: 'MIDCAVEFLOOR', glyph: ':', color: 'rgb(128,128,64)', solid: false, opaque: false, altitude: 2 },
    {name: 'LOWSLOPE', glyph: '}', color: 'rgb(96,96,32)', solid: false, opaque: false, altitude: 1.5 },
    {name: 'LOWCAVEFLOOR', glyph: ']', color: 'rgb(64,64,0)', solid: false, opaque: false, altitude: 1 },
];
tiles.forEach(function(elt) {
    tiles[elt.name] = elt;
});

function tile(n) {
    return tiles.find(function(elt) { return elt.name == n; });
}
function tileIdx(n) {
    return tiles.findIndex(function(elt) { return elt.name == n; });
}
function is_wall(tile) {
    var list = ['HWALL','VWALL','CWALL','IND_WALL'];
    if (tile === undefined) return false;
    if (list.includes(tile.name)) return true;
    return false;
}
function is_cave(tile) {
    var list = ['HIGHCAVEFLOOR','HIGHSLOPE','MIDCAVEFLOOR','LOWSLOPE','LOWCAVEFLOOR'];
    if (tile === undefined) return false;
    if (list.includes(tile.name)) return true;
    return false;

}
function links_walls(tile) {
    var list = ['HWALL','VWALL','CWALL','DOOR','OPENDOOR','IND_WALL'];
    if (tile === undefined) return false;
    if (list.includes(tile.name)) return true;
    return false;
}
function cave_slope_check(from, to) {
    if (!from || !to || !from.altitude || !to.altitude) return 0;
    return (to.altitude - from.altitude);
}