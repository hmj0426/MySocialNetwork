////////////////////////////////
// Upload files to Cloudinary //
////////////////////////////////
var multer = require('multer')
var stream = require('stream')
var cloudinary = require('cloudinary')

// multer parses multipart form data.  Here we tell
// it to expect a single file upload named 'image'
var uploadImage = multer().single('image')

exports.uploadImage = uploadImage

function getImage(req, res) {
	// This form has two parts: image and title
	// the title is used as the name of the uploaded file
	//   if not supplied, then we get some default name from Cloudinary
	// the image is the file to upload
	//   the name "image" must be the same as what we expect in the formData
	//   in the multer().single() middleware
	res.send('<form method="post" enctype="multipart/form-data">'
		+ '<p>Public ID: <input type="text" name="title"/></p>'
		+ '<p>Image: <input type="file" name="image"/></p>'
		+ '<p><input type="submit" value="Upload"/></p>'
		+ '</form>'
	);
}

function putImage(req, res) {

	// body-parser provides us the textual formData
	// which is just title in this case
	var publicName = req.body.title

	var uploadStream = cloudinary.uploader.upload_stream(function(result) {    	
		// create an image tag from the cloudinary upload
		var image = cloudinary.image(result.public_id, {
			format: "png", width: 100, height: 130, crop: "fill" 
		})
		// create a response to the user's upload
		res.send('Done:<br/> <a href="' + result.url + '">' + image + '</a>');
	}, { public_id: publicName })	

	// multer can save the file locally if we want
	// instead we do not instruct multer to save the file
	// and have the file in memory.
	// multer provides req.file and within is the byte buffer

	// we create a passthrough stream to pipe the buffer
	// to the uploadStream for cloudinary.
	var s = new stream.PassThrough()
	s.end(req.file.buffer)
	s.pipe(uploadStream)
	s.on('end', uploadStream.end)
	// and the end of the buffer we tell cloudinary to end the upload.

}

