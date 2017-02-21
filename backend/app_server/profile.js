var stream = require('stream')
var cloudinary = require('cloudinary')

var Profile = require('./model.js').Profile
var isLoggedIn = require('./auth.js').isLoggedIn
var uploadImage = require('./cloudinary.js').uploadImage

exports.setup = function(app) {
     app.get('/', index)

     app.get('/statuses/:user*?/', isLoggedIn, getStatuses)
     app.get('/status/', isLoggedIn, getLoggedInStatus)
     app.put('/status/', isLoggedIn, setStatus)

     app.get('/email/:user*?/', isLoggedIn, getEmail)
     app.put('/email/', isLoggedIn, setEmail)

     app.get('/zipcode/:user*?/', isLoggedIn, getZip)
     app.put('/zipcode/', isLoggedIn, setZip)

     app.get('/pictures/:user*?/', isLoggedIn, getPictures)
     app.put('/picture/', isLoggedIn, uploadImage, setPictures)

}


function index(req, res) {
     res.send({hello:'world'})
}

function getStatuses(req, res) {
    var reqUser = req.params.user ? req.params.user.split(",") : null
    var statusesRes = { statuses:[] }

    if(!reqUser){
        //when the request does not specify a username, send the status of logged in user 
        Profile.findOne({ username: req.username }, 'username status').exec(function(err, statusObj){
            if(err) console.log('find status err')
            if(!statusObj){
                console.log('no status found corresponding to the given user')
                res.sendStatus(404)
                return
            } else {
                //console.log('get statusObj',statusObj)
                statusesRes.statuses.push(statusObj)
                //console.log('get status response:',statusesRes)
                res.send( statusesRes )
                return
            }
        })
    } else {
        Profile.find({ username: { $in: reqUser } }, 'username status').exec(function(err, statusObjs){
            if(err) console.log('find status err')
            if(!statusObjs){
                //console.log('no status found corresponding to the given users')
                res.sendStatus(404)
                return
            } else {
                //console.log('get statusObjs',statusObjs)
                statusObjs.forEach(function(status){
                    statusesRes.statuses.push(status)
                })
                //console.log('get statuses response',statusesRes)
                res.send( statusesRes )
                return
            }
        })
    }
}

function getLoggedInStatus(req, res) {
    //console.log("get logged in user's status", req.params)
    var statusesRes = { statuses:[] }
    Profile.findOne({ username: req.username }, 'username status').exec(function(err, statusObj){
        if(err) console.log('find status err')
        if(!statusObj){
            console.log('no status found corresponding to the given user')
            res.sendStatus(404)
            return
        } else {
            //console.log('get loggedin statusObj',statusObj)
            statusesRes.statuses.push(statusObj)
            //console.log('get loggedin status response',statusesRes)
            res.send( statusesRes )
            return
        }
    })
}

//how to get logged in username

function setStatus(req, res) {
    //console.log('set status', req.params)
    var statusesRes = { statuses:[] }

    if(!req.body.status) {
        res.sendStatus(400) // Bad Request
        return
    }

    Profile.findOneAndUpdate({ username: req.username }, { status: req.body.status }).exec(function(err, statusObj){
        if(err) console.log('find status err')
        if(!statusObj){
            console.log('no status found corresponding to the given user')
            res.sendStatus(404)
            return
        } else {
            console.log('unchanged statusObj',statusObj)
            statusesRes.statuses.push({
                'username': statusObj.username,
                'status': req.body.status
            })
            console.log('update status response:',statusesRes)
            res.send( statusesRes )
            return
        }
    })    
}

function getEmail(req, res) {
    var reqUser = req.params.user ? req.params.user : null
    if(!reqUser){
        Profile.findOne({ username: req.username }, 'username email').exec(function(err, emailObj){
            if(err) console.log('find email err')
            if(!emailObj){
                //console.log('no email found corresponding to the loggedin user when getting email')
                res.sendStatus(404)
                return
            } else {
                //console.log('get loggedin emailObj',emailObj)
                res.send( emailObj )
                return
            }
        })
    } else {
        Profile.findOne({ username: reqUser }, 'username email').exec(function(err, emailObj){
            if(err) console.log('find email err')
            if(!emailObj){
                //console.log('no email found corresponding to the requested user')
                res.sendStatus(404)
                return
            } else {
                //console.log('get requested emailObj',emailObj)
                res.send( emailObj )
                return
            }
        })
    }
}

function setEmail(req, res) {
    if(!req.body.email) {
        res.sendStatus(400) // Bad Request
        return
    }
    Profile.findOne({ username: req.username }, 'username email').exec(function(err, emailObj){
        if(err) console.log('find email err')
        if(!emailObj){
            console.log('no email found corresponding to the loggedin user when setting email')
            res.sendStatus(404)
            return
        } else {
            //console.log('unchanged emailObj',emailObj)
            emailObj.email = req.body.email
            emailObj.save()
            //console.log('changed emailObj',emailObj)
            res.send( emailObj )
            return
            // can change, why error message?????
        }
    })
}

function getZip(req, res) {
    var reqUser = req.params.user ? req.params.user : null
    if(!reqUser){
        Profile.findOne({ username: req.username }, 'username zipcode').exec(function(err, zipObj){
            if(err) console.log('find zipcode err')
            if(!zipObj){
                console.log('no zipcode found corresponding to the loggedin user when getting zipcode')
                res.sendStatus(404)
                return
            }
            //console.log('get loggedin zipObj',zipObj)
            res.send( zipObj )
            return
        })
    } else {
        Profile.findOne({ username: reqUser }, 'username zipcode').exec(function(err, zipObj){
            if(err) console.log('find zipcode err')
            if(!zipObj){
                //console.log('no zipcode found corresponding to the request user when getting zipcode')
                res.sendStatus(404)
                return
            } else {
                //console.log('get requested zipObj',zipObj)
                res.send( zipObj )
                return
            }
        })
    }
}

function setZip(req, res) {
    if(!req.body.zipcode) {
        res.sendStatus(400) // Bad Request
        return
    }
    Profile.findOne({ username: req.username }, 'username zipcode').exec(function(err, zipObj){
        if(err) console.log('find zipcode err')
        if(!zipObj){
            console.log('no zipcode found corresponding to the loggedin user when setting zipcode')
            res.sendStatus(404)
            return
        } else {
            //console.log('unchanged zipObj', zipObj)
            zipObj.zipcode = req.body.zipcode
            zipObj.save()
            //console.log('changed zipObj',zipObj)
            res.send( zipObj )
            return
            // can change, why error message?????
        }
    })
}

function getPictures(req, res) {
    
    var reqUser = req.params.user ? req.params.user.split(",") : null
    var pictureRes = { pictures:[] }
    //console.log(req.params)

    if(!reqUser){
        //when the request does not specify a username, send the profile img of logged in user 
        Profile.findOne({ username: req.username }, 'username picture').exec(function(err, imgObj){
            //console.log('get my profile img')
            if(err) console.log('find profile img err')
            if(!imgObj){
                console.log('no img found corresponding to the given user')
                res.sendStatus(404)
                return
            } else {
                //console.log('get imgObj',imgObj)
                pictureRes.pictures.push(imgObj)
                res.send( pictureRes )
                return
            }
        })
    } else {
        Profile.find({ username: { $in: reqUser } }, 'username picture').exec(function(err, imgObjs){
            if(err) console.log('find imgs err')
            if(!imgObjs[0]){
                console.log('no imgs found corresponding to the given users')
                res.sendStatus(404)
                return
            } else{
                //console.log('get imgObjs',imgObjs)
                imgObjs.forEach(function(img){
                    pictureRes.pictures.push(img)
                })            
                //console.log('get img', pictureRes)
                res.send( pictureRes )
                return
            }
        })
    }
}

function setPictures(req, res) {
    console.log("set picture")
    if(!req.file) {
        res.sendStatus(400) // Bad Request
        return
    }
    //console.log("req.file:", req.file)   // the req.file is done by uploadImage(from multer)

    var publicName = req.username + "_profile_" + new Date().getTime()

    var uploadStream = cloudinary.uploader.upload_stream(function(result) {
        //console.log("img url:", result.url)     
        Profile.findOne({ username: req.username }, 'username picture').exec(function(err, imgObj){
            if(err) console.log('find img err')
            if(!imgObj){
                console.log('no profile img found corresponding to the loggedin user when setting picture')
                res.sendStatus(404)
                return
            } else {
                //console.log('unchanged imgObj:', imgObj)
                imgObj.picture = result.url
                imgObj.save()
                //console.log('changed imgObj:',imgObj)
                res.send( imgObj )
                return
            }
        })
    }, { public_id: publicName })

    var s = new stream.PassThrough()
    s.end(req.file.buffer)
    s.pipe(uploadStream)
    s.on('end', uploadStream.end)       
}





