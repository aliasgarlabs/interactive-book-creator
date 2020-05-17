let _ = require('lodash'),
  $ = require('shelljs'),
  audioFile = '/Users/aliasgar/projects/book-digitizer/assets/audio/10.mp3',
  path = 'scripts/output',
  data = require('/Users/aliasgar/Downloads/data (52).json');

$.cd(path);

//   rowIdOffset = 3;

//   tracksnew = _.map(data.tracks, (track) => {
//     track.id = track.id+rowIdOffset;
//     return track;
//   });


//   glyphsnew = _.map(data.glyphs, (track) => {
//     track.id = track.id+rowIdOffset;
//     return track;
//   });


// console.log(JSON.stringify({ tracks: tracksnew, glyphs: glyphsnew }));



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


_.each(splitLocations, (splitLocation) => {
  // if(splitLocation.page_number>283)
    $.exec(`ffmpeg -i ${audioFile} -acodec copy -ss ${splitLocation.start_time} -to ${splitLocation.end_time} Page${zeroFill(splitLocation.page_number, 3)}.mp3`)
});


function zeroFill(number, width) {
  width -= number.toString().length;
  if (width > 0) {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
  }
  return number + ""; // always return a string
}
