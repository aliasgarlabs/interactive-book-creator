const multer = require('multer');

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    if(file.fieldname == 'audioFile') {
      cb(null, 'audio.mp3');
    }

    if(file.fieldname == 'dataFile') {
      cb(null, 'data.json');
    }
  }
});

// Create the multer instance
const upload = multer({ storage: storage });

module.exports = upload;