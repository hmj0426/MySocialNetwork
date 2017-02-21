var md5 = require('md5')
var request = require('request')
var qs = require('querystring')
var session = require('express-session')
var passport = require('passport')
var FacebookStrategy = require('passport-facebook').Strategy;

process.env.REDIS_URL = 'redis://h:p5ihe9brif3h5iftpe853792fo8@ec2-54-83-33-178.compute-1.amazonaws.com:14109'
var redis = require('redis').createClient(process.env.REDIS_URL)

module.exports.isLoggedIn = isLoggedIn

var cookieKey = 'mengjinCookie'
var port = 3000
var FACEBOOK_APP_ID = '1695676387353638'
var FACEBOOK_APP_SECRET = '237db21aba20c335651159c560595d82'
var config = {
	clientSecret: FACEBOOK_APP_SECRET,
	clientID: FACEBOOK_APP_ID,
	callbackURL: 'http://localhost:' + port + '/callback'
}
var initPicture = "https://lh3.googleusercontent.com/-_5FlwTX4HC8/AAAAAAAAAAI/AAAAAAAAZMw/McfcG_asZWM/photo.jpg"
var initStatus = 'Having a good day on GoZone!'
var users = {}

var User = require('./model.js').User
var Profile = require('./model.js').Profile

passport.use(new FacebookStrategy(config,
	function(token, refreshToken, profile, done){
		process.nextTick(function() {
	
			return done(null, profile)
		})
	})
)

exports.setup = function(app) {
	app.use(session({ secret: 'MengjinWebsiteHashingSecret' }))
	app.use(passport.initialize())
	app.use(passport.session())
	app.post('/login', login)
	app.post('/register', register)
	app.put('/logout/',isLoggedIn, logout)
	app.put('/password/', isLoggedIn, setPassword)

	app.use('/login/facebook', passport.authenticate('facebook', { scope:'email' }))
	app.use('/callback', passport.authenticate('facebook', {
		successRedirect:'/fbLogin', failureRedirect:'/fail' })) 
	app.use('/fail', fail)
	app.use('/fbLogin', isFbAuth, fbLogin)
	app.put('/linkAccount', isLoggedIn, linkAccount)
	app.get('/linkAccount', isLoggedIn, getLinkAccount)
	app.put('/unlinkAccount', isLoggedIn, unlinkAccount)

}

//serialize the user for the session
passport.serializeUser(function(user, done) {
	//console.log('user', user)
	users[user.id] = user
	done(null, user.id)
})

// deserialize the user from the session
passport.deserializeUser(function(id, done) {
	var user = users[id]
	//console.log('id', id)
	done(null, user)
}) 

function isLoggedIn(req, res, next) {
	var sid = req.cookies[cookieKey]
	if(!sid) {
		console.log("no sid")
		res.sendStatus(401)  // Unauthorized
		return 
	}

	redis.get(sid, function(err, username) {
		//console.log(sid + ' mapped to ' + username)
		if(!username){
			console.log("no username gotten")
			res.sendStatus(401)  // Unauthorized
			return 
		} else {
			req.username = username
			next()
		}
	})
}

function register(req, res) {
	var username = req.body.username

	var salt = md5( (Math.random()*10000).toString() )
	var hashPassword = md5(req.body.password + salt)
	User.find({ username: req.body.username }).exec(function(err, item) {
		console.log('dupulicated', item)
		if(item.length >= 1){
			res.sendStatus(400)  // dupulicated user
			return
		}		
		new Profile({ 
				username: req.body.username, 
				status: initStatus,
				following: ['water', 'mh58'],
				email: req.body.email, 
				zipcode: req.body.zipcode,
				picture: initPicture }).save()
		new User({ 
				username: req.body.username, 
				hashPassword: hashPassword, 
				salt: salt}).save(function(result){
			res.send({
				"result": "success",
				"username": req.body.username
			})
		})		
	})	
}

function login(req, res) {
	var username = req.body.username
	var password = req.body.password
	if(!username || !password) {  // Bad request
		res.sendStatus(400)
		return
	}
	User.find({ username: username }).exec(function(err, userObj) {
		if(!userObj[0]) {
			res.sendStatus(401)  // Unauthorized
			return
		}
		var hashPassword = md5(password + userObj[0].salt)
		if(userObj[0].hashPassword != hashPassword){
			res.sendStatus(401)  // Unauthorized
			return
		}
		res.cookie(cookieKey, generateCode(userObj[0]),
			{ maxAge: 3600*1000, httpOnly:true })
		res.send( {
			"username": username,
			"result": "success"
		} )	
	})
}

function generateCode(userObj) {
	var mySecret = "lucubrating"
	var sid = md5( mySecret + userObj.username + new Date().getTime() )
	redis.set(sid, userObj.username)
	return sid
}

