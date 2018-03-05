//ROT.RNG.setSeed(12345);
var Game = {
    VISION_RADIUS: 10,
    // -----------
    screen: null,
    time: null,
    engine: null,
    map: null,
    player: null,
    // ------------
    init: function() {
        this.screen = new ROT.Display({
            fontSize: 16,
            spacing: 1.1
        });
        document.body.appendChild(this.screen.getContainer());
        Message.screen = this.screen;
        Message.historyWindow = new ROT.Display({
            width: 100,
            height: Message.historySize,
            fontSize: 12,
            spacing: 1.05
        });
        document.body.appendChild(Message.historyWindow.getContainer());
        this.map = MapGen.generateMap();
        this.map.renderY = 1;
        this.time = new ROT.Scheduler.Speed();
        this.engine = new ROT.Engine(this.time);
        this.player = new Player('thp');
        this.time.add(this.player, true);
        var spot = this.map.findLocation(tiles.FLOOR);
        this.map.putMob(this.player,spot[0],spot[1]);
        var tim = new Actor();
        tim.type = monsters.astrojag;
        tim.name = "Tim";
        this.time.add(tim, true);
        spot = this.map.findLocation(tiles.FLOOR);
        this.map.putMob(tim,spot[0],spot[1]);
        for (var i = 0; i < 25; i++) {
            tim = new Actor();
            tim.type = monsters.astrojag;
            this.time.add(tim, true);
            spot = this.map.findLocation(tiles.FLOOR);
            this.map.putMob(tim,spot[0],spot[1]);
        }
        // run the engine loop
        this.engine.start();
        Message.log('TODO: Insert Greeting Message Here!');
    },
    render: function() {
        this.screen.clear();
        this.map.render(this.screen, { drawMobs: true, memory: true });
        Message.render();
        Message.renderHistory();
        //console.log("mobs:", this.map.mobs);
    }
};