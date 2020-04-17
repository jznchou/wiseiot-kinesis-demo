const kinesis = new AWS.Kinesis({
	region: 'REGION',
	accessKeyId: 'ACCESS_KEY_ID',
	secretAccessKey: 'SECRET_ACCESS_KEY'
});

var consumerRunning = false;
var record;
var shardIterator;
var consumerLoop;
var msBehindLatest;

// Initialize chart
var xcount = 0;
var layout = {
	height: 600,
	yaxis: {
		range: [0, 3500]
	}
}
var initData = [{
	y: [0],
	type: 'line'
}]

Plotly.plot('chart', initData, layout);

// Toggles consumer on/off with button click
function startStop() {

	if (consumerRunning == false) {
		consumerRunning = true;
		startConsumerLoop();
		console.log('Consumer started...');

	} else if (consumerRunning == true) {
		consumerRunning = false;
		clearInterval(consumerLoop);
		console.log('Consumer stopped.');
	}
}

// Get new Kinesis shard iterator for LATEST data
function getKinesisIterator() {
	return new Promise((resolve, reject) => {
		kinesis.getShardIterator(
		// Params
		{
			StreamName: 'wise-demo-stream',
			ShardId: 'shardId-000000000000',
			ShardIteratorType: 'LATEST'
			/*
			*	Shard Iterator Types:
			*	AT_SEQUENCE_NUMBER
			* 	AFTER_SEQUENCE_NUMBER
			*	TRIM_HORIZON
			*	LATEST
			*	AT_TIMESTAMP
			*/
		},
		// Callback, save shard iterator
		(err, data) => {
			if (err) {
				console.log(err);
				reject(err);
			} else {
				resolve(data.ShardIterator);
			}
		})
	})
}

// Get records and plot them
function getKinesisRecords() {
	console.log("getKinesisRecords function is being executed...");
	return new Promise((resolve, reject) => {
		kinesis.getRecords(
			// Params
			{ShardIterator: shardIterator},
			// Callback
			(err, data) => {
				if (err) {
					console.log(err);
					reject(err);
				} else {
					// Parse data
					dataProcessor(data);
					resolve(data.NextShardIterator);
				}
			}
		)
	})
}
	
// Get first shard iterator, and then loop getRecords for plotting
async function startConsumerLoop() {
	shardIterator = await getKinesisIterator();
	// Main loop
	consumerLoop = setInterval( 
		async function () {
		shardIterator = await getKinesisRecords();
		}
	, 200)
}

// Parse data for plotting
function dataProcessor(data) {
	let ecgValues = [];
	const decoder = new TextDecoder();

	// Loop through Records and push to ecg array to plot
	data.Records.forEach(record => {
		let dataStr = decoder.decode(record.Data);
		let dataObj = JSON.parse(dataStr);
		ecgValues.push(dataObj.ecgValue);
	});
	console.log('This is an array of ECG values: ' + ecgValues);
	extendPlot(ecgValues);

	// Update ms behind latest
	let streamToHtml = document.getElementById('msBehindLatest');
	streamToHtml.innerHTML = 'Milliseconds behind latest record: ' + data.MillisBehindLatest;
}
	
function extendPlot(dataArray) {
	let timeStamp = [];
	let amplitude = dataArray;

	// Extend chart with new data
	let plotData = {y: [amplitude]}
	Plotly.extendTraces('chart', plotData, [0]);
	xcount += amplitude.length;

	// Scrolling chart of fixed x axis length
	if (xcount > 1200) {
		Plotly.relayout('chart', {
			xaxis: {
				range: [xcount - 1200, xcount]
			}
		});
	}
}

// Start/Stop button
var startStopBtn = document.getElementById("startStopBtn");
startStopBtn = addEventListener("click", () => {startStop()})