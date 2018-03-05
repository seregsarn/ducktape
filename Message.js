var Message = {
    screen: null,
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
        var h = this.history[this.history.length - 1];
        if (h.persist) this.screen.drawText(0,0,h.text);
    }
};