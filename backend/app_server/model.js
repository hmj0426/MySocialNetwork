// this is model.js 
var mongoose = require('mongoose')
require('./db.js')


var commentSchema = new mongoose.Schema({
	//_id: ObjectId,
	commentId: Number, 
	author: String, 
	date: Date, 
	body: String
})
var postSchema = new mongoose.Schema({
	//_id: ObjectId,
	id: Number, 
	author: String, 
	body: String, 
	img: String, 
	date: Date, 
	comments: [ commentSchema ]
})
var userSchema = new mongoose.Schema({
	username: String, hashPassword: String, salt: String,
	facebookId: String
})

var userProfileSchema = new mongoose.Schema({
	username: String, 
	status: String, 
	following: [String], 
	email: String, 
	zipcode: String,
	picture: String
})

exports.Post = mongoose.model('post', postSchema)
exports.Comment = mongoose.model('comment', commentSchema)  //?
exports.User = mongoose.model('user', userSchema)
exports.Profile = mongoose.model('profile', userProfileSchema)

