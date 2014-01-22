var express = require('express');
var app = express();
var fs = require('fs');
var mime = require('mime-magic');
var pg = require('pg');
var uuid = require ('node-uuid');

app.use(express.compress());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + "/public/files" }))

var db = new pg.Client({database:'files', host:"localhost", user: "files", password: "files"});
/*
goals:
move the project to be more modular. include the header and upload areas rather than over loading the index.
move the image,audio,video,album out to their own .jade. keeps things tidy, and more importantly makes it easy to understand
move everything to associate with a db. removes the need for a .jpg on the end of the url.
	table image for images, sound for sounds, album for albums, file for files, and perhaps another table(users?) if needed
add a grid view of all the uploaded images/stuff
moar main backgrounds
*/

function backgroundgen(){
	rand = Math.floor(Math.random() * (7 - 1 + 1) + 1);
	return rand;
}

function logip(req){
	var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress || req.connection.socket.remoteAddress;
	console.log(ip);
}

app.get('/', function(req, res){
	/*get the first 10/20 images and put into an array, then generate a random number from 0-9 or 0-19.
	send all that to the client which will display the 10/20 images and use the random number to as a pointer to which image in the array should be the background.
	That or just keep pulling from ~10/20 pre-selected background images
	*/
	rand = backgroundgen();
	logip(req);
	res.render('index', {background: rand});
});

app.get('/image/:name', function(req, res){
	var name = req.params.name;
	logip(req);
	res.render('index', {image: name});
});

app.get('/album/:albumid', function(req, res){
	/*
	lookup albumid and get images/descriptions + album title
	images: json of images and descriptions
	title: title duh
	*/
	res.render('album', {images: images, title: title});
});

app.get('/audio/:name', function(req, res){
	var name = req.params.name;
	rand = backgroundgen();
	res.render('index', {audio: name, background: rand});
});

app.get('/download/:name', function(req, res){
	var name = req.params.name;
	rand = backgroundgen();
	res.render('index', {download: name, background: rand});
});

app.post('/upload', function(req, res, err){
	var path = req.files.upload.path;
	console.log(path);
	console.log(req.files.upload.name);
	mime(req.files.upload.path, function(err, type){
		console.log(type);
		if(err){
			console.error(err.message);
		} else if(type.indexOf('image') != -1){
			var position = path.search(/files/i)+6;
			var name = path.slice(position);
			name = '/image/'+ name;
			console.log(name);
			res.json({status: 'success', location: name});
			store(null, name, "image", "0");
		} else if(type.indexOf('audio') != -1 || type.indexOf('application/octet-stream') != -1){
			var position = path.search(/files/i)+6;
			var name = path.slice(position);
			var new_location = __dirname + "/public/files/audio/" + name;
			console.log(new_location);
			fs.rename(path, new_location, function(){
				name = '/audio/'+ name;
				console.log(name);
				res.json({status: 'success', location: name});
			});
		} else if(type.indexOf('text') != -1 || type.indexOf('application') != -1){
			var position = path.search(/files/i)+6;
			var name = path.slice(position);
			var new_location = __dirname + "/public/files/download/" + name;
			console.log(new_location);
			fs.rename(path, new_location, function(){
				name = '/download/'+ name;
				console.log(name);
				res.json({status: 'success', location: name});
			});
		}
		function store (name, location, type, user) {//name == literal name //location == where it is //type == filetype //user == original uploader(use ip for annon uploads?)
			db.connect();
			var id = uuid.v4();
			var time = new Date;
			var insert = db.query({
				text: 'INSERT INTO images (id, location, time, user) VALUES (id = $1, location = $2, time = $3, user = $4)',
				values: [id, location, time, user],
				name: 'image insert'
			});
			db.on('drain', db.end.bind(db));
		}
	});
});

app.listen(81);