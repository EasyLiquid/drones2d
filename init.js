const controlShell = require('./shell');
const shell = controlShell.shell;

var scenes = []; // сцены

// классы игровых объектов
class Patform {
	constructor(x, y, width, height) {
		this.type = 'platform';
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
}

class Flag {
	constructor(x, y) {
		this.type = 'flag';
		this.x = x;
		this.y = y;
		this.width = 10;
		this.height = 10;
		this.taken = false;
	}
}

class Door {
	constructor(x, y) {
		this.type = 'door';
		this.x = x;
		this.y = y;
		this.width = 20;
		this.height = 100;
		this.state = 'close';
		this.animationFrame1 = 0;
		this.animationFrame2 = 0;
		this.startAnimation1 = false;
		this.startAnimation2 = false;
	}
	
	opening() {
		if (this.startAnimation1) {
			this.animationFrame1 = ++this.animationFrame1;
			if (this.animationFrame1 > 10) {
				this.animationFrame1 = 10;
				this.animationFrame2 = 0;
				this.startAnimation1 = false;
				this.state = 'open';
			}
		}
	}
	
	closing() {
		if (this.startAnimation2) {
			this.animationFrame2 = ++this.animationFrame2;
			if (this.animationFrame2 > 10) {
				this.animationFrame2 = 10;
				this.animationFrame1 = 0;
				this.startAnimation2 = false;
				this.state = 'close';
			}
		}
	}
}

class Turret {
	constructor(x, y, bind) {
		this.type = 'turret';
		this.x = x;
		this.y = y;
		this.width = 50;
		this.height = 55;
		this.bind = bind;
		this.state = 'off';
		this.animationFrame = 0;
		this.startAnimation = false;
	}
	
	on() {
		if (this.startAnimation) {
			this.animationFrame = ++this.animationFrame;
			if (this.animationFrame > 7) {
				this.animationFrame = 0;
				this.startAnimation = false;
				this.state = 'off';
			}
		}
	}
}

class Cutout {
	constructor(x, y, bind) {
		this.type = 'cutout';
		this.x = x;
		this.y = y;
		this.width = 50;
		this.height = 50;
		this.bind = bind;
		this.state = 'off';
		this.animationFrame = 0;
		this.startAnimation = false;
	}
	
	on() {
		if (this.startAnimation) {
			this.animationFrame = ++this.animationFrame;
			if (this.animationFrame > 7) {
				this.animationFrame = 0;
				this.startAnimation = false;
				this.state = 'off';
			}
		}
	}
}

class Drone {
	constructor(pID, sID, name) {
		this.x = 0;
		this.y = 0;
		this.width = 40;
		this.height = 40;
		this.pID = pID;
		this.sID = sID;
		this.name = name;
		this.team = 0;
		this.hp = 100;
		this.stand = true;
		this.attack = false;
		this.damaged = false;
		this.withFlag = false;
		this.destroyed = false;
		this.right = true;
		this.left = false;
		this.animationFrame1 = 0;
		this.animationFrame2 = 0;
	}
	
	moving() {
		this.animationFrame1 = ++this.animationFrame1;
		if (this.animationFrame1 > 15) this.animationFrame1 = 0;
	}
	
