var fs = require('fs')
	path = require('path')
	express = require('express')
	bodyParser = require('body-parser')
	app = express()

var COMMENTS_FILE = path.join(__dirname, 'comments.js')

app.set('port', (process.env.PORT || 8080))

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

app.get('/api/comments', function(req, res) {
	fs.readFile(COMMENTS_FILE, function(err, data) {
		if (err) {
			console.error(err)
			process.exit(1)
		}
		res.json(JSON.parse(data))
	})
})

app.listen(app.get('port'), function() {
	console.log('Server started: http://localhost:' + app.get('port') + '/')
})