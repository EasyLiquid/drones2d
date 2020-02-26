const initial = require('./init');

const scenes = initial.scenes;
const staticSprites = initial.staticSprites;

function action(socket, pID, action) {
	
	// перебор сессий
	for (var scene of scenes) {
		
		var players1 = []; // предыдущее состояние
		
		// перебор игроков и команд
		for (var player of scene[1]) {
			if (player.pID == pID) {
				
				players1 = scene[1];
				
				// обработка столкновений
				function collision(drone, object) {
					
					// двери, рубильники и турели
					if (object.type == 'door' || object.type == 'cutout' || object.type == 'turret') {
						var collX, collY;
						var consoleX1 = object.x;
						var consoleY1 = object.y;
						var consoleX2 = object.x*1 + object.width*1;
						var consoleY2 = object.y*1 + object.height*1;
						
						if (object.type == 'turret' && object.state == 'on') {
							consoleY1 = object.y*1 + 50*1;
							consoleY2 = object.y*1 + 100*1;
						}
						
						var droneX1 = drone.x;
						var droneY1 = drone.y;
						var droneX2 = drone.x*1 + drone.width*1;
						var droneY2 = drone.y*1 + drone.height*1;
						
						function control() {
							if (action.attack) {
								
								if (object.type == 'door') {
									if (object.state == 'close') {
										object.startAnimation1 = true;
										return false;
									}
									if (object.state == 'open') {
										object.startAnimation2 = true;
										return false;
									}
								}
								
								if (object.type == 'cutout' && object.state == 'off') {
									object.state == 'on';
									for (var turret of scene[4]) {
										if (turret.bind == object.bind) {
											object.startAnimation = true;
											turret.state = 'on';
											turret.startAnimation = true;
											return false;
										}
									}
								}
							}
							
							if (object.type == 'turret' && object.state == 'on') {
								drone.damaged = true;
								drone.hp = drone.hp - 25;
								return false;
							}
						}
						
						if ((droneX2 >= consoleX1 && droneX1 <= consoleX2) || (droneX1 <= consoleX2 && droneX2 >= consoleX1)) collX = true;
						if ((droneY2 >= consoleY1 && droneY1 <= consoleY2) || (droneY1 <= consoleY2 && droneY2 >= consoleY1)) collY = true;
						if (collX && collY) control();
					}
					
					// флаги
					if (drone.x < 90 && drone.y < 140) {
						if (drone.team == 1 && !drone.withFlag && !scene[5][1].taken) {
							drone.withFlag = true;
							scene[5][1].taken = true;
						}
						if (drone.team == 2 && drone.withFlag && scene[5][0].taken) scene[7] = 2;
					}
					if (drone.x < 90 && drone.y > 460) {
						if (drone.team == 2 && !drone.withFlag && !scene[5][0].taken) {
							drone.withFlag = true;
							scene[5][0].taken = true;
						}
						if (drone.team == 1 && drone.withFlag && scene[5][1].taken) scene[7] = 1;
					}
					
					// крайние точки объектов
					var leftEdge1 = drone.x;
					var rightEdge1 = drone.x*1 + drone.width*1;
					var topEdge1 = drone.y;
					var bottomEdge1 = drone.y*1 + drone.height*1;
					var leftEdge2 = object.x;
					var rightEdge2 = object.x*1 + object.width*1;
					var topEdge2 = object.y;
					var bottomEdge2 = object.y*1 + object.height*1;
					
					if (object.type == 'door') {
						leftEdge2 = object.x*1 + 5*1;
						rightEdge2 = (object.x*1 + object.width*1) - 5;
					}
					
					// проверка на столкновение
					var leftColl1 = rightEdge1 >= leftEdge2 && leftEdge1 <= leftEdge2;
					var rightColl1 = leftEdge1 <= rightEdge2 && rightEdge1 >= rightEdge2;
					var topColl1 = bottomEdge1 >= topEdge2 && topEdge1 <= topEdge2;
					var bottomColl1 = topEdge1 <= bottomEdge2 && bottomEdge1 >= bottomEdge2;
					var leftColl2 = rightEdge1 >= leftEdge2;
					var rightColl2 = leftEdge1 <= rightEdge2;
					var topColl2 = bottomEdge1 >= topEdge2;
					var bottomColl2 = topEdge1 <= bottomEdge2;
					
					// блокировка движения
					if (object.type == 'platform' || object.type == 'turret') {
						if (leftColl1 && topColl2 && bottomColl2) drone.x = drone.x - 1;
						if (rightColl1 && topColl2 && bottomColl2) drone.x = drone.x*1 + 1*1;
						if (topColl1 && leftColl2 && rightColl2) drone.y = drone.y - 1;
						if (bottomColl1 && leftColl2 && rightColl2) drone.y = drone.y*1 + 1*1;
					}
					if (object.type == 'door' && object.state == 'close') {
						if (leftColl1 && topColl2 && bottomColl2) drone.x = drone.x - 1;
						if (rightColl1 && topColl2 && bottomColl2) drone.x = drone.x*1 + 1*1;
					}
				}
				collision(player, staticSprites[0]);
				collision(player, staticSprites[1]);
				collision(player, staticSprites[2]);
				collision(player, staticSprites[3]);
				collision(player, staticSprites[4]);
				collision(player, staticSprites[5]);
				collision(player, staticSprites[6]);
				collision(player, scene[2][0]);
				collision(player, scene[2][1]);
				collision(player, scene[2][2]);
				collision(player, scene[2][3]);
				collision(player, scene[3][0]);
				collision(player, scene[3][1]);
				collision(player, scene[3][2]);
				collision(player, scene[3][3]);
				collision(player, scene[4][0]);
				collision(player, scene[4][1]);
				collision(player, scene[4][2]);
				collision(player, scene[4][3]);
				
				// движение
				if (action.left && !player.damaged) {
					player.x = player.x - 1;
					player.left = true;
					player.right = false;
				}
				if (action.right && !player.damaged) {
					player.x = player.x*1 + 1*1;
					player.right = true;
					player.left = false;
				}
				if (action.down && !player.damaged) {
					player.y = player.y*1 + 1*1;
				}
				if (action.up && !player.damaged) {
					player.y = player.y - 1;
				}
				
				var players2 = scene[1]; // текущее состояние
				
				// если все дроны в команде уничтожены
				var destroyed1 = 0;
				var destroyed2 = 0;
				for (var player of scene[1]) {
					if (player.team == 1 && player.destroyed) destroyed1 = ++destroyed1;
					if (player.team == 2 && player.destroyed) destroyed2 = ++destroyed2;
				}
				if (destroyed2 == 3 && destroyed1 < 3) scene[7] = 1;
				if (destroyed1 == 3 && destroyed2 < 3) scene[7] = 2;
				
				// рассылка данных
				socket.send(JSON.stringify({
					id: pID,
					scene: scene,
					players1: players1,
					players2: players2,
					staticSprites: staticSprites
				}));
				
				players2 = players1;
			}
		}
	}
}

module.exports.action = action;