const kinesisP = new AWS.Kinesis({
	region: 'us-east-2',
	accessKeyId: 'AKIA34GWMGJIKM52LP7C',
	secretAccessKey: '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'
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






// export default producer;