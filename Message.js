var Message = {
    screen: null,
    historyWindow: null,
    history: [],
    historySize: 25,
    expire: function() {
        this.history.forEach(function(elt) {
            elt.persist = false;
        });
    },
    clear: function() {
        var x;
        for (x = 0; x < this.screen.getOptions().width; x++) {
            this.screen.draw(x,0, ' ');
        }
    },
    log: function() {
        var str = Array.from(arguments).join(',');
        this.clear();
        this.screen.drawText(0,0, str);
        console.log(str);
        this.history.push({text: str, persist: true});
        if (this.history.length > this.historySize) this.history.shift();
    },
    render: function() {
        if (this.history.length < 1) return;
        var lines = "";
        var i;
        for (i = 0; i < this.history.length; i++) {
            var h = this.history[i];
            if (h.persist) {
                if (lines.charAt(lines.length-1) == '.') lines = lines.substr(0,lines.length-1) + ';';
                lines += (lines != '' ? '  ':'') + h.text;
            }
        }
        this.screen.drawText(0,0,lines);
    },
    renderHistory: function() {
        var i, row, color;
        row = 0;
        if (this.historyWindow !== null) {
            this.historyWindow.clear();
            for (i = this.history.length-1; i >= 0; i--) {
                var h = this.history[i];
                var x = Math.round(((this.historySize - row) / this.historySize) * 255);
                color = 'rgb('+x+','+x+','+x+')';
                if (h.persist) color = 'rgb(255,255,0)';
                this.historyWindow.drawText(0, row, '%c{'+color+'}'+h.text);
                row++;
            }
        }
    }
};

// helper functions
function ActorMessage(actor, msg) {
    if (actor == Game.player) {
        Message.log(msg);
    } else {
        // todo: visibility check
        if (actor.visible) Message.log(msg);
    }
}

// formatting stuff
String.format.map.the = "the";
String.format.map.a = "a";
String.format.map.verb = "verb";
