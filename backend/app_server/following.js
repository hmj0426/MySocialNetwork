var Profile = require('./model.js').Profile
var User = require('./model.js').User
var isLoggedIn = require('./auth.js').isLoggedIn

exports.setup = function(app) {
    app.get('/following/:user?', isLoggedIn, getFollowings)
    app.put('/following/:user?', isLoggedIn, addFollowing)
    app.delete('/following/:user?', isLoggedIn, deleteFollowing)
}

function getFollowings(req, res) {
	if(!req.params.user){
        Profile.findOne({ username: req.username }, 'username following').exec(function(err, items){
            if(!items){  // no user found
                res.sendStatus(404)
                return
            }
            //console.log('followings', items)
            res.send(items)
            return
        })
    } else {
        Profile.findOne({ username: req.params.user }, 'username following').exec(function(err, items){
            if(!items){  // no user found
                res.sendStatus(404)
                return
            }
            //console.log('get followings', items)
            res.send(items)
            return
        })
    }
}

function addFollowing(req, res) {
	if(!req.params.user){
        res.send("Bad Request")
        return
    } else {
        console.log('req.params.user', req.params.user)
        User.findOne({ username: req.params.user }).exec(function(err, user){
            if(!user){
                // if the request gives a user that doesn't exist, response the following list
                console.log('no such user')
                Profile.findOne({ username: req.username }).exec(function(err, followingObj){
                    //console.log(followingObj)
                    res.send( {
                        username: req.username,
                        following: followingObj.following
                    } )
                    return
                })
            } else {
                // add a new following
                Profile.findOneAndUpdate({ username: req.username }, { $push: { following: req.params.user }}).exec(function(err, followingObj){
                    console.log('followingObj', followingObj)
                    if(!followingObj.following){  // no user found
                        console.log('no user found when adding following')
                        res.sendStatus(404)
                        return
                    }
                    var followingRes = followingObj.following
                    followingRes.push(req.params.user)
                    //console.log('followingObj after change', followingObj)
                    res.send( {
                        username: req.username,
                        following: followingRes
                    } )
                })               
            }
        })       
    	
    }
}

function deleteFollowing(req, res) {
	if(!req.params.user){
        res.send("Bad Request")
    } else {
        Profile.findOne({ username: req.username }, 'username following').exec(function(err, followingObj){
            if(!followingObj){  // no user found
                res.sendStatus(404)
                return
            }
            followingObj.following.forEach(function(user, index){
                if(user == req.params.user){
                    followingObj.following.splice(index, 1)
                    followingObj.save()
                }
            })
            res.send( followingObj )
        })
    }
}