function fbLogin(req, res) {
	User.findOne({ facebookId: req.user.id }).exec(function(err, userObj){
		if(err) console.log('fail to search the fb user')
		if(!userObj){
			// register the user in our system
			var newUsername = req.user.displayName + "@facebook_" + req.user.id
			
			Profile.find({ username: newUsername }).exec(function(err, profObj){
				//console.log("create third party account, profObj", profObj)
				var newUserObj = { 
					username: newUsername, 
					hashPassword: null, 
					salt: null,
					facebookId: req.user.id
				}
				new User(newUserObj).save()

				if(profObj.length == 0){  // if this account haven't been created for one time
					//console.log("create new user profile")
					new Profile({ 
						username: newUsername, 
						status: initStatus,
						following: ['water', 'mh58'],
						email: "You can change your email", 
						zipcode: "You can change your zipcode",
						picture: initPicture 
					}).save()
					res.cookie(cookieKey, generateCode(newUserObj),
						{ maxAge: 3600*1000, httpOnly:true })

					res.redirect(req.headers.referer + "/#/profile")	
				} else {  // the account have been created, but been deleted due to linking
					// log in and send a new cookie
					res.cookie(cookieKey, generateCode(newUserObj),
						{ maxAge: 3600*1000, httpOnly:true })

					res.redirect(req.headers.referer + "/#/profile")
					return
				}					
			})
		} else {
			// log in and send a new cookie
			res.cookie(cookieKey, generateCode(userObj),
				{ maxAge: 3600*1000, httpOnly:true })

			res.redirect(req.headers.referer + "/#/profile")
			return	
		}								
	})	
}

function isFbAuth(req, res, next){ 
	//console.log("req.isAuthenticated(): ", req.isAuthenticated() )
	if(req.isAuthenticated()) {
			next()
	} else {
		console.log("third party not authenticated")
		res.redirect('/login/facebook')
	}
}

function fail(req, res) {
	console.log("third party failed")
	res.redirect('/login/facebook')
}

function logout(req, res) {
	var sid = req.cookies[cookieKey]
	//console.log('logout, and sid is: ', sid)
	redis.del(sid)
	res.clearCookie(cookieKey)
	res.sendStatus(200)
}

function linkAccount(req, res){
	//console.log('req.body',req.body)
	var linkUsername = req.body.linkUsername
	var linkPsw = req.body.linkPsw
	if(!linkUsername || !linkPsw) {  // Bad request
		res.sendStatus(400)
		return
	}

	User.findOne({ username: linkUsername }).exec(function(err, userObj) {
		//console.log("userObj", userObj)
		if(!userObj) {
			res.sendStatus(401)  // Unauthorized
			return
		}
		var hashPassword = md5(linkPsw + userObj.salt)
		//console.log('hashPassword (link account):', hashPassword)		
		if(userObj.hashPassword != hashPassword){
			res.sendStatus(401)  // Unauthorized
			return
		}

		// update the user's field and delete the third-party user
		User.findOneAndRemove({ username: req.username }).exec(function(err, fbUserObj){
			if(!fbUserObj) {
				res.sendStatus(400)  // Bad Request
				return
			}
			//console.log("fbUserObj that is going to be deleted:", fbUserObj)
			userObj.facebookId = fbUserObj.facebookId
			userObj.save()
			//console.log("changed userObj of linking", userObj)

			// delete the cookie for the logged in user
			var sid = req.cookies[cookieKey]
			redis.del(sid)
			res.clearCookie(cookieKey)

			res.send({
				"username": linkUsername,
				"result": "success"
			})
			return
		}) 
	})
}

function getLinkAccount(req, res){
	if(!req.username) {
        res.sendStatus(400) // Bad Request
        return
    }
	//console.log("get link account, req.username:",req.username)
	User.findOne({ username: req.username }).exec(function(err, userObj){
		if(err) console.log('find user err')
        if(!userObj){
            console.log('no userObj found when getting linkAccount')
            res.sendStatus(404)
            return
        } else {
            //console.log("get linkAccount, userObj:",userObj)
			res.send({
				facebookId: userObj.facebookId ? userObj.facebookId : null
			})
            return
        }
	})
}

function unlinkAccount(req, res){
	//console.log("unlink, and req.body is", req.body)
	if(!req.body.thirdPartyId){
		res.sendStatus(400) // Bad Request
		return
	}

	User.findOne({ username: req.username }).exec(function(err, userObj){
		if(err) console.log('find user err')
        if(!userObj){
            console.log('no userObj found when unlinking account')
            res.sendStatus(404) // Not found
            return
        } else if(!userObj.facebookId || userObj.facebookId != req.body.thirdPartyId){
        	console.log("the user does not have a linked account or the linked ids don't match")
            res.sendStatus(401) // Unauthorized
            return
        } else {
            //console.log("unlinking account, userObj:",userObj)
			userObj.facebookId = null
			userObj.save()
			//console.log("changed userObj of unlinking", userObj)
			res.send({
				"username": req.username,
				"result": "success"
			})
            return
        }
	})				

}

function setPassword(req, res) {
	if(!req.body.password){
		res.sendStatus(400) // Bad Request
		return
	}
	//console.log("new psw", req.body.password)
	var newSalt = md5( (Math.random()*10000).toString() )
	var newHashPassword = md5(req.body.password + newSalt)
	//console.log("new hashpsw", newHashPassword)

	User.findOneAndUpdate({ username: req.username }, { hashPassword: newHashPassword, salt: newSalt }).exec(function(err, userObj) {
		if(!userObj) {
			res.sendStatus(404)  // Not Found
			return
		}
		res.send( {
			"username":req.username,
			"status": "changed"
		} )
		return
	})
}


