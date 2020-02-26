const cluster = require('cluster');
const os = require('os');

// мастер
if (cluster.isMaster) {
	
	// количество ядер в процессоре
	const cpusCount = os.cpus().length;
	
	// запуск воркеров
	for (var i = 0; i < cpusCount - 1; i++) {
		const worker = cluster.fork();
	}
	
	// обработка смерти воркера
	cluster.on('exit', (worker, code) => {
		console.log('Дочерний процесс умер! Pid: ' + worker.process.pid + '. Code: ' + code);
		if (code == 1) cluster.fork();
	});
}

// воркер
if (cluster.isWorker) {
	require('./worker');
}