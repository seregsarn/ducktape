var AI = {
    random_walk: function() {
        var dx, dy;
        do {
            dx = Math.round(ROT.RNG.getUniform() * 2) - 1;
            dy = Math.round(ROT.RNG.getUniform() * 2) - 1;
        } while (dx == 0 && dy == 0);
        this.move(dx, dy);
        if (ROT.RNG.getPercentage() > 50) {
            ActorMessage(this, "%The %{verb,yelp}!".format(this, this));
        }
        /*
        if (ROT.RNG.getPercentage() > 95) {
            ActorMessage(this, "%The %{verb,die} of ennui!".format(this,this));
            this.die();
        }
        //*/
        return true;
    }
};