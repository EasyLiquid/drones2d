// управляющая оболочка
class Shell {
	constructor() {
		this.sizeTeam = 3; // количество игроков в команде
		this.widthSection = 140; // ширина секции (в пикселях)
		this.heightSection = 100; // высота секции (в пикселях)
		this.countSections = 5; // количество секций на этаже
		this.countFloors = 4; // количество этажей на сцене
	}
	
	// метод генерации позиций
	positionsGen() {
		var positions = [];
		for (var i = 0; i < this.countFloors; i++) {
			positions.push([]);
			for (var j = 0; j < this.countSections; j++) {
				positions[i].push(50*1 + 140 * j);
			}
		}
		return positions;
	}
	
	// метод распределения позиций
	randomX(floor, widthObject, positions, typeObject) {
		var positionX, section;
		
		if (typeObject == 'door') section = Math.round(Math.random() * 2 + 1*1); // 1-3
		if (typeObject == 'cutout') section = Math.floor(Math.random() * positions[floor].length); // 0-4
		
		if (typeObject == 'turret') {
			switch (floor) {
				case 0:
					section = Math.floor(Math.random() * (positions[floor].length - 1)); // 0-3
					break;
				case 1:
					section = Math.ceil(Math.random() * (positions[floor].length - 1)); // 1-4
					break;
				case 2:
					section = Math.floor(Math.random() * (positions[floor].length -  1)); // 0-3
					break;
				case 3:
					section = Math.floor(Math.random() * positions[floor].length); // 0-4
					break;
			}
		}
		
		positionX = positions[floor][section]*1 + (140 - widthObject) / 2;
		positions[floor].splice(section, 1);
		return positionX;
	}
	
	// метод привязки турелей к рубильникам
	randomBind(binds) {
		var index = Math.floor(Math.random() * binds.length);
		var bind = binds[index];
		binds.splice(index, 1);
		return bind;
	}
}

var shell = new Shell();
module.exports.shell = shell;