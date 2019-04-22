
console.log("Connection to DB is not complete. I believe it is saving onto the DB properly, but I am having trouble retrieving information from it");

var ASSET_MANAGER = new AssetManager();
ASSET_MANAGER.queueDownload("./black.png");
ASSET_MANAGER.downloadAll(function () {
	var canvas = document.getElementById('gameWorld');
	var ctx = canvas.getContext('2d');
	var gameEngine = new GameEngine();
	var automata = new Automata(gameEngine);
	automata = new Automata(gameEngine);
	gameEngine.addEntity(automata);
	gameEngine.board = automata;
	gameEngine.init(ctx);
	gameEngine.start();
	gameEngine.pause = 1;
	var dataToStore = [];
			

	// var socket = io.connect("http://24.16.255.56:8888");
	// window.onload = function () {
	// 	socket.on("load", function (data) {
	// 		console.log(data);
	// 		dataToStore = data;

	// 	});
	  
	// 	socket.on("connect", function () {
	// 		console.log("Socket connected.")
	// 	});
	// 	socket.on("disconnect", function () {
	// 		console.log("Socket disconnected.")
	// 	});
	// 	socket.on("reconnect", function () {
	// 		console.log("Socket reconnected.")
	// 	});
	// };
	window.onclick = function(e) {
		if (!event.target.matches('.dropbtn')) {
			var dropdowns = document.getElementsByClassName("dropdown-content");
			var i;
			for (i = 0; i < dropdowns.length; i++) {
				var openDropdown = dropdowns[i];
				if (openDropdown.classList.contains('show')) {
					openDropdown.classList.remove('show');
				}
			}
		} if(e.target.matches('.reset')) {
			initAll()
			document.getElementById("start").disabled = false;
			document.getElementById("pause").disabled = true;
		} else if(e.target.matches('.start')) {
			gameEngine.pause = 0;
			document.getElementById("start").disabled = true;
			document.getElementById("pause").disabled = false;
		} else if(e.target.matches('.pause')) {
			gameEngine.pause === 0? gameEngine.pause = 1 : gameEngine.pause = 0; 
		} else if(e.target.matches('.rules')) {
			var e = document.getElementById("rules");
			setRule(e.options[e.selectedIndex].value);
		} else if(e.target.matches('.starter')) {
			var e = document.getElementById("starter");
			gameEngine.nextSetUp = e.options[e.selectedIndex].value;;	
		} else if(e.target.matches('.slider')) {
			gameEngine.speed = document.getElementById("speed").value;		
		} else if(e.target.matches('.size')) {
			var e = document.getElementById("size");
			gameEngine.nextDimension = e.options[e.selectedIndex].value;
		// } else if(e.target.matches('.save')) {
		// 	console.log("save");
		// 	// text.innerHTML = "Saved."
		// 	dataToStore = [];
		// 	dataToStore.push(getSimpleBoard());
		// 	dataToStore.push(gameEngine.aliveCount)
		// 	dataToStore.push(gameEngine.cycleNum)
		// 	dataToStore.push(gameEngine.dimension);
		// 	socket.emit("save", { 
		// 		studentname: "Eviatar Goldschmidt", 
		// 		statename: "saved", 
		// 		data: dataToStore
		// 	});
		// } else if(e.target.matches('.load')) {
		// 	console.log("load");
		// 	// text.innerHTML = "Load."
		// 	socket.emit("load", { 
		// 		studentname: "Eviatar Goldschmidt", 
		// 		statename: "Load"
		// 	});
		// 	SetFromSimpleBoard();
		// 	document.getElementById("pause").disabled = false;
		}
	}

	function getSimpleBoard() {
		var dim = automata.dimension;
		var brd = []
		for(var i = 0; i < dim; i++) {
			brd.push([]);
			for(var j = 0; j < dim; j++) {
				brd[i].push(automata.board[i][j].alive);
			}
		}
		return brd;
	}
	function SetFromSimpleBoard() {
		var brd = dataToStore[0];
		var dim = dataToStore[3];
		gameEngine.nextDimension = dim;
		initAll()
		for(var i = 0; i < dim; i++) {
			for(var j = 0; j < dim; j++) {
				automata.board[i][j].alive = brd[i][j];
			}
		}
		console.log( dataToStore[1]);
		
		gameEngine.aliveCount = dataToStore[1];
		gameEngine.cycleNum = dataToStore[2];
	}

	function initAll() {
		automata.removeFromWorld = true;
		gameEngine.pause = 1;
		gameEngine.cycleNum = 0;
		gameEngine.aliveCount = 0;
		gameEngine.rule = gameEngine.nextRule;
		gameEngine.setUp = gameEngine.nextSetUp;
		gameEngine.dimension = gameEngine.nextDimension;
		automata = new Automata(gameEngine);
		gameEngine.addEntity(automata);
		gameEngine.board = automata;
		gameEngine.init(ctx);
		gameEngine.start();
	}
	function setRule(rule) {
		if(rule === "CGOL")	gameEngine.nextRule = GF_18("000100000001100000")
		else if(rule === "HighLife")	gameEngine.nextRule = GF_18("000100100001100000")
		else if(rule === "2x2")	gameEngine.nextRule = GF_18("000100100011001000")
		else	gameEngine.nextRule = GF_18("010101010010101010")
	
	}
});

