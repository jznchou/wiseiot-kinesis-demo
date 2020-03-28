const kinesisP = new AWS.Kinesis({
	region: 'REGION',
	accessKeyId: 'ACCESS_KEY_ID',
	secretAccessKey: 'SECRET_ACCESS_KEY'
});

var params = {
	Data: 0,
	PartitionKey: '1',
	StreamName: 'wise-demo-stream'
}
var fileNum = 0
var producerRunning = false;
var producerLoop;

function startStopProducer() {
	if (producerRunning == false) {
		producerRunning = true;
		startProducerLoop();
		console.log('Producer started...');

	} else if (producerRunning == true) {
		producerRunning = false;
		clearInterval(producerLoop);
		console.log('Producer stopped.');
	}
}

function startProducerLoop() {
	console.log('startProdLoop function started...');
	producerLoop = setInterval( () => {
		fileNum > 19 ? fileNum = 0 : 
		fetch(`/data/ecgData${fileNum}.json`)
			.then((res) => {
				return res.json();
			})
			.then((data) => {
				params['Data'] = JSON.stringify(data);
				producer();
				fileNum++;
			})
			.catch((err) => {
				console.log('error: ' + err);
			});
	}, 500);
}

function producer() {
	// params['Data'] = Math.random().toString();
	// console.log(params['Data']);
	kinesisP.putRecord(params, (err, data) => {
		if (err) throw err;
		// console.log(data);
		}
	);
}

var startStopBtnP = document.getElementById("startStopBtn");
startStopBtnP = addEventListener("click", () => {startStopProducer()})