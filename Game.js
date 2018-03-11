//ROT.RNG.setSeed(12345);
Array.prototype.shuffle = function() {
    this.sort(function() { return 0.5 - ROT.RNG.getUniform(); });
};
Array.prototype.choose = function() {
    var idx = Math.floor(ROT.RNG.getUniform() * this.length);
    return this[idx];
};
Array.prototype.chooseIndex = function() {
    var idx = Math.floor(ROT.RNG.getUniform() * this.length);
    return idx;
};

function Dice(count, size) {
    var acc = 0, i;
    for (i = 0; i < count; i++) {
        acc += Math.floor(ROT.RNG.getUniform() * size) + 1;
    }
    return acc;
}

var Game = {
    VISION_RADIUS: 10,
    // -----------
    screen: null,
    time: null,
    engine: null,
    world: null,
    map: null,
    mapRenderPos: [0,1],
    player: null,
    itemPopup: null,
    // ------------
    shutdown: function() {
        $(this.screen.getContainer()).remove();
        $(Message.historyWindow.getContainer()).remove();
        //console.log("gone");
        MainMenu.show();
    },
    init: function(name) {
        this.itemPopup = $('#itemPopup');
        this.time = new ROT.Scheduler.Speed();
        this.engine = new ROT.Engine(this.time);
        this.screen = new ROT.Display({
            width: 80, height: 27,
            fontSize: 16,
            spacing: 1.1,
            //fontSize: 12,
            //forceSquareRatio: true,
        });
        document.body.appendChild(this.screen.getContainer());
        Message.empty();
        Message.screen = this.screen;
        Message.historyWindow = new ROT.Display({
            width: 100,
            height: Message.historySize,
            fontSize: 12,
            spacing: 1.05
        });
        document.body.appendChild(document.createElement('br'));
        document.body.appendChild(Message.historyWindow.getContainer());
        this.world = new Dungeon(5);
        this.map = this.world.findLevelById(this.world.startAt);
        //this.map = this.world.areas[0];
//this.world.areas.forEach(m => m.magicMap());
        this.player = new Player(name);
        this.time.add(this.player, true);
        var spot = this.map.exits.find(ex => ex.dest == -1).loc;
        this.map.putMob(this.player,spot[0],spot[1]);
        Inventory.init(this.player);
//this.map.placeItem(new Item("Grapes of Yendor"), spot[0]-1, spot[1]);
        // run the engine loop
        this.engine.start();
        Message.log('Hello '+ this.player.name +', welcome to Duck Tape Hero!');
        this.render();
    },
    render: function() {
        this.screen.clear();
        this.map.render(this.screen, { drawMobs: true, drawItems: true, memory: true });
        if (this.player.promptData && this.player.promptData.render) this.player.promptData.render(this.screen);
        Message.render();
        Message.renderHistory();
        // status lines
        this.screen.drawText(0,25,this.player.name + " the duck");
        this.screen.drawText(0,26,"HP: %s/%s".format(this.player.hp, this.player.stats.maxhp));
        var weap = "Weapon: %S; Armor: %S".format(this.player.weapon ? this.player.weapon.type.name : "None", this.player.armor ? this.player.armor.type.name : "None");
        this.screen.drawText(80 - weap.length, 26, weap);
        // "HP: " + this.player.hp + "/" + this.player.stats.maxhp + " ");
        var name = this.map.name + ", depth " + this.map.depth;
        this.screen.drawText(80 - name.length,25, name);
        var t = this.map.at(this.player.x, this.player.y);
        if (t && (t == tiles.EXIT || t == tiles.STAIRS)) {
            this.screen.drawText(20, 25, "SPACE: Take the stairs.")
        }
    }
};

function ItemPopup(msg, itm) {
    msg = (msg !== undefined ? msg : "You got:");
    $('img.one', Game.itemPopup).attr('src', 'assets/'+ itm.type.icon + '.png');
    $('img.two', Game.itemPopup).hide();
    $('span', Game.itemPopup).html("%s <span>%a</span>".format(msg, itm));
    Game.itemPopup.css({
        display: 'block',
        top: '100vh',
        opacity: 1.0,
    }).animate({
        top: '50%',
    },{duration: 500})
    .delay(750)
    .animate({
        top: '25%',
        opacity: 0.0,
    }, {duration: 750});
}

function TwoItemPopup(msg, itm1, itm2) {
    msg = (msg !== undefined ? msg : "You got:");   
    $('img.one', Game.itemPopup).attr('src', 'assets/'+ itm1.type.icon + '.png');
    $('img.two', Game.itemPopup).show().attr('src', 'assets/'+ itm2.type.icon + '.png');
    $('span', Game.itemPopup).html("%s <span>%a</span> and <span>%a</span>".format(msg, itm1, itm2));
    Game.itemPopup.css({
        display: 'block',
        top: '100vh',
        opacity: 1.0,
    }).animate({
        top: '50%',
    },{duration: 500})
    .delay(750)
    .animate({
        top: '25%',
        opacity: 0.0,
    }, {duration: 750});
}