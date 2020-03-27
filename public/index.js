const kinesis = new AWS.Kinesis({
	region: 'us-east-2',
	accessKeyId: 'AKIA34GWMGJIKM52LP7C',
	secretAccessKey: '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'
});

var consumerRunning = false;
var record;
var shardIterator;
var consumerLoop;
var msBehindLatest;

// Initialize chart
var xcount = 0;
Plotly.plot('chart', [{
	y: [0],
	type: 'line'
}]);

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
	var plotData = {y: [amplitude]}
	Plotly.extendTraces('chart', plotData, [0]);
	xcount += amplitude.length;

	// Scrolling chart of fixed x axis length
	if (xcount > 500) {
		Plotly.relayout('chart', {
			xaxis: {
				range: [xcount - 500, xcount]
			}
		});
	}
}

// Start/Stop button
var startStopBtn = document.getElementById("startStopBtn");
startStopBtn = addEventListener("click", () => {startStop()})














// // Main consumer loop
// function kinesisConsumer() {


// 	kinesis.getShardIterator(
// 		{
// 			StreamName: 'wise-demo-stream',
// 			ShardId: 'shardId-000000000000',
// 			ShardIteratorType: 'LATEST'
// 		},
// 		(err, data) => {


// 			// First getRecords call using initial shard iterator
// 			kinesis.getRecords(
// 				{ShardIterator: data.ShardIterator},
// 				(err, data) => {
// 					var {NextShardIterator} = data;


// 					// Continuous loop pulling subsequent data from stream
// 					setInterval( () => {
// 						kinesis.getRecords(
// 							{ShardIterator: NextShardIterator},
// 							(err, data) => {
// 								({NextShardIterator} = data);
// 								// Throws error if Data is empty (consequence of pull-model)
// 								record = data.Records[0].Data;
// 								// write to DOM
// 								// var streamToHtml = document.getElementById("streamData");
// 								// var div = document.createElement("div");
// 								// div.innerHTML = record;
// 								// streamToHtml.appendChild(div);
// 								// Parse stream data
// 								// console.log(record);
// 								const decoder = new TextDecoder();
// 								const str = decoder.decode(record);
// 								let timeStamp = [];
// 								let amplitude = [];
// 								const ecgObj = JSON.parse(str);
// 								ecgObj.forEach((ecgData) => {
// 									let key = Object.keys(ecgData)[0];
// 									timeStamp.push(key);
// 									amplitude.push(ecgData[key]);
// 								});
// 								var plotData = {
// 									y: [amplitude]
// 								}
// 								// Plotting
// 								// console.log(parseFloat(str));
// 								Plotly.extendTraces('chart', plotData, [0]);
// 								xcount += amplitude.length;
// 								// Scrolling chart of fixed x axis length
// 								if (xcount > 1000) {
// 									Plotly.relayout('chart', {
// 										xaxis: {
// 											range: [xcount - 1000, xcount]
// 										}
// 									});
// 								}
// 							}
// 						)}, 500);
// 				}
// 			)
// 		}
// 	)
// }








// AWS.Config = new AWS.Config({
// 	accessKeyId: 'AKIA34GWMGJIKM52LP7C',
// 	secretAccessKey: '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',
// 	region: 'us-east-2'
// });

// kinesis.describeStream(
// 	{
// 		StreamName: streamName
// 	}, (err, data) => {
// 		console.log(err, data)
// 	}
// )
//
// const streamName = 'wise-demo-stream';
// const putParams = {
// 	Data: 'test-data-from-js',
// 	PartitionKey: '1',
// 	StreamName: streamName
// }
// kinesis.putRecord(putParams, (err, data) => {
// 	console.log(err, data);
// });