var tiles = [
    {name: 'FLOOR', glyph: '.', color: 'silver', solid: false, opaque: false },
    {name: 'CORR', glyph: '#', color: 'grey', solid: false, opaque: false },
    {name: 'DOOR', glyph: '+', color: 'brown', solid: true, opaque: true },
    {name: 'OPENDOOR', glyph: '/', color: 'brown', solid: false, opaque: false },
    {name: 'IND_WALL', glyph: '*', color: 'silver', solid: true, opaque: true },
    {name: 'HWALL', glyph: '-', color: 'silver', solid: true, opaque: true },
    {name: 'VWALL', glyph: '|', color: 'silver', solid: true, opaque: true },
    {name: 'CWALL', glyph: '+', color: 'silver', solid: true, opaque: true }
];
tiles.forEach(function(elt) {
    tiles[elt.name] = elt;
});

function tile(n) {
    return tiles.findIndex(function(elt) { return elt.name == n; });
}
function is_wall(tile) {
    var list = ['HWALL','VWALL','CWALL','IND_WALL'];
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
