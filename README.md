# DUCK TAPE HERO

My 7drl submission for 2018. Once again I chose an idea that I thought was
going to be nice and simple but which turned out to be annoyingly difficult
when I sat down to implement it.

You can play it online at https://seregsarn.itch.io/duck-tape-hero .

I ended up cutting a lot of content (I mean _a lot_ of content-- over half the
items in the item list are commented out right now) in order to get everything
working by the end. There was absolutely no time for balancing or tweaking of
numbers or anything like that. As a result, I think this plays much more like
a tech demo than a game-- it's mechanically complete, and winnable and loseable,
so it qualifies as a success under 7drl rules, but it's too easy; there's way
too much bread and way too few enemies to present a real challenge, and
adjusting those numbers alone wouldn't help much, because what's really needed
is more variety and some monsters that aren't just "Dumb Melee Guy #24601".
And with all the items that got cut, you only get the barest hint of the
kind of "I have these items, let's take them all apart and make something
else with them to overcome this obstacle" gameplay that I was aiming for.

From a code review perspective: Some of this is **really** bad code. A lot of
it just got poured out of my brain at into the file at some ungodly hour of
the night without editing or refactoring or anything resembling a coherent plan.
There's so much code duplication it's embarassing, because I was running out
of time and would have taken longer to factor out the common functionality than
to just write it again elsewhere. There was a lot of impromptu writing of
stuff that rot.js didn't natively have (like my "AStar2", which is a duplicate
of ROT.Path.AStar code with a few of my own features dropped in). Next time I
decide to use rotjs, I'm gonna spend a bit of effort _ahead_ of the 7drl to work
out some of those utility functions and things ahead of time.

Special thanks go to my friend [graa](http://shoddy.work), who did the "pitfall duck" key art you
see on the title screen, and all of my friends who provide backup,
encouragement, inspiration, and just generally are awesome folks. Extra
special thanks to my girlfriend, who prepared me a 7DRL Madness Survival Kit
full of snacks and caffeinated beverages while I was pulling 21-hour days
all week, and was-- as usual-- incredibly supportive and wonderful in all ways. <3
