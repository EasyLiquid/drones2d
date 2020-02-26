// зависимости
const path = require('path');
const initial = require('./init');
const act = require('./action');

// импорт игровых переменных и функций
const scenes = initial.scenes;
const staticSprites = initial.staticSprites;
const init = initial.init;
const action = act.action;

// конфигурация http и ws
const http = require('http');
const WebSocket = require('ws');
const express = require('express');
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = process.env.PORT || 3000;
app.set('port', PORT);

// конфигурация парсинга
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
var userName = '';

// маршруты
app.use('/public', express.static(__dirname + '/public'));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});
app.post('/name', (req, res) => {
	userName = req.body.field_name;
	res.sendFile(path.join(__dirname, 'game.html'));
});

// запуск сервера
server.listen(PORT, () => {
    console.log('Запускаю воркер на порте ' + PORT);
});

// обработка сигналов
process.on('SIGINT', () => {
	console.log('Сигнал: SIGINT. Pid: ' + process.pid);
	server.close(() => {
		process.exit(0);
	});
});
process.on('SIGTERM', () => {
	console.log('Сигнал: SIGTERM. Pid: ' + process.pid);
	server.close(() => {
		process.exit(0);
	});
});
process.on('SIGUSR2', () => {
	console.log('Сигнал: SIGUSR2');
	server.close(() => {
		process.exit(1);
	});
});

// подключение к серверу
wss.on('connection', (ws) => {
	
	ws.id = Math.random();
	console.log('Игрок с ID ' + ws.id + ' подключился к серверу!');
	
	// обработка сообщений
	ws.on('message', (data) => {
		var object = JSON.parse(data);
		
		// инициализация сцен и игроков
		if (object.nameEvent == 'new player') init(userName, ws.id);
		
		// обработка действий
		if (object.nameEvent == 'action') action(ws, ws.id, object);
		
		// чат
		if (object.nameEvent == 'message') {
			for (var scene of scenes) {
				for (var player of scene[1]) {
					if (player.pID == ws.id) {
						object.playerName = player.name;
						scene[6].push(object);
						if (scene[6].length > 10) scene[6].splice(0, 1);
					}
				}
			}
		}
	});
	
	// анимация
	setInterval(() => {
		for (var scene of scenes) {
			for (var player of scene[1]) {
				player.moving();
			}
		}
	}, 1000);
	setInterval(() => {
		for (var scene of scenes) {
			for (var player of scene[1]) {
				player.receiveDamage();
			}
		}
	}, 1000);
	setInterval(() => {
		for (var scene of scenes) {
			for (var door of scene[2]) {
				door.opening();
				door.closing();
			}
		}
	}, 750);
	setInterval(() => {
		for (var scene of scenes) {
			for (var cutout of scene[3]) {
				cutout.on();
			}
		}
	}, 750);
	setInterval(() => {
		for (var scene of scenes) {
			for (var turret of scene[4]) {
				turret.on();
			}
		}
	}, 250);
	
	// разрыв соединения
	ws.on('close', () => {
		for (var scene of scenes) {
			for (var player of scene[1]) {
				
				if (player.pID == ws.id) {
					console.log('Игрок с ID ' + ws.id + ' отключился от сервера!');
					break;
					break;
				}
			}
		}
	});
});