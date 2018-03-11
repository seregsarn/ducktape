var Inventory = {
	player: null,
	dialog: null,
	itemList: null,
	left: null,
	right: null,
	useBtn: null,
	dismantleBtn: null,
	equipBtn: null,
	// state
	isOpen: false,
	selection: null,
	combine1: null,
	combine2: null,
	reselectStuff: function() {
		var selected = null;
		if (this.selection != null) {
			selected = this.player.inventory[this.selection];
		}
		$('li', this.itemList).removeClass('selected');
		if (this.selection != null) $($('li', this.itemList).get(this.selection)).addClass('selected');
		if (selected) {
			if (selected.type.weapon) this.equipBtn.removeClass('disabled');
				else this.equipBtn.addClass('disabled');
			if (selected.type.use) this.useBtn.removeClass('disabled');
				else this.useBtn.addClass('disabled');
			if (selected.type.recipe && selected.type.name != 'water bucket') this.dismantleBtn.removeClass('disabled');
				else this.dismantleBtn.addClass('disabled');
		}
	},
	updateList: function() {
		this.itemList.empty();
//console.log(this.player.inventory);
		this.player.inventory.forEach(function(elt) {
//console.log("item:", elt);
			//<li><img src="assets/rope-coil.png">rope test</li>
			var item = $(document.createElement('li'));
			item.html('<img src="assets/'+ elt.type.icon +'.png">' + '%a'.format(elt));
//console.log("item:", item);
			$(this.itemList).append(item);
		});
		this.reselectStuff();
	},
	keyDown: function(ev) {
		var inst = this;
		if (!this.isOpen) return;
		if (ev.keyCode == ROT.VK_UP || ev.keyCode == ROT.VK_W || ev.keyCode == ROT.VK_NUMPAD8) {
			// move selection up
			if (this.player.inventory.length < 1) return;
			if (this.selection == null) this.selection = this.player.inventory.length;
			this.selection -= 1;
			if (this.selection >= this.player.inventory.length) this.selection = this.player.inventory.length - 1;
			if (this.selection < 0) this.selection = 0;
//console.log('oh ', this.selection);
			this.reselectStuff();
		} else if (ev.keyCode == ROT.VK_DOWN || ev.keyCode == ROT.VK_S || ev.keyCode == ROT.VK_NUMPAD2) {
			// move selection down
			if (this.player.inventory.length < 1) return;
			if (this.selection == null) this.selection = -1;
			this.selection += 1;
			if (this.selection >= this.player.inventory.length) this.selection = this.player.inventory.length - 1;
			if (this.selection < 0) this.selection = 0;
//console.log('oh ', this.selection);
			this.reselectStuff();
		} else if (ev.keyCode == ROT.VK_ENTER || ev.keyCode == ROT.VK_RETURN) {
			if (this.selection == null) return;
			// use item
			var itm = this.player.inventory[this.selection];
			if (itm.type.use !== undefined) {
				if (itm.type.use == 'direction') {
					this.player.prompt({
						message: "In what direction?",
						type: 'dir'
					}).then(function(dir) {
						this.player.commands.push({ type: 'use', item: itm, direction: dir });
					}.bind(this));
				} else if (itm.type.use == 'target') {
					this.player.prompt({
						message: "Please choose a target.",
						type: 'target',
						range: itm.type.range
					}).then(function(tgt) {
						this.player.commands.push({ type: 'use', item: itm, target: tgt });
					}.bind(this));
				} else if (itm.type.use == "instant") {
					this.player.commands.push({ type: 'use', item: itm });
				}
			}
			this.close();
		} else if (ev.keyCode == ROT.VK_C) {
			// combine item
			if (this.selection == null) return;
			if (this.combine1 == null) {
				this.combine1 = this.player.inventory[this.selection];
				this.left.html('<img src="assets/'+ this.combine1.type.icon +'.png">')
			} else if (this.combine2 == null) {
				var result = null;
				if (this.player.inventory[this.selection].id != this.combine1.id) {
					this.combine2 = this.player.inventory[this.selection];
					this.right.html('<img src="assets/'+ this.combine2.type.icon +'.png">')
					result = items.combine(this.combine1, this.combine2);
					if (result !== null) {
						var createdItem = new Item(result);
						ItemPopup("You created: ",createdItem);
						this.player.letGo(this.combine1);
						this.player.letGo(this.combine2);
						this.player.inventory.push(createdItem);
						this.selection = this.player.inventory.indexOf(createdItem);
					} else {
						// todo: make this look better.
						this.left.addClass('error');
						this.right.addClass('error');
					}
					this.combine1 = this.combine2 = null;
					$('img', this.left).fadeOut({ duration: 1000, done: function() { this.remove(); $('#leftTape,#rightTape').removeClass('error'); }});
					$('img', this.right).fadeOut({ duration: 1000, done: function() { this.remove(); $('#leftTape,#rightTape').removeClass('error');  }});
					this.updateList();
				}
			}
		} else if (ev.keyCode == ROT.VK_X) {
			// dismantle item
			if (this.selection == null) return;
			var itm = this.player.inventory[this.selection];
			if (itm.type.name == 'water bucket') return;
			if (itm.type.recipe !== undefined) {
				this.player.letGo(itm);
//console.log("TEST: dismantle ", itm.type);
				var ary = [];
				itm.type.recipe.forEach(function (name) {
					var part = new Item(name);
					this.player.inventory.push(part);
					ary.push(part);
				}.bind(this));
				TwoItemPopup("You got: ", ary[0], ary[1]);
			}
			this.updateList();
		} else if (ev.keyCode == ROT.VK_E) {
			// TODO: equip item
			if (this.selection == null) return;
			var itm = this.player.inventory[this.selection];
			if (itm == this.player.armor || itm == this.player.weapon) {
				//Message.log("Your %s is already equipped.".format(itm.type.name));
				return;
			}
			if (itm.type.armor) {
				Message.log("You equip %the.".format(itm));
				this.player.armor = itm;
			} else if (itm.type.weapon) {
				Message.log("You equip %the.".format(itm));
				this.player.weapon = itm;
			}
			this.updateList();
		} else if (ev.keyCode == ROT.VK_ESCAPE || ev.keyCode == ROT.VK_I) { // cancel
			this.close();
		}
		Game.render();
	},
	init: function(me) {
		this.dialog = $('#inventoryWindow');
		this.itemList = $('#itemList');
		this.left = $('#leftTape');
		this.right = $('#rightTape');
		this.dismantleBtn = $('#dismantleBtn');
		this.useBtn = $('#useBtn');
		this.equipBtn = $('#equipBtn');
		this.player = me;
		this.dialog.hide();
		window.addEventListener('keydown',this.keyDown.bind(this));
	},
	open: function() {
		Game.engine.lock();
		this.isOpen = true;
		this.dialog.show();
		this.selection = null;
		this.updateList();
		this.reselectStuff();
	},
	close: function() {
		this.dialog.hide();
		this.isOpen = false;
		Game.engine.unlock();
	}
};