function Automata(game) {
	this.game = game;
	this.dimension = this.game.dimension;
	this.board = [];
	this.elapseTime = 0;
	// this.updateThreshHold = .1;


	// "random", "center", "dead", "alive", "glider", "blinker", "toad", "LWSS", "period-15"
	this.initialConfig = this.game.setUp;
	// "random", "alive", "dead"
	var initStateType = "dead";

	// initial configuration to set cell's canvas initially
	
	switch (this.initialConfig) {
		case "Random":
			initStateType = "Random";
			break;
		case "alive":
			initStateType = "alive";
			break;
		default:
			initStateType = "dead";
	}

	// Initiate board and all cells for the simulation in the set configuation type.
	for (var i = 0; i < this.dimension; i++) {
		this.board.push([]);
		for (var j = 0; j < this.dimension; j++) {
			this.board[i].push(new Cell(game,i,j,initStateType));
		}
	}

	// THe middle point for the GameBoard
	var middle = Math.floor(this.game.dimension / 2);
	switch (this.initialConfig) {
		case "Center":
			this.board[middle][middle].alive = true;
			this.game.aliveCount = 1;
			break;
		case "Cube":
			this.board[middle][middle].alive = true;
			this.board[middle][middle+ 1].alive = true;
			this.board[middle + 1][middle].alive = true;
			this.board[middle + 1][middle + 1].alive = true;
			this.game.aliveCount = 4;
			break;
		case "Glider":
			this.board[middle][middle - 1].alive = true;
			this.board[middle + 1][middle].alive = true;
			this.board[middle - 1][middle + 1].alive = true;
			this.board[middle][middle + 1].alive = true;
			this.board[middle + 1][middle + 1].alive = true;
			this.game.aliveCount = 5;
			break;
		case "Blinker":
			this.board[middle -1][middle].alive = true;
			this.board[middle][middle].alive = true;
			this.board[middle + 1][middle].alive = true;
			this.game.aliveCount = 3;
			break;
		case "Toad":
			this.board[middle][middle].alive = true;
			this.board[middle + 1][middle].alive = true;
			this.board[middle + 2][middle].alive = true;
			this.board[middle][middle + 1].alive = true;
			this.board[middle + 1][middle + 1].alive = true;
			this.board[middle - 1][middle + 1].alive = true;
			this.game.aliveCount = 6;
			break;
		case "LWSS":
			this.board[middle - 2][middle - 1].alive = true;
			this.board[middle + 1][middle - 1].alive = true;
			this.board[middle + 2][middle].alive = true;
			this.board[middle - 2][middle + 1].alive = true;
			this.board[middle + 2][middle + 1].alive = true;
			this.board[middle -1 ][middle + 2].alive = true;
			this.board[middle][middle + 2].alive = true;
			this.board[middle + 1][middle + 2].alive = true;
			this.board[middle + 2][middle + 2].alive = true;
			this.game.aliveCount = 9;
			break;
		case "SwitchEngine":
			var r = "010100100000010010000111"
			var c = 0;
			for(var i = 0; i < 4; i++) {
				for(var j = 0; j < 6; j++) {
					this.board[middle - 3 + j][middle - 2 + i].alive = (r.charAt(c) === "1");
					c++;
				}
			}			
			this.game.aliveCount = 8;
			break;
		case  "Revolver":
			var r = "1000000000000111100001000111000101010010000010000001010000101000000100000100101010001110001000011110000000000001";
			var c = 0;
			for(var i = 0; i < 8; i++) {
				for(var j = 0; j < 14; j++) {
					this.board[middle - 7 + j][middle - 4 + i].alive = (r.charAt(c) === "1");
					c++;
				}
			}
			this.game.aliveCount = 32
			break;
		case "Pufferfish":
			var r = "000100000001000001110000011100011001000100110000111000111000000000000000000000010000010000001001000100100100000101000001110000101000011000000101000000000101000101000000010000010000";
			var c = 0;
			for(var i = 0; i < 12; i++) {
				for(var j = 0; j < 15; j++) {
					this.board[middle - 7 + j][middle*8/5 - 6 + i].alive = (r.charAt(c) === "1");
					c++;
				}
			}
			this.game.aliveCount = 45;
			break;
		case "p106-gun":
			var r = "100100000000010010001011100010001011000010100000";
			var c = 0;
			for(var i = 0; i < 6; i++) {
				for(var j = 0; j < 8; j++) {
					this.board[middle - 4 + j][middle - 3 + i].alive = (r.charAt(c) === "1");
					c++;
				}
			}
			this.game.aliveCount = 14;
			break;
		case "period-15":
			for(var i = middle - 5; i < middle + 5; i++) {
				if(i !== (middle - 3) && i !== (middle + 2)) {
					this.board[i][middle].alive = true;
					this.game.aliveCount ++;
				} else {
					this.board[i][middle + 1].alive = true;
					this.board[i][middle - 1].alive = true;
					this.game.aliveCount += 2;
				}
			}
			break;
		case "Toad-Flip":
			var r = "010000000000000010010000000000000010101000000000000101010000000000000010010000001000000010010000001100000010010000001100000010101000000100000101010000000000000010010000000000000010"
			var c = 0;
			for(var i = 0; i < 10; i++) {
				for(var j = 0; j < 18; j++) {
					this.board[middle - 9 + j][middle - 5 + i].alive = (r.charAt(c) === "1");
					c++;
				}
			}
			this.game.aliveCount = 30;
			break;
		 case "23334M":
			var r = "001001000010000001000001010010010101000"
			var c = 0;
			for(var i = 0; i < 8; i++) {
				for(var j = 0; j < 5; j++) {
					this.board[middle - 2 + j][middle - 4 + i].alive = (r.charAt(c) === "1");
					c++;
				}
			}
			this.game.aliveCount = 10;
			break;
		case "17c45reaction":
			var r = "00000000000000011000000000000011100000000000011010000000000000110000000000000001"
			var c = 0;
			for(var i = 0; i < 5; i++) {
				for(var j = 0; j < 16; j++) {
					this.board[middle - 8 + j][middle - 2 + i].alive = (r.charAt(c) === "1");
					c++;
				}
			}
			this.game.aliveCount = 11;
			break;
	}
	Entity.call(this, game, 0, 0);
};

