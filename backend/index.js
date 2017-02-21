var express = require('express')
var bodyParser = require('body-parser')
var cookieParser = require('cookie-parser') 


var app = express()
app.use(bodyParser.json())
app.use(cookieParser())
app.use(enableCORS)

function enableCORS(req, res, next) {
	if (req.headers.origin){
		res.setHeader('Access-Control-Allow-Origin', req.headers.origin)
		res.setHeader('Access-Control-Allow-Credentials','true')
		res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization')
		res.setHeader('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE')
		if(req.method == 'OPTIONS') res.send(200)
	}
	next()
}

if (process.env.NODE_ENV !== "production") {
	console.log('load')
    require('dot-env')
}

require('./app_server/auth.js').setup(app)
require('./app_server/posts.js').setup(app)
require('./app_server/profile.js').setup(app)
require('./app_server/following.js').setup(app)

// Get the port from the environment, i.e., Heroku sets it
var port = process.env.PORT || 3000

//////////////////////////////////////////////////////
var server = app.listen(port, function() {
     console.log('Server listening at http://%s:%s', 
               server.address().address,
               server.address().port)
})
