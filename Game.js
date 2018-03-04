//ROT.RNG.setSeed(12345);
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
        document.body.appendChild(this.screen.getContainer());
        this.map = MapGen.generateMap();
        this.time = new ROT.Scheduler.Speed();
        this.engine = new ROT.Engine(this.time);
        this.player = new Player();
        this.time.add(this.player, true);
        this.map.addMob(this.player);
        var tim = new Actor();
        tim.name = "tim";
        this.time.add(tim, true);
        this.map.addMob(tim);
        this.engine.start();
    },
    render: function() {
        this.map.render(this.screen);
        //console.log("mobs:", this.map.mobs);
        for (i = 0; i < this.map.mobs.length; i++) {
            var m = this.map.mobs[i];
            m.render(this.screen, m.x, m.y);
        }
    }
};