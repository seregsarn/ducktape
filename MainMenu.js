var MainMenu = {
    menuDiv: null,
    playBtn: null,
    emojiBtn: null,
    nameBox: null,
    permittedChars: "abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ.,!1234567890",
    victoryScreen: null,
    emoji: false,
    init: function() {
        emoji = false;
        this.menuDiv = $('#mainMenu');
        this.nameBox = $('#nameInput', this.menuDiv);
        this.playBtn = $('#playBtn', this.menuDiv);
        this.emojiBtn = $('#emojiBtn', this.menuDiv);
        this.victoryScreen = $('#victoryScreen');
        //this.victoryScreen.show();
        this.nameBox.on('keypress', this.textkey.bind(this));
        this.nameBox.on('change', this.nameChange.bind(this));
        this.nameBox.on('keyup', this.nameChange.bind(this));
        this.menuDiv.on('focus', function(ev) { MainMenu.nameBox.focus(); });
        this.playBtn.on('click', this.startGame.bind(this));
        this.emojiBtn.on('click', this.emojiToggle.bind(this));
        this.updateEmoji();
        this.show();
    },
    show: function() {
        this.victoryScreen.hide();
        this.menuDiv.show();
        this.nameBox.val("");
        this.playBtn.prop('disabled', true);
        this.nameBox.focus();
    },
    hide: function() {
        this.menuDiv.hide();
    },
    textkey: function(ev) {
        //console.log("key: ", ev.key, ev.keyCode, ev.char, ev.charCode);
        // only permit cool characters in name.
        if (ev.keyCode == ROT.VK_RETURN || ev.keyCode == ROT.VK_ENTER) {
            if (this.nameBox.val().length > 0) this.playBtn.click();
            return;
        }
        if (this.permittedChars.indexOf(String.fromCharCode(ev.charCode)) == -1) {
            ev.preventDefault(); return;
        }
        var str = this.nameBox.val();
        this.nameBox.val(str.substr(0,15));
    },
    nameChange: function(ev) {
        if (this.nameBox.val().length > 0) {
            this.playBtn.prop('disabled', false);
        } else {
            this.playBtn.prop('disabled', true);
        }
    },
    startGame: function(ev) {
        Game.init(this.nameBox.val(), this.emoji);
        $('#victoryName', this.victoryScreen).html(this.nameBox.val());
        this.hide();
    },
    updateEmoji: function() {
        var me = monsters.player_dummy;
        var grapes = items.get("Grapes of Yendor");
        var bread = items.get("stale bread");
        var key = 'glyph';
        if (this.emoji) key = 'emojiGlyph';
        this.emojiBtn.empty();
        this.emojiBtn.append('<span class="symbol" style="color: white;">' + me[key] + "</span>");
        this.emojiBtn.append('<span class="symbol" style="color: purple;">' + grapes[key] + "</span>");
        this.emojiBtn.append('<span class="symbol" style="color: #F9E79F;">' + bread[key] + "</span>");
        this.emojiBtn.append('Emoji ' + (this.emoji ? "on" : "off"));
    },
    emojiToggle: function(ev) {
        this.emoji = !this.emoji;
        this.updateEmoji();
    }
};