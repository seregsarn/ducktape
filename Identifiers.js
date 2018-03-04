var Identifier = {
    currentValue: 1,
    get: function() {
        var v = this.currentValue;
        this.currentValue += 1;
        return v;
    }
};