	receiveDamage() {
		if (this.damaged) {
			if (this.withFlag) {
				this.withFlag = false;
				for (var scene of scenes) {
					for (var player of scene[1]) {
						if (player.pID == this.pID && player.team == 1) {
							scene[5][1].taken = false;
							break;
							break;
						}
						if (player.pID == this.pID && player.team == 2) {
							scene[5][0].taken = false;
							break;
							break;
						}
					}
				}
			}
			this.animationFrame2 = ++this.animationFrame2;
			if (this.animationFrame2 > 9) {
				this.animationFrame2 = 0;
				this.damaged = false;
			}
		}
		if (this.hp <= 0) {
			this.destroyed = true;
		}
	}
}

// инициализация игровых объектов
var staticSprites = [
	new Patform(0, 0, 50, 600),
	new Patform(750, 0, 50, 600),
	new Patform(50, 560, 700, 40),
	new Patform(50, 420, 560, 40),
	new Patform(190, 280, 560, 40),
	new Patform(50, 140, 560, 40),
	new Patform(50, 0, 700, 40)
];

function init(name, pID) {
	
	// подсчёт общего количества игроков
	if (scenes.length > 0) {
		var players = 0; 
		for (var i = 0; i < scenes.length; i++) {
			players = players*1 + scenes[i][1].length*1;
		}
	}
	
	// начальные точки модулей (модуль - отрезок длиной 140 px)
	var positions = shell.positionsGen();
	
	// ключи привязки турелей к рубильникам
	var binds1 = [1, 2, 3, 4];
	var binds2 = [1, 2, 3, 4];
	
	// инициализация новой сцены
	if (scenes.length == 0 || players / scenes.length == shell.sizeTeam * 2) {
		
		scenes.push([
			Math.random(), // ID
			[], // игроки
			[], // двери
			[], // рубильники
			[], // турели
			[], // флаги
			[], // сообщения
			0 // номер команды-победителя
		]);
		scenes[scenes.length - 1][2].push(new Door(shell.randomX(0, 20, positions, 'door'), 460));
		scenes[scenes.length - 1][2].push(new Door(shell.randomX(1, 20, positions, 'door'), 320));
		scenes[scenes.length - 1][2].push(new Door(shell.randomX(2, 20, positions, 'door'), 180));
		scenes[scenes.length - 1][2].push(new Door(shell.randomX(3, 20, positions, 'door'), 40));
		scenes[scenes.length - 1][3].push(new Cutout(shell.randomX(0, 50, positions, 'cutout'), 485, shell.randomBind(binds1)));
		scenes[scenes.length - 1][3].push(new Cutout(shell.randomX(1, 50, positions, 'cutout'), 345, shell.randomBind(binds1)));
		scenes[scenes.length - 1][3].push(new Cutout(shell.randomX(2, 50, positions, 'cutout'), 205, shell.randomBind(binds1)));
		scenes[scenes.length - 1][3].push(new Cutout(shell.randomX(3, 50, positions, 'cutout'), 65, shell.randomBind(binds1)));
		scenes[scenes.length - 1][4].push(new Turret(shell.randomX(0, 50, positions, 'turret'), 460, shell.randomBind(binds2)));
		scenes[scenes.length - 1][4].push(new Turret(shell.randomX(1, 50, positions, 'turret'), 320, shell.randomBind(binds2)));
		scenes[scenes.length - 1][4].push(new Turret(shell.randomX(2, 50, positions, 'turret'), 180, shell.randomBind(binds2)));
		scenes[scenes.length - 1][4].push(new Turret(shell.randomX(3, 50, positions, 'turret'), 40, shell.randomBind(binds2)));
		scenes[scenes.length - 1][5].push(new Flag(75, 505));
		scenes[scenes.length - 1][5].push(new Flag(75, 85));
		console.log('Новая сцена: ' + scenes[scenes.length - 1][0]);
	}
	
	// инициализация нового игрока
	var player = new Drone(pID, 0, name);
	
	for (var scene of scenes) {
		if (scene[1].length < 3) {
			scene[1].push(player);
			player.name = name;
			player.sID = scene[0];
			player.team = 1;
			player.x = Math.round(Math.random() * 25 + 50*1);
			player.y = Math.round(Math.random() * 60 + 460*1);
			break;
		}
		if (scene[1].length >= 3 && scene[1].length < 6) {
			scene[1].push(player);
			player.name = name;
			player.sID = scene[0];
			player.team = 2;
			player.x = Math.round(Math.random() * 25 + 50*1);
			player.y = Math.round(Math.random() * 60 + 40*1);
			break;
		}
	}
	
	console.log('Новый игрок: ' + player.pID);
}

module.exports.scenes = scenes;
module.exports.staticSprites = staticSprites;
module.exports.init = init;