#!/usr/bin/nodejs
// Simple NodeJS + Express Server for ALPRD
// Updates OSD on Dahua Camera and saves data to .json files

var username = 'ptz'
var password = 'ptz'
var host = '192.168.42.26'
var path = '/home/alprd/plateimages/json/'

// Begin App
var express = require("express");			// npm install express
var myParser = require("body-parser");			// npm install body-parser
var req = require('request');				// npm install request
var fs = require('fs');
var timer
var group = []

// logging
require("console-stamp")(console, {			// npm install console-stamp
	pattern:"HH:MM:ss.l", 
	colors: {
    	stamp: "green",
    	label: "yellow",
	}
});

var app = express();

app.use(myParser.json({extended : true}));
app.post("/push/", function(request, response) {
	var plate = request.body.results[0].plate;
	if (plate.length === 6) {			// add hyphen for display purposes
		pre = plate.slice(0,3)
		post = plate.slice(3)
		if (((/[^0-9]/.test(pre)) || (/[^A-Z]/.test(pre))) && ((/[^A-Z]/.test(post)) || (/[^0-9]/.test(post)))) {
			group.push(plate)
			clearTimeout(timer)
			console.log(group)
		 	plate = pre + '-' + post;
		}
	}
	
	console.log(plate + ' (' + request.body.processing_time_ms + 'ms)');
	req('http://' + username + ':' + password + '@' + host + '/cgi-bin/configManager.cgi?action=setConfig&VideoWidget[0].CustomTitle[1].Text=' + plate);
	response.send("recieved");
	file = path + request.body.uuid + '.json';
	fs.appendFile(file, JSON.stringify(request.body), function () {
		response.end();
	});
	timer = setTimeout(function () { group.length = 0; }, 1200);
});

app.listen(9000);
console.info('listening @ http://localhost:9000/push/')
