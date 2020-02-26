'use strict';

// const socket = new WebSocket('ws://localhost:3000');
const socket = new WebSocket('wss://drones2d.herokuapp.com');

var newPlayer = {
	nameEvent: 'new player'
}
var action = {
	nameEvent: 'action',
	up: false,
	down: false,
	left: false,
	right: false,
	attack: false
}
var message = {
	nameEvent: 'message',
	playerName: '',
	textMessage: ''
}

function sendMessage() {
	
	if (document.getElementById('field_message').value != '') {
		message.textMessage = document.getElementById('field_message').value;
		socket.send(JSON.stringify(message));
		document.getElementById('field_message').value = '';
		message.textMessage = '';
		return false;
	}
	
	if (document.getElementById('field_message').value == '') {
		alert('Введите текст сообщения!');
		return false;
	}
}

document.addEventListener('keydown', function(event) {
	switch (event.keyCode) {
		case 65: // A
			action.left = true;
			break;
		case 87: // W
			action.up = true;
			break;
		case 68: // D
			action.right = true;
			break;
		case 83: // S
			action.down = true;
			break;
		case 32: // Space
			action.attack = true;
			break;
	}
});

document.addEventListener('keyup', function(event) {
	switch (event.keyCode) {
		case 65: // A
			action.left = false;
			break;
		case 87: // W
			action.up = false;
			break;
		case 68: // D
			action.right = false;
			break;
		case 83: // S
			action.down = false;
			break;
		case 32: // Space
			action.attack = false;
			break;
	}
});

var canvas = document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;

var context = canvas.getContext('2d');

var wall = new Image();
var platform1 = new Image();
var platform2 = new Image();
var flag1 = new Image();
var flag2 = new Image();
var drone3 = new Image();
var drone4 = new Image();
wall.src = 'public/sprites/platform/wall.png';
platform1.src = 'public/sprites/platform/platform1.png';
platform2.src = 'public/sprites/platform/platform2.png';
flag1.src = 'public/sprites/flag/flag1.png';
flag2.src = 'public/sprites/flag/flag2.png';

var drone1 = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(),
	new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
var drone2 = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(),
	new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
var drone3 = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
var drone4 = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
var doorOpening = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(),
	new Image(), new Image(), new Image()];
var doorClosing = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(),
	new Image(), new Image(), new Image()];
var turretEnable = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];
var cutoutEnable = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];

function initFrames(arrayImage, pathImage, countFrames) {
	for (var f = 0; f < countFrames; f++) {
		arrayImage[f].src = 'public/sprites/' + pathImage + (f*1 + 1*1) + '.png';
	}
}
initFrames(drone1, 'drone/right_moving', 16);
initFrames(drone2, 'drone/left_moving', 16);
initFrames(drone3, 'drone/right_damaged', 10);
initFrames(drone4, 'drone/left_damaged', 10);
initFrames(doorOpening, 'door/door_opening', 11);
initFrames(doorClosing, 'door/door_closing', 11);
initFrames(turretEnable, 'turret/tesla_enable', 8);
initFrames(cutoutEnable, 'cutout/cutout_enable', 8);

var data = {};
var id;
var scene = [];
var players1 = [];
var players2 = [];
var staticSprites = [];
var lastTime;
var currentTime;
var ping;

socket.onopen = function(event) {
	socket.send(JSON.stringify(newPlayer));
	
	setInterval(function() {
		socket.send(JSON.stringify(action));
		lastTime = new Date().getTime();
	}, 1000 / 60);
}

socket.onmessage = function(event) {
	data = JSON.parse(event.data);
	
	id = data.id;
	scene = data.scene;
	players1 = data.players1;
	players2 = data.players2;
	staticSprites = data.staticSprites;
	
	if (scene[7] == 1) {
		document.getElementById('title1').hidden = false;
		document.getElementById('canvas').hidden = true;
		document.getElementById('console').hidden = true;
		document.getElementById('chat').hidden = true;
	}
	
	if (scene[7] == 2) {
		document.getElementById('title2').hidden = false;
		document.getElementById('canvas').hidden = true;
		document.getElementById('console').hidden = true;
		document.getElementById('chat').hidden = true;
	}
	
	currentTime = new Date().getTime();
	ping = (currentTime - lastTime);
};