Automata.prototype = new Entity();
Automata.prototype.constructor = Automata;

Automata.prototype.update = function () {
	this.elapseTime += this.game.clockTick;
	
	if(this.elapseTime > 5/this.game.speed && this.game.pause === 0) {
		// l++;
		for (var i = 0; i < this.dimension; i++) {
			for (var j = 0; j < this.dimension; j++) {
				this.board[i][j].update();
			}
		}

		// Update cells to thier new state.
		for (var i = 0; i < this.dimension; i++) {
			for (var j = 0; j < this.dimension; j++) {
				this.board[i][j].updateState();
			}
		}
		this.game.cycleNum++;
		this.elapseTime -= 5/this.game.speed;
	}
};

Automata.prototype.draw = function (ctx) {
	var size = Math.floor(this.game.ctx.canvas.height / this.dimension);
	for (var i = 0; i < this.dimension; i++) {
		for (var j = 0; j < this.dimension; j++) {
			var cell = this.board[i][j];

			cell.alive? ctx.fillStyle = "white" : ctx.fillStyle = "black";
			cell.alive? ctx.fillRect( (i * size + 1), (j * size + 1), (size - 2), (size - 2)) : ctx.fillRect( (i * size), (j * size), (size), (size)); 
		}
	}
	ctx.fillStyle = "white";
	ctx.font = "20px terminal";
	ctx.fillText("Live Cells #: ",this.dimension * (size + 1),50);
	ctx.fillText(this.game.aliveCount,this.dimension * (size + 1) + 120,50);
	ctx.fillText("Cycle #: ",this.dimension * (size + 1),75);
	ctx.fillText(this.game.cycleNum,this.dimension * (size + 1) + 120,75);
};


function Cell(game,x,y,type) {
	this.x = x;
	this.y = y;
	this.game = game;
	this.type = type;
	if(type === "Random")		this.alive = (Math.random() > 0.5);
	else if(type == "alive")	this.alive = true;
	else this.alive = false;
	if(this.alive) {
		this.game.aliveCount ++;
	}
	this.nextState = this.alive;
}

Cell.prototype = new Entity();
Cell.prototype.constructor = Cell;

Cell.prototype.update = function () {
	var neighbours = 0;
	var bitIndex = 8
	for(var i = this.x - 1; i <= this.x + 1; i++) {
		for(var j = this.y - 1;j <= this.y + 1; j++ ) {
			if(i  >= 0 && i < this.game.board.dimension && j >= 0 && j < this.game.board.dimension) {
				if(this.game.board.board[i][j].alive) neighbours += Math.pow(2, bitIndex);
				bitIndex--;
			}
		}
	}
	this.nextState = (this.game.rule.charAt(neighbours) === '1');
}

// CLeanly updates the cell to its new state.
Cell.prototype.updateState = function() {
	if(this.alive !== this.nextState) {
		if(this.alive)	this.game.aliveCount --;
		else this.game.aliveCount++; 
	}
	this.alive = this.nextState;
	 
}

function GF_18(rule){
	this.count;
	this.rule = rule;
	var newRule = [];
	for(var i = 0; i < 512; i++) {
		count = 0;
		for(var j = 0; j < 9; j++) {
			if((Math.floor(i/(Math.pow(2, j)))%2) === 1) {
				count++;
			}
		}
		if(Math.floor((i/Math.pow(2, 4))%2) === 1) {
			var temp = rule[count + 8];
			newRule.push(temp);
		} else {
			var temp = rule[count];
			newRule.push(temp);
		}
	}
	return newRule.join('');
	}
