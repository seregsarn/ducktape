function Dungeon(numAreas) {
    var inst = this;
    numAreas = numAreas || Math.floor(ROT.RNG.getUniform() * 5) + 1;
    this.areas = [];
    this.items_to_place = [];
    var levelCount = 0;
    var i, m, ex, itm;
    // start with a main "branch" containing the mcguffin and hazards which must be navigated.
    itm = new Item('Grapes of Yendor');
    var branch = this.createBranch(numAreas, itm);
    for (i = 0; i < branch.length; i++) {
        this.areas.push(branch[i]);
    }
    this.startAt = branch[branch.length - 1].id;
this.startAt = branch[0].id;
//console.log("to place: ", this.items_to_place);
    // now, go through the items_to_place list, one by one:
    for (i = 0; i < this.items_to_place.length; i++) {
        itm = this.items_to_place[i];
        // find a random level in the dungeon that doesn't have this item on its "forbid" list.
        do {
            var blvl = Math.floor(ROT.RNG.getUniform() * this.areas.length);
            m = this.areas[blvl];
        } while (m.forbid.includes(itm));
        // TODO: special case: check if item is needed for the hazard on the chosen level. if so, set a "outside" flag and allow us to put it in the accessible part of the level.
//console.log("place ", itm, " so that it's accessible from level ", m.id);
        itm = items.get(itm);
        // recursively build a branch 1-2 levels long, with the chosen item at the end of it.
        var branchSize = Math.floor(ROT.RNG.getUniform() * 2) + 1;
        branch = this.createBranch(branchSize, itm, false);
//console.log("adding branch: ", branch);
        ex = MapGen.addExit(m, tiles.EXIT);
        var branchStart = branch[branch.length - 1]
        ex.dest = branchStart.id;
        branchStart.exits[0].dest = m.id;
        branch.forEach(function(lev) { 
            inst.areas.push(lev);
        });
    }
    delete this.items_to_place;
    // TODO: now decorate/fill all maps, according to their depth.
    console.log('dungeon:',this);
}
Dungeon.prototype.findLevelById = function(id) {
    return this.areas.find(lev => lev.id == id);
};
Dungeon.prototype.createBranch = function(len, itm, hazards) {
    var inst = this;
    var levels = [];
    hazards = hazards == undefined ? true : hazards;
    // start with the item and the level it goes on. one exit, one pedestal.
    m = MapGen.generateItemLevel(itm);
    levels.push(m);
    var prev = m;
    // make [numAreas] levels leading back to the start, and connect the exits to one another.
    for (i = 0; i < len; i++) {
        m = MapGen.generateMap();
        MapGen.addExit(m);
        MapGen.addExit(m);
        m.exits[1].dest = prev.id;
        prev.exits[0].dest = m.id;
        levels.push(m);
        prev = m;
    }
    if (!hazards) return levels;
    // working our way back out, pick hazards for the levels.
    for (i = 0; i < len; i++) {
        m = levels[i];
        // pick a random hazard for the level.
        m.hazard = blockers.random();
        // pick one of the random items that can solve the hazard.
        var fixList, fixChoice;
        fixList = (m.hazard.traversal || []).concat(m.hazard.removal || []);
        fixChoice = fixList[Math.floor(ROT.RNG.getUniform() * fixList.length)];
        (typeof fixChoice == 'array' ? fixChoice : [fixChoice]).forEach(function (fix) {
            //fix = items.get('grapple bow');
//    console.log("requiring ", fix, " in level ", m.id);
            // fully decompose that item into a list of things needed to pass the hazard.
            var parts = items.dependencies(fix);
            for (k = 0; k < parts.length; k++) { if (!inst.items_to_place.includes(parts[k])) inst.items_to_place.push(parts[k]); }
            // set each previous level to forbid those items.
//    console.log('branch level ',m.id,' forbids ', parts);
            for (j = i; j >= 0; j--) {
                for (k = 0; k < parts.length; k++) { if (!levels[j].forbid.includes(parts[k])) levels[j].forbid.push(parts[k]); }
            }
        });
        // TODO: create the hazard on this level, so that it blocks the path between exits 0 and 1.
    }
    return levels;
};