socket.onerror = function(error) {
	alert('Ошибка подключения к серверу!');
}

setInterval(function() {
	
	document.getElementById('messages').innerHTML = '';
	
	if (scene[6].length > 0) {
		for (var data of scene[6]) {
			document.getElementById('messages').innerHTML = document.getElementById('messages').innerHTML + '<br>' + data.playerName + ': ' + data.textMessage;
		}
	}
	
	context.clearRect(0, 0, 800, 600);
	
	context.drawImage(wall, staticSprites[0].x, staticSprites[0].y);
	context.drawImage(wall, staticSprites[1].x, staticSprites[1].y);
	context.drawImage(platform1, staticSprites[2].x, staticSprites[2].y);
	context.drawImage(platform2, staticSprites[3].x, staticSprites[3].y);
	context.drawImage(platform2, staticSprites[4].x, staticSprites[4].y);
	context.drawImage(platform2, staticSprites[5].x, staticSprites[5].y);
	context.drawImage(platform1, staticSprites[6].x, staticSprites[6].y);
	
	for (var i = 0; i <= 3; i++) {
		if (scene[2][i].startAnimation1 || scene[2][i].state == 'close') context.drawImage(doorOpening[scene[2][i].animationFrame1], scene[2][i].x, scene[2][i].y);
		if (scene[2][i].startAnimation2 || scene[2][i].state == 'open') context.drawImage(doorClosing[scene[2][i].animationFrame2], scene[2][i].x, scene[2][i].y);
		if (scene[3][i].startAnimation || scene[3][i].state == 'off') context.drawImage(cutoutEnable[scene[3][i].animationFrame], scene[3][i].x, scene[3][i].y);
		if (scene[4][i].startAnimation || scene[4][i].state == 'off') context.drawImage(turretEnable[scene[4][i].animationFrame], scene[4][i].x, scene[4][i].y);
	}
	
	if (!scene[5][0].taken) context.drawImage(flag1, scene[5][0].x, scene[5][0].y);
	if (!scene[5][1].taken) context.drawImage(flag2, scene[5][1].x, scene[5][1].y);
	
	for (var player1 of players1) {
		if (player1.withFlag) {
			if (player1.team == 1) context.drawImage(flag2, player1.x*1 + 51*1, player1.y - 10);
			if (player1.team == 2) context.drawImage(flag1, player1.x*1 + 51*1, player1.y - 10);
		}
	}
	
	for (var player1 of players1) {
		for (var player2 of players2) {
			if (player1.pID == player2.pID) {
				
				if (!player1.destroyed) {
					
					player1.x = player1.x*1 + (player2.x - player1.x) * (1 / 17);
					player1.y = player1.y*1 + (player2.y - player1.y) * (1 / 17);
					
					if (player1.right) {
						if (!player1.damaged) context.drawImage(drone1[player1.animationFrame1], player1.x, player1.y);
						if (player1.damaged) context.drawImage(drone3[player1.animationFrame2], player1.x, player1.y);
					}
					
					if (player1.left) {
						if (!player1.damaged) context.drawImage(drone2[player1.animationFrame1], player1.x, player1.y);
						if (player1.damaged) context.drawImage(drone4[player1.animationFrame2], player1.x, player1.y);
					}
					
					if (player1.team == 1) context.fillStyle = "blue";
					if (player1.team == 2) context.fillStyle = "red";
					context.fillText(player1.name, player1.x*1 + 10*1, player1.y - 10);
					
					context.beginPath();
					context.rect(player1.x - 5, player1.y - 5, 0.5 * player1.hp, 5);
					context.closePath();
					context.strokeStyle = "black";
					context.fillStyle = "green";
					context.fill();
					context.stroke();
				}
			}
		}
	}
}, 1000 / 60);

setInterval(function() {
	document.getElementById('ping').innerHTML = 'ping: ' + ping + ' ms';
}, 1000);