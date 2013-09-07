var express = require('express');
var app = express();
var fs = require('fs');
var mime = require('mime-magic');

app.use(express.compress());
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));
app.use(express.bodyParser({ keepExtensions: true, uploadDir: __dirname + "/public/files" }))

app.get('/', function(req, res){
	res.render('index');
});

app.get('/image/:name', function(req, res){
	var name = req.params.name;
	res.render('index', {image: name})
});

app.post('/upload', function(req, res, err){
	var path = req.files.upload.path;
	console.log(path);
	mime(req.files.upload.path, function(err, type){
		console.log(type);
		if(err){
			console.error(err.message);
		} if(type.indexOf('image') != -1){
			console.log("search");
			var position = path.search(/files/i)+6;
			var name = path.slice(position);
			name = '/image/'+ name;
			console.log(name);
			res.json({status: 'success', location: name});
		}
	});
});

app.listen(8080);