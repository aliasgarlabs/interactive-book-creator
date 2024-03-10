let _ = require('lodash'),
  fs = require('fs'),
  $ = require('shelljs'),
  audioFile = './../uploads/audio.mp3',
  datafile = './uploads/data.json';
var splitAudio = () => {

  var data = JSON.parse(fs.readFileSync(datafile, 'utf8'));

  console.log(data.track);

  let pageWise = _.transform(data.tracks, (result, track) => {

    if (!result[track.page_number]) {

      result[track.page_number] = [];
    }

    result[track.page_number].push(track);
  }, {});


  let splitLocations = _.transform(pageWise, (result, page) => {
    let start_time = page[0].start_time,
      end_time = page[page.length - 1].end_time;
    result.push({ page_number: page[0].page_number, start_time, end_time })
  }, []);

  console.log(splitLocations);

  $.cd('output');

  _.each(splitLocations, (splitLocation) => {
    console.log("running ffmpeg");
    $.exec(`ffmpeg -i ${audioFile} -acodec copy -ss ${splitLocation.start_time} -to ${splitLocation.end_time}  Page${zeroFill(splitLocation.page_number, 3)}.mp3`)
  });

  $.cd('..');

  function zeroFill(number, width) {
    width -= number.toString().length;
    if (width > 0) {
      return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number + ""; // always return a string
  }

}

// Create the multer instance
const audio_processor = {
  splitAudio,
}

module.exports = audio_processor;