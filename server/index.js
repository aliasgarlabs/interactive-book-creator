const path = require('path');
const express = require('express')
const app = express()
const port = 3000

// Require the upload middleware
const upload = require('./upload');
const audio_processor = require('./audio_processor');


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})

// Set up a route for file uploads
app.post('/upload', upload.any(), (req, res) => {
  // Handle the uploaded file
  audio_processor.zip()
  // audio_processor.splitAudio()
  res.json({ message: 'File uploaded successfully!' });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})