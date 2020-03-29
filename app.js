const http = require('http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const express = require('express');
const AWS = require('aws-sdk');
const port = 8080;
const app = express();


// set public folder
app.use(express.static(path.join(__dirname, 'public')));

// enable CORS
app.use(cors());


app.use('/', (req, res) => {
	res.send('testing');
});

// start server
app.listen(port, () => {
	console.log('Server started on port: ' + port);
})