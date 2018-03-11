function Dungeon(numAreas) {
    this.areas = [];
    this.items_to_place = [];
    var inst = this;
    numAreas = numAreas || Math.floor(ROT.RNG.getUniform() * 3) + 3;
    // -----------------
    var levels = []; // to be created
    var branchLength;
    var branch;
    var i, m, ex, itm;
    // start with a main branch containing the mcguffin and hazards which must be navigated.
    var mainBranch = this.createBranch(numAreas, new Item("Grapes of Yendor"));
    mainBranch.forEach(b => levels.push(b));
    this.startAt = levels[levels.length - 1].id;
//this.startAt = levels[0].id;
//console.log("branch:", branch);
    // now add more branches.
    this.items_to_place.forEach(function (itp) {
//console.log("ITP:", itp);
        var itm;
        if (itp == 'water') {
            itm = new Item(items.get('water bucket'));
        } else {
            itm = new Item(itp);
        }
//        var branchLength = Math.floor(ROT.RNG.getUniform()*3)+2;
        var branchLength = 1;
        branch = inst.createBranch(branchLength, itm, 0.0);
//console.log("subBranch: ",branch);
        // pick a place to insert this sub-branch
        var branchStart = branch[branch.length - 1];
        var branchPoint;
        var idx = 0;
        do {
            idx = Math.floor(ROT.RNG.getUniform() * mainBranch.length);
            branchPoint = mainBranch[idx];
            //console.log(mainBranch[idx].forbid, " <=> ", itm.type);
            //console.log("try:",idx, '/',mainBranch.length);
        } while (branchPoint.forbid.find(f => f == itm.type) !== undefined);
        //console.log("connecting ",branchStart.id," to ",branchPoint.id);
        // Add exits to branch and to the selected level to link them up.
        branchStart.exits.push({ toLevel: branchPoint.id, hazard: false });
        branchPoint.exits.push({ toLevel: branchStart.id, hazard: false });
        branch.forEach(function(b) {
            b.forbid = mainBranch[idx].forbid;
            levels.push(b);
        });
    });
//console.log("levels to be constructed: ",levels);
    // TODO: now construct all maps and decorate them according to their depth/etc.
    for (i = 0; i < levels.length; i++) {
//console.warn(levels[i].reward);
        if (levels[i].reward && levels[i].reward.type.name == 'water bucket') {
            delete levels[i].reward;
            levels[i].water = true;
//console.warn("level ",i," has water bucket; ", levels[i]);
        }
        if (ROT.RNG.getUniform() > 0.8) levels[i].water = true;
        m = MapGen.createMapFromDescription(levels[i]);
        this.areas.push(m);
    }
    var setDepths = function(map, depth) {
        if (map.depth !== undefined) return;
        map.depth = depth;
        map.exits.forEach(function(ex) {
            if (ex.dest == -1) return;
            var m = this.findLevelById(ex.dest);
            setDepths(m, depth+1);
        }.bind(this));
    }.bind(this);
    var map = this.findLevelById(this.startAt);
    setDepths(map, 1);
    // populate the world
    this.areas.forEach(function(m, idx) {
        k = Math.floor(ROT.RNG.getUniform() * 10) + 5;
        for (i = 0; i < k; i++) {
if (idx == 1) console.log("make monster #", i, " for level ", m.id, " (depth ", m.depth, ")");
            var mon = new Actor(monsters.random(m.depth));
            do {
                pt = map.findWalkableSpot();
            } while (map.mobAt(pt[0],pt[1]));
            map.putMob(mon, pt[0],pt[1]);
            Game.time.add(mon, true);
        }
    });
//console.log('dungeon:',this);
}

Dungeon.prototype.createBranch = function(len, reward, hazPct) {
    hazPct = hazPct !== undefined ? hazPct : 1.0;
    var inst = this;
    var i, branchSize, parts;
    var branch = [];
    branchSize = len;
    for (i = 0; i < branchSize; i++) {
        var haz = null;
        if (ROT.RNG.getUniform() <= hazPct) {
            haz = blockers.random();
//haz = blockers[4];
            var itemList, itemChoice;
            itemList = (haz.traversal || []).concat(haz.removal || []);
            itemChoice = itemList.choose();
            (typeof itemChoice == 'array' ? itemChoice : [itemChoice]).forEach(function(item) {
                parts = items.dependencies(item);
                parts.forEach(function(p) { if (!inst.items_to_place.includes(p)) inst.items_to_place.push(p); });
            });
        }
        branch.push({
            id: Identifier.get(),
            exits: [],
            hazard: haz,
            item: itemChoice
        });
    }
    branch[0].reward = reward;
//console.log("items:",this.items_to_place);
    // ok, now we have the main branch. Go through it and forbid things.
    var forbidList = [];
    for (i = branchSize-1; i >= 0; i--) {
//console.log("forbidding for level ",i);
        // forbid all the stuff we need to get in here
        branch[i].forbid = [].concat(forbidList);
        if (branch[i].item) {
            parts = items.dependencies(branch[i].item);
            parts.forEach(function (p) { if (!forbidList.includes(p)) forbidList.push(p); });
        }
        if (branchSize < 2) {
            branch[i].exits = [];
        } else if (i == 0) { 
            branch[i].exits = [{ toLevel: branch[i+1].id, hazard: false }];
        } else if (i == branchSize-1) {
            branch[i].exits = [{ toLevel: -1, hazard: false },{ toLevel: branch[i-1].id, hazard: false }];
        } else {
            branch[i].exits = [{ toLevel: branch[i-1].id, hazard: false },{ toLevel: branch[i+1].id, hazard: true }];
        }
    }
    return branch;
};

Dungeon.prototype.findLevelById = function(id) {
    return this.areas.find(lev => lev.id == id);
};

Dungeon.prototype.describe = function() {
    var start = this.findLevelById(startAt);
    // TODO: recurse down and describe the dungeon.
};