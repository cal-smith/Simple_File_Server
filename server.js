var express = require('express');
var app = express();
var fs = require('fs');
var mime = require('mime-magic');

app.use(express.compress());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + "/public/files" }))


/*
goals:
move the project to be more modular. include the header and upload areas rather than over loading the index.
move the image,audio,video,album out to their own .jade. keeps things tidy, and more importantly makes it easy to understand
move everything to associate with a db. removes the need for a .jpg on the end of the url.
	table image for images, sound for sounds, album for albums, file for files, and perhaps another table(users?) if needed
add a grid view of all the uploaded images/stuff
moar main backgrounds
*/

app.get('/', function(req, res){
	rand = Math.floor(Math.random() * (3 - 1 + 1) + 1);
	res.render('index', {background: rand});
});

app.get('/image/:name', function(req, res){
	var name = req.params.name;
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
	res.render('index', {audio: name});
});

app.get('/download/:name', function(req, res){
	var name = req.params.name;
	res.render('index', {download: name});
});

app.post('/upload', function(req, res, err){
	var path = req.files.upload.path;
	console.log(path);
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
	});
});

app.listen(8080);