var stream = require('stream')
var cloudinary = require('cloudinary')

var Post = require('./model.js').Post
var Profile = require('./model.js').Profile
var isLoggedIn = require('./auth.js').isLoggedIn
var uploadImage = require('./cloudinary.js').uploadImage

exports.setup = function(app) {
    app.get('/posts/:id*?/', isLoggedIn, getPosts)
    app.put('/posts/:id', isLoggedIn, revisePost)
    app.post('/post/', isLoggedIn, uploadImage, addPost)
}

function getPosts(req, res) {
       
    var reqStr = req.params.id ? req.params.id.split(",") : null
    var postsRes = { posts: [] }
    if(!reqStr){  // if id is not specified, then return all posts by current users' followings
        //console.log('get all posts')
        Profile.findOne({ username: req.username }, 'following').exec(function(err, followings) {
            if(err) console.log('fail to search in the profile when get post')
            //console.log('followings', followings.following)           
            followings.following.push(req.username)
            //console.log('display user', followings.following)
            Post.
                find({ author: { $in: followings.following } }).
                limit(10).
                sort({ date: -1 }).
                exec(function(err, posts){
                    if(err) console.log('fail to search posts')
                    //console.log('all posts', posts)
                    posts.forEach(function(post) {
                        postsRes.posts.push(post)
                    })
                    //console.log('res posts', postsRes)
                    res.send(postsRes)
                    return  
                })                
        })  
        
    } 
    else if( reqStr[0].charAt(0) && !(/^\d+$/.test(reqStr[0])) ){  
        // first character is not a digit, so it is a user/users, send all the posts by the users

        Post.find({ author: { $in: reqStr } }).exec(function(err, posts){
            if(err) console.log('fail to search posts for certain users')
            //console.log('posts found: ', posts)
            posts.forEach(function(post) {
                postsRes.posts.push(post)
            })
            res.send(postsRes)
            return                                               
        })
                  
    } 
    else {  // here the reqStr is id(s)
        //console.log('get posts of specified ids: ', reqStr)        
        Post.find({ id: { $in: reqStr } }).exec(function(err, posts){
            if(err) console.log('fail to search posts for certain ids')
            //console.log('posts found: ', posts)
            posts.forEach(function(post) {
                postsRes.posts.push(post)
            })
            if(postsRes.posts[0]){
                res.send(postsRes)
            } else {
                res.send("No such id")
            } 
            return                                              
        })
    }
}

function revisePost(req, res) {
    //console.log(":id is",req.params.id)
    var reqId = req.params.id ? req.params.id : false
    var postsRes = { posts: [] }

    if(!reqId){ // if no id in the url, sent back "Bad Request"
        console.log('no id when revising post')
        res.sendStatus(400) // Bad Request
        return
    } 

    if(!req.body.commentId){  // no commentId in payload, so edit a post 
        console.log('edit a post, reqId: ', reqId)
        Post.findOneAndUpdate({ id: reqId }, { body: req.body.body }).exec(function(err,post){
            if(!post){   // cannot find a post according to the post id
                res.sendStatus(404)  // Not Found
                return
            }
            if(req.username != post.author){  //if the post author is not the same as logged in user
                res.sendStatus(401)  // Unauthorized
                return
            }
            //console.log('post',post)
            post.body = req.body.body // the post returned is old post, need to be uodated
            postsRes.posts.push(post)  
            res.send(postsRes)
            //console.log('postsRes',postsRes)
            return
        })
    } 
    else if (req.body.commentId == -1) {  
        //if the commentId is -1, add a new comment
        console.log('add comment, reqId: ', reqId)
        Post.findOne({ id: reqId }).exec(function(err,post){
            if(!post){   // cannot find a post according to the post id
                res.sendStatus(404)  // Not Found
                return
            }
            var newId = new Date().getTime()
            for(var i=0; i < req.username.length; i++){
                newId += req.username.charCodeAt(i)
            }
            var newComment = {
                commentId: newId,
                author: req.username,
                date: new Date(),
                body: req.body.body
            }
            //console.log('post to be added comment', post)
            post.comments.push(newComment)        
            postsRes.posts.push(post)
            post.save(function(err){
                //if(!err)  console.log('add new comment fail')  
            })
            //console.log('postsRes',postsRes)
            res.send(postsRes)
            return
        })
    }
    else {
        //if there is a commentId and it is not -1, then change the comment content
        console.log('edit comment, reqId: ', reqId)
        Post.findOne({ id: reqId } ).exec(function(err, post){
            //console.log('post of editted comment', post)
            post.comments.forEach(function(comment) {
                if(comment.commentId == req.body.commentId){
                    if(comment.author != req.username){
                        console.log('unauthorized when edit comment')
                        //if the comment author is not the same as logged in user, send "unauthorized"
                        res.sendStatus(401) // Unauthorized
                        return
                    } else {
                        //console.log('comment to be editted', comment)
                        comment.body = req.body.body
                        post.save()
                        postsRes.posts.push(post)
                        //console.log('postsRes',postsRes)
                        res.send(postsRes)
                        return   
                    }                           
                }
            })
        }) 
    }       
}


function addPost(req, res) {
    var postsRes = { posts: [] }
    /* use the 'img' and 'body' in the payload to create a new post item,
      if the img is null in payload, it is also null in the new item. */
    if(!req.body.body){
        console.log('no post body')
        res.sendStatus(400) // Bad Request
        return
    }

    var newId = new Date().getTime()  // generate a new id for the new post
    for(var i=0; i < req.username.length; i++){
        newId += req.username.charCodeAt(i)
    }
    //console.log('new id',newId)

    if(req.file){  // if there is a img file in the payload
        var publicName = req.username + "_profile_" + new Date().getTime()
        var uploadStream = cloudinary.uploader.upload_stream(function(result) {
            //console.log("post img url:", result.url)     
            postsRes.posts.push({ 
                id: newId, 
                author: req.username, 
                body: req.body.body, 
                img: result.url, 
                date: new Date(),
                comments: []
            }) 
            //console.log('add post', postsRes.posts[0])
            new Post(postsRes.posts[0]).save()
            res.send(postsRes)
        }, { public_id: publicName })

        var s = new stream.PassThrough()
        s.end(req.file.buffer)
        s.pipe(uploadStream)
        s.on('end', uploadStream.end)  

    } else {  // if there isn't any img in the post
        postsRes.posts.push({ 
                id: newId, 
                author: req.username, 
                body: req.body.body, 
                img: null, 
                date: new Date(),
                comments: []
        })         
        
        console.log('add post', postsRes.posts[0])
        new Post(postsRes.posts[0]).save()
        res.send(postsRes)
    }
}






