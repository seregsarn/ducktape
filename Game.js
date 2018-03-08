//ROT.RNG.setSeed(12345);
Array.prototype.shuffle = function() {
    this.sort(function() { return 0.5 - ROT.RNG.getUniform(); });
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
    // ------------
    init: function() {
        this.time = new ROT.Scheduler.Speed();
        this.engine = new ROT.Engine(this.time);
        this.screen = new ROT.Display({
            fontSize: 16,
            spacing: 1.1,
            //fontSize: 12,
            //forceSquareRatio: true,
        });
        document.body.appendChild(this.screen.getContainer());
        Message.screen = this.screen;
        Message.historyWindow = new ROT.Display({
            width: 100,
            height: Message.historySize,
            fontSize: 12,
            spacing: 1.05
        });
        document.body.appendChild(document.createElement('br'));
        document.body.appendChild(Message.historyWindow.getContainer());
        this.world = new Dungeon(2);
        this.map = this.world.findLevelById(this.world.startAt);
        //this.map = this.world.areas[0];
this.world.areas.forEach(m => m.magicMap());
        this.player = new Player('thp');
        this.time.add(this.player, true);
        var spot = this.map.exits[0].loc;
        this.map.putMob(this.player,spot[0],spot[1]);
        // run the engine loop
        this.engine.start();
        Message.log('Hello '+ this.player.name +', welcome to Duck Tape Hero!');
        this.render();
    },
    render: function() {
        this.screen.clear();
        this.map.render(this.screen, { drawMobs: true, drawItems: true, memory: true });
        Message.render();
        Message.renderHistory();
    }
};