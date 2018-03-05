//ROT.RNG.setSeed(12345);
String.format.map.the = "the";
String.format.map.a = "a";

var Game = {
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
        Message.screen = this.screen;
        document.body.appendChild(this.screen.getContainer());
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
        tim.name = "tim";
        this.time.add(tim, true);
        spot = this.map.findLocation(tiles.FLOOR);
        this.map.putMob(tim,spot[0],spot[1]);
        this.engine.start();
        Message.log('testing!');
    },
    render: function() {
        this.screen.clear();
        this.map.render(this.screen, true);
        Message.render();
        //console.log("mobs:", this.map.mobs);
    }
};