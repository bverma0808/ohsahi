// Imports 
var os          = require('os')
var fs          = require('fs')
var util        = require('util')
var express     = require('express')
var path        = require('path')
var app         = express()
var fileUpload  = require('express-fileupload')
var homeDirName = os.homedir()
var basePath    = `${homeDirName}${path.sep}Garaba-MaterialToConvert`;

// App middleware
app.use(fileUpload());

// End points for user 
app.post('/api/upload', function (req, res){
	if (!req.files)
    	return res.status(400).send('No files were uploaded.');
    
    var userId = req.body.userId;

	// The name of the input field (i.e. "fileToConvert") is used to retrieve the uploaded file
	var fileToConvert = req.files.fileToConvert;
	var fileOriginalName = fileToConvert.name;
	var extension = fileOriginalName.substring(fileOriginalName.indexOf('.'));
	var storedFileName = new Date().getTime() + extension;
    var storeDirectoryPath = `${basePath}${path.sep}${userId}`

    // check and create the folders if not exists
	storeDirectoryPath.split(path.sep)
		.reduce((currentPath, folder) => {
			currentPath += folder + path.sep;
			if (!fs.existsSync(currentPath)){
			    fs.mkdirSync(currentPath);
			}
			return currentPath;
		}, '');

	// Use the mv() method to place the file somewhere on your server
	fileToConvert.mv(`${storeDirectoryPath}/${storedFileName}`, function(err) {
	    if (err)
	      return res.status(500).send(err);
	    res.send('File uploaded!');
	});
})

// Starter code
app.listen(3000, function() {
	console.log('App listening on port 3000')
});