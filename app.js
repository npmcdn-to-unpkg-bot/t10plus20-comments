var fs = require('fs')
	path = require('path')
	express = require('express')
	bodyParser = require('body-parser')
	stylus = require('stylus')
	nib = require('nib')
	app = express()

var COMMENTS_FILE = path.join(__dirname, 'comments.json')

app.set('port', (process.env.PORT || 8080))

app.use(stylus.middleware({
	src: __dirname + '/resources',
	dest: __dirname + '/public',
	debug: true,
	force: true,
	compile: function compile(str, path) {
		console.log('compiling stylus to css')
		return stylus(str)
			.set('filename', path)
			.set('warn', true)
			.set('compress', true)
			.use(nib())
			.import('nib')
	}
}))
app.use('/', express.static(path.join(__dirname, 'public')))

app.use(bodyParser.json())

app.use(bodyParser.urlencoded({extended: true}))

app.use(function(req, res, next) {
	// Set permissive CORS header - this allows this server to be used only as
    // an API server in conjunction with something like webpack-dev-server.
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    // Disable caching so we'll always get the latest comments.
    res.setHeader('Cache-Control', 'no-cache')
    next()
})

/*app.use('/test/:name', function(req, res, next) {
	//res.sendFile(__dirname + '/public/test.html')
	req.params.name = req.params.name || null
	res.send(req.params.name)
})*/

app.get('/api/comments', function(req, res) {
	fs.readFile(COMMENTS_FILE, function(err, data) {
		if (err) {
			console.error(err)
			process.exit(1)
		}
		res.json(JSON.parse(data))
	})
})

app.post('/api/comments', function(req, res) {
	fs.readFile(COMMENTS_FILE, function(err, data) {
		if (err) {
			console.error(err)
			process.exit(1)
		}
		var comments = JSON.parse(data)

		var newComment = {
			id: Date.now(), 
			author: req.body.author,
			text: req.body.text
		}
		comments.push(newComment)

		fs.writeFile(COMMENTS_FILE, JSON.stringify(comments, null, 4), function(err) {
			if (err) {
				console.error(err)
				process.exit(1)
			}
			res.json(comments)
		})
	})
})

app.listen(app.get('port'), function() {
	console.log('Server started: http://localhost:' + app.get('port') + '/')
})