var urlParams = new URLSearchParams(window.location.search),
  baseImagePath = "../assets",
  baseAudioPath = "../assets",
  image = document.getElementById("image"),
  audio = document.getElementById("audio"),
  publication = parseInt(urlParams.get('publication')) || 4,
  imagePageNo = parseInt(urlParams.get('page', 16)) || 2,
  audioPageNo = 2,
  playbackRate = 1,
  trackId = parseInt(urlParams.get('track')) || 1,
  tracks = [],
  glyphs = [],
  isTracking = false,
  Constants = {
    1: {
      pages: 118
    },
    2: {
      pages: 14
    },
    3: {
      pages: 38
    },
    4: {
      pages: 297,

    },
    5: {
      pages: 297
    },
    6: {
      pages: 24
    }
  },
  currentImage = {};

var canvas = document.createElement('canvas'),
  newcanvas = document.createElement('canvas');

initializeApp();

let x = {
  "id": 6,
  "name": "Mohta Bawisa",
  "segments": [
    {
      "id": 1,
      "name": "Qadail Hawaij",
      "start_page": 1,
      "end_page": 1
    },
    {
      "id": 2,
      "name": "Rasullah SAW na janaab ni taraf hadiyat",
      "start_page": 2,
      "end_page": 3
    },
    {
      "id": 3,
      "name": "Moulana Ali AS na janaab ni taraf hadiyat",
      "start_page": 4,
      "end_page": 8
    },
    {
      "id": 4,
      "name": "Moulatana Fatema AS na janaab ni taraf hadiyat",
      "start_page": 9,
      "end_page": 10
    },
    {
      "id": 5,
      "name": "Imam Hasan AS na janaab ni taraf hadiyat",
      "start_page": 10,
      "end_page": 12
    },
    {
      "id": 6,
      "name": "Imam Husain AS na janaab ni taraf hadiyat",
      "start_page": 12,
      "end_page": 15
    },
    {
      "id": 7,
      "name": "Moulana Abbas AS na janaab ni taraf hadiyat",
      "start_page": 15,
      "end_page": 17
    },
    {
      "id": 8,
      "name": "Karbala Shohada AS na janaab ni taraf hadiyat",
      "start_page": 17,
      "end_page": 19
    },
    {
      "id": 9,
      "name": "Imam uz Zaman AS na janaab ni taraf hadiyat",
      "start_page": 19,
      "end_page": 19
    },
    {
      "id": 10,
      "name": "Imam Ali Zainulabedin AS na janaab ni taraf hadiyat",
      "start_page": 19,
      "end_page": 22
    }
  ],
  "pageCount": 24
};

console.log(JSON.stringify(x));

function play() {
  if (!audio.readyState) {

    audioPageNo = imagePageNo;
    audio.autoplay = true;
    document.getElementById('playerState').innerHTML = 'Pause';
  }
  audio.src = baseAudioPath + "/audio/" + publication + ".mp3"
  setPlaybackRate();
}


function setEndTimeForCurrentTrackID() {
  if (!_.find(glyphs, (glyph) => glyph.id == trackId)) {
    alert('Glyph for track id ' + trackId + ' is not marked yet.');
    return;
  }

  var time = document.getElementById("audio").currentTime;
  currentTrack = {
    id: trackId,
    page_number: imagePageNo,
    start_time: tracks.length ? tracks[tracks.length - 1].end_time : 0,
    end_time: time
  };

  lastTrackEndTime = time;

  tracks.push(currentTrack);
  trackId = glyphs[glyphs.length - 1].id + 1;;

  updateCurrentTrackIDText();
  invalidateTable();
  draw();
}

function updateCurrentTrackIDText() {
  document.getElementById("trackId").innerHTML = "Current Track ID: " + trackId;
}

$(function () {

  image.onload = function () {
    currentImage = {
      x: this.width,
      y: this.height,
      naturalWidth : this.naturalWidth,
      naturalHeight: this.naturalHeight
    };
    draw();
  }

  $('#imageholder img').on('mousemove', null, [$('#horizontal'), $('#vertical')], function (e) {
    e.data[1].css('left', e.offsetX == undefined ? e.originalEvent.layerX : e.offsetX);
    e.data[0].css('top', e.offsetY == undefined ? e.originalEvent.layerY : e.offsetY);
  });

  $(document).mousemove(function (e) {
    if (e.pageX > currentImage.x || e.pageY > currentImage.y)
      return;

    // e.data[1].css('left', e.offsetX==undefined?e.originalEvent.layerX:e.offsetX);
    // e.data[0].css('top', e.offsetY==undefined?e.originalEvent.layerY:e.offsetY);

    var realX = parseInt(e.pageX * (currentImage.naturalWidth / currentImage.x)),
      realY = parseInt(e.pageY * (currentImage.naturalHeight / currentImage.y));

    $('#coordinates').html('x: ' + realX + ' y : ' + realY);
  });



  $(document).mousedown(function (e) {
    if (e.pageX > currentImage.x || e.pageY > currentImage.y)
      return;

    var realWidth = currentImage.naturalWidth;
    var realHeight = currentImage.naturalHeight;
    // alert(realWidth +"x"+ realHeight);

    var glyphID = collides(e.pageX, e.pageY);
    if (glyphID) {
      alert('collision: ' + glyphID);
    } else {
      console.log('no collision');
    }

    if (_.find(glyphs, (glyph) => trackId == glyph.id)) {
      alert("Please add audio track record for track " + trackId);
      return;
    }

    var realX = parseInt(e.pageX * (currentImage.naturalWidth / currentImage.x)),
      realY = parseInt(e.pageY * (currentImage.naturalHeight / currentImage.y));

    if (!isTracking) {
      currentGlyph = {
        id: trackId,
        page_number: imagePageNo,
        min_x: realX,
        min_y: realY
      }
    } else {
      currentGlyph.max_x = realX;
      currentGlyph.max_y = realY;
      glyphs.push(currentGlyph);

      console.log(JSON.stringify(tracks));
      insertTableRow(currentGlyph);
      draw();
    }
    isTracking = !isTracking;
    document.getElementById('tracking').innerHTML = isTracking ? "State: Tracking" : "State: Not Tracking";
  });
})

function insertTableRow({ id, page_number, min_x, min_y, max_x, max_y, start_time, end_time }) {
  // Find a <table> element with id="myTable":
  var table = document.getElementById("table");

  // Create an empty <tr> element and add it to the 1st position of the table:
  var row = table.insertRow(-1);

  // Insert new cells (<td> elements) at the 1st and 2nd position of the "new" <tr> element:
  var cell1 = row.insertCell(0);
  var cell2 = row.insertCell(1);
  var cell3 = row.insertCell(2);
  var cell4 = row.insertCell(3);
  var cell5 = row.insertCell(4);
  var cell6 = row.insertCell(5);
  var cell7 = row.insertCell(6);
  var cell8 = row.insertCell(7);

  // Add some text to the new cells:
  cell1.innerHTML = id;
  cell2.innerHTML = page_number;
  cell3.innerHTML = min_x;
  cell4.innerHTML = min_y;
  cell5.innerHTML = max_x;
  cell6.innerHTML = max_y;
  cell7.appendChild(generatePlayLink(parseInt(start_time * 1000)));
  cell8.appendChild(generatePlayLink(parseInt(end_time * 1000)));
}

function generateDeleteTrackLink(id) {
  var link = document.createElement("a");
  link.setAttribute("href", "#");
  link.setAttribute("onclick", `deleteRecord(${id})`);

  var linkText = document.createTextNode("Delete");
  link.appendChild(linkText);
  return link;
}

function deleteRecord() {
  var glyphID = glyphs[glyphs.length - 1].id, // get last glyph record
    glyphIndex = _.findIndex(glyphs, (glyph) => glyphID == glyph.id);
  trackIndex = _.findIndex(tracks, (track) => glyphID == track.id);

  glyphs.splice(glyphIndex, 1);

  if (trackIndex != -1)
    tracks.splice(trackIndex, 1);

  trackId = glyphs[glyphs.length - 1].id + 1;
  updateCurrentTrackIDText();
  invalidateTable();
  draw();
}

function saveFile() {
  var file = {
    glyphs: glyphs,
    tracks: tracks
  };

  var a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(file)));
  a.setAttribute('download', 'data.json');
  a.click()
}

function loadFile() {
  document.getElementById("fileUpload").style = "display: block;"
}

function onFileUpload() {
  var files = document.getElementById("myFile").files;

  var fr = new FileReader();

  fr.onload = function (e) {
    try {
      var result = JSON.parse(e.target.result);
      console.log(result);
      loadData(result);
    } catch (e) {
      alert('Invalid file');
    }
  }

  fr.readAsText(files.item(0));
  // alert(file);
  document.getElementById("fileUpload").style = "display: none;"
}

function loadData(data) {
  glyphs = data.glyphs;
  tracks = data.tracks;
  invalidateTable();
  trackId = tracks.length ? tracks[tracks.length - 1].id : 1;
  trackId++;
  lastTrackEndTime = tracks.length ? tracks[tracks.length - 1].end_time : 0;
  updateCurrentTrackIDText();
  draw();
}

function deleteAudioMarker() {
  var glyphID = glyphs[glyphs.length - 1].id, // get last glyph record
    trackIndex = _.findIndex(tracks, (track) => glyphID == track.id);

  console.log(glyphID, trackIndex)
  if (trackIndex != -1) {
    trackId = glyphID;
    tracks.splice(trackIndex, 1);
    updateCurrentTrackIDText();
    invalidateTable();
    draw();
  } else {
    alert("Last record not set anyway.");
  }
}

function invalidateTable() {
  var table = document.getElementById("table");

  while (table.rows.length > 1) {
    table.deleteRow(1);
  }

  _.forEach(glyphs, (glyph) => {
    var trackIndex = _.findIndex(tracks, (track) => glyph.id == track.id);

    insertTableRow({
      id: glyph.id,
      page_number: glyph.page_number,
      min_x: glyph.min_x,
      min_y: glyph.min_y,
      max_x: glyph.max_x,
      max_y: glyph.max_y,
      start_time: tracks.length && tracks[trackIndex] ? tracks[trackIndex].start_time : NaN,
      end_time: tracks.length && tracks[trackIndex] ? tracks[trackIndex].end_time : NaN
    });
  });
}
function seekToTime(time) {
  audio.currentTime = time;
}

function generatePlayLink(time) {
  var link = document.createElement("a");
  link.setAttribute("href", "#");
  link.setAttribute("onclick", `seekToTime(${time / 1000})`);

  var linkText = document.createTextNode(time);
  link.appendChild(linkText);
  return link;
}
function updatePlayerState() {
  if (!audio.paused) {
    document.getElementById('playerState').innerHTML = 'Pause';
  } else {
    document.getElementById('playerState').innerHTML = 'Play';
  }
}

function switchPublication(newPublication) {
  publication = newPublication;
  imagePageNo = 1;
  audioPageNo = 1;
  initializeApp();
}

function togglePlayback() {
  if (!audio.readyState) {
    play();
  }

  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }

  updatePlayerState();
}

function changeSpeed(speed) {
  playbackRate = speed;
  setPlaybackRate();
}

function gotopagePrompt() {
  let page = prompt('Enter page number');

  if (page == null) {
    return;
  }

  page = parseInt(page);

  if (page > 0 ) { // && page <= Constants[publication].pages
    gotoPage(page);
  } else {
    alert('Invalid page.');
  }
}

document.getElementById("pageNo").innerHTML = "Page " + imagePageNo;

function minus5secs() {
  audio.currentTime = audio.currentTime - 5;
}

function add5secs() {
  audio.currentTime = audio.currentTime + 5;
}

function toggleToolbars() {
  if (document.getElementById("bottom").style.display == 'none') {
    document.getElementById("top").style.display = 'block';
    document.getElementById("bottom").style.display = 'block';

  } else {
    document.getElementById("top").style.display = 'none';
    document.getElementById("bottom").style.display = 'none';
  }
}

function slower() {
  playbackRate = playbackRate - 0.5;
  setPlaybackRate();
}

function faster() {
  playbackRate = playbackRate + 0.5;
  setPlaybackRate();
}

function initializeApp() {
  renderImage();
}

function openList() {
  window.location = '/web?publication=' + publication;
}
function setPlaybackRate() {
  audio.playbackRate = playbackRate;
  document.getElementById("speed").textContent = "Speed " + playbackRate + "x";
}

function zeroFill(number, width) {
  width -= number.toString().length;
  if (width > 0) {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
  }
  return number + ""; // always return a string
}

document.onkeydown = checkKey;

function checkKey(e) {
  e = e || window.event;

  if (e.keyCode == '80') {
    // p
    togglePlayback();
  }
  else if (e.keyCode == '83') {
    // s
    setEndTimeForCurrentTrackID();
  }
  else if (e.keyCode == '82') {
    // r
    deleteAudioMarker();
  }
  else if (e.keyCode == '68') {
    // d
    deleteRecord();
  }
  else if (e.keyCode == '90') {
    // z
    minus5secs();
  }
  else if (e.keyCode == '88') {
    // x
    add5secs();
  }
  else if (e.keyCode == '37') {
    // right arrow
    next();

  } else if (e.keyCode == '39') {
    // right arrow
    previous();
  }

}

setPlaybackRate();

function previous() {
  // if (imagePageNo <= 1) return;

  imagePageNo = imagePageNo - 1;
  renderImage();
}


function gotoPage(page) {
  if (page <= 1) return;
  // if (page > Constants[publication].pages) return;

  imagePageNo = page;
  renderImage();
}

function renderImage() {
  urlParams.set('publication', publication);
  urlParams.set('page', imagePageNo);
  window.history.replaceState({}, '', `${location.pathname}?${urlParams}`);

  document.getElementById('pageNo').innerHTML = "Page " + imagePageNo;

  image.src = ""; // force loader to be seen
  image.src = baseImagePath + "/pages/" + publication + "/" + imagePageNo + ".jpg";
}

function next() {
  if (Constants[publication] && Constants[publication].pages && imagePageNo > Constants[publication].pages) {
    return;
  }

  imagePageNo = imagePageNo + 1;
  renderImage();
}

function resetSeekbar() {
  document.getElementById('seekbar').max = audio.duration;

}
function updateSeekbar() {
  document.getElementById('currentTime').innerHTML = zeroFill(parseInt(audio.currentTime / 60), 2) + ":" + zeroFill(parseInt(audio.currentTime % 60), 2);
  document.getElementById('duration').innerHTML = zeroFill(parseInt(audio.duration / 60), 2) + ":" + zeroFill(parseInt(audio.duration % 60), 2);
  document.getElementById('seekbar').value = audio.currentTime;
}
function seek() {
  audio.currentTime = document.getElementById('seekbar').value;
}

audio.onended = function () {
  audioPageNo = audioPageNo + 1;
  imagePageNo = audioPageNo;
  renderImage();
  play();
};

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function getTouches(evt) {
  return evt.touches ||             // browser API
    evt.originalEvent.touches; // jQuery
}

function handleTouchStart(evt) {
  const firstTouch = getTouches(evt)[0];
  xDown = firstTouch.clientX;
  yDown = firstTouch.clientY;
};

function handleTouchMove(evt) {
  if (!xDown || !yDown) {
    return;
  }

  var xUp = evt.touches[0].clientX;
  var yUp = evt.touches[0].clientY;

  var xDiff = xDown - xUp;
  var yDiff = yDown - yUp;

  if (Math.abs(xDiff) > Math.abs(yDiff)) {/*most significant*/
    if (xDiff > 0) {
      /* left swipe */
      previous();
    } else {
      /* right swipe */
      next();
    }
  } else {
    if (yDiff > 0) {
      /* up swipe */
    } else {
      /* down swipe */
    }
  }
  /* reset values */
  xDown = null;
  yDown = null;
};
var onlongtouch;
var timer;
var touchduration = 500; //length of time we want the user to touch before we do something

function touchstart() {
  timer = setTimeout(onlongtouch, touchduration);
}

function touchend() {

  //stops short touches from firing the event
  if (timer)
    clearTimeout(timer); // clearTimeout, not cleartimeout..
}

onlongtouch = function () {
  playThisPage();
};

function showShortcuts() {
  alert("Shortcuts \ns - set end time\nz - minus 5 secs\nx - plus 5 secs\nd - delete latest entry\nr - reset latest audio marking");
}

function generateTrackDB() {
  let visited = [];
  let currentOffset;

  let pageOffsetTracks = _.map(tracks, (track) => {
    if (!visited.includes(track.page_number)) {
      currentOffset = track.start_time;
      visited.push(track.page_number);
    }

    return {
      ...track,
      page_start_time: track.start_time - currentOffset,
      page_end_time: track.end_time - currentOffset
    }
  });

  let sqlQueries = _.map(pageOffsetTracks, (track) => {
    return `INSERT INTO audio_bihori VALUES (${track.id}, ${track.page_number}, "FALSE", ${parseInt(track.page_start_time * 1000)}, ${parseInt(track.page_end_time * 1000)})`;
  }).join(';\n');

  console.log(sqlQueries);

  var a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(sqlQueries));
  a.setAttribute('download', 'sqlQueries.sql');
  a.click()
}

function generateGlyphDB() {
  let sqlQueries = _.map(glyphs, (glyph) => {
    return `INSERT INTO glyphs_bihori VALUES (${glyph.id}, ${glyph.page_number}, ${glyph.min_x}, ${glyph.min_y}, ${glyph.max_x}, ${glyph.max_y})`;
  }).join(';\n');

  console.log(sqlQueries);

  var a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(sqlQueries));
  a.setAttribute('download', 'sqlQueries.sql');
  a.click()
}

// loadJSONData();

function loadJSONData() {
  if (glyphs.length == 0) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', '../assets/data/4_1.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
      if (xobj.readyState == 4 && xobj.status == "200") {
        // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
        loadData(JSON.parse(xobj.responseText));
      }
    };
    xobj.send(null);
  }
}

// // listener, using W3C style for example
// canvas.addEventListener('click', function(e) {
//   alert("Clicked");
//   console.log('click: ' + e.offsetX + '/' + e.offsetY);
//   var glyphID = collides(e.offsetX, e.offsetY);
//   if (glyphID) {
//       alert('collision: ' + glyphID);
//   } else {
//       console.log('no collision');
//   }
// }, false);

function draw() {
  //Create a canvas element
  //Set canvas width/height
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  //Set canvas drawing area width/height
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  //Position canvas
  canvas.style.position = 'absolute';
  canvas.style.left = 0;
  canvas.style.top = 0;
  canvas.style.zIndex = 100000;
  canvas.style.pointerEvents = 'none'; //Make sure you can click 'through' the canvas
  document.body.appendChild(canvas); //Append canvas to body element
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  _.forEach(glyphs, (glyph) => {
    if (glyph.page_number == imagePageNo) {
      //Position parameters used for drawing the rectangle
      let { min_x, min_y, max_x, max_y } = glyph;

      console.log(min_x, min_y, max_x, max_y);


      var ratioX = parseFloat(currentImage.x / currentImage.naturalWidth),
        ratioY = parseFloat(currentImage.y / currentImage.naturalHeight);
      var x = min_x * ratioX;
      var y = min_y * ratioY;
      var width = (max_x - min_x) * ratioX;
      var height = (max_y - min_y) * ratioY;

      console.log(imagePageNo, x, y, width, height);

      // Check if track is available
      var trackIndex = _.findIndex(tracks, (track) => glyph.id == track.id);

      let color;

      if (trackIndex < 0) {
        console.log(trackIndex)
        // Red if track not done
        color = "rgba(100, 0, 0, 0.2)" //red
      } else
        color = "rgba(0, 150, 0, 0.2)"; // blue
      //Draw rectangle
      context.fillStyle = color;
      context.fillRect(x, y, width, height);
      context.strokeStyle = "#FF0000";
      context.strokeRect(x, y, width, height);


      context.fillStyle = "red";
      context.font = "30px Arial";
      context.fillText(glyph.id, x, y);
    }
  });

  return;
  getPixelData();
}

function collides(x, y) {
  _.forEach(glyphs, (glyph) => {
    if (glyph.page_number == imagePageNo) {
      var left = glyph.min_x,
        right = glyph.max_x;
      var top = glyph.min_y, bottom = glyph.max_y;
      if (right >= x
        && left <= x
        && bottom >= y
        && top <= y) {
        return glyph.id;
      }
    }
  });

  return 0;
}

let lines = [[
  3,
  1,
  39,
  96
],
[
  3,
  2,
  96,
  156
],
[
  3,
  3,
  156,
  216
],
[
  3,
  4,
  216,
  278
],
[
  3,
  5,
  278,
  336
],
[
  3,
  6,
  336,
  396
],
[
  3,
  7,
  396,
  458
],
[
  3,
  8,
  458,
  518
],
[
  3,
  9,
  518,
  579
],
[
  3,
  10,
  579,
  638
],
[
  3,
  11,
  638,
  700
],
[
  3,
  12,
  700,
  760
],
[
  3,
  13,
  760,
  823
],
[
  3,
  14,
  823,
  882
],
[
  3,
  15,
  882,
  944
]
];

function getPixelData() {
  var img = document.getElementById('image');

  //Create a canvas element
  //Set canvas width/height
  // newcanvas.style.width='100%';
  // newcanvas.style.height='100%';
  //Set canvas drawing area width/height
  newcanvas.width = img.width;
  newcanvas.height = img.height;
  //Position canvas
  newcanvas.style.position = 'absolute';
  newcanvas.style.left = 0;
  newcanvas.style.top = 0;
  newcanvas.style.zIndex = 100000;
  newcanvas.style.pointerEvents = 'none'; //Make sure you can click 'through' the canvas
  document.body.appendChild(newcanvas); //Append canvas to body element
  color = "rgba(0, 150, 0, 0.2)"

  var ratioX = parseFloat(currentImage.x / currentImage.naturalWidth),
    ratioY = parseFloat(currentImage.y / currentImage.naturalHeight);

  var newcontext = newcanvas.getContext('2d');
  newcontext.drawImage(img, 0, 0, img.width, img.height);

  let pageBorders = getBorder();
  let line_start = img.width - (pageBorders.right);
  let line_end = pageBorders.left;
  let blob_width = 2;
  let blob_margin = 10;
  let x_offset = 0;

  let gaps = [];
  _.each(lines, (line) => {
    // if (line[1] != 3) return;
    console.log(line[2], line[3]);

    let min_y = line[2] * ratioY,
      max_y = line[3] * ratioY;
    // newcontext.fillStyle = "rgba(0, 150, 150, 0.2)";
    // newcontext.fillRect(pageBorders.left * ratioX, min_y, img.width-(pageBorders.right), (max_y- min_y));
    // newcontext.stroke();


    let lastIsWhite = false,
      lastWhiteX = 0;

    let y = min_y + blob_margin,
      w = blob_width,
      h = max_y - min_y - (blob_margin * 2),
      padding = 1;
    for (i = 0; i < img.width; i++) {

      let x = line_start - blob_width - i;

      let didFindTheGap = handleCanvasTouch(x, y, w, h);
      if (didFindTheGap) {
        if (!lastIsWhite) {
          lastIsWhite = true;
          lastWhiteX = (x + (w / 2)) / ratioX;

        }
      } else {
        if (lastIsWhite) {
          let finalX = (lastWhiteX + ((x + (w / 2)) / ratioX)) / 2;
          gaps.push({ x: finalX, y, w, h });
        }
        lastIsWhite = false;
        lastWhiteX = 0;
      }
    }

  });


  console.log(gaps);

  _.each(gaps, (g) => {
    newcontext.lineWidth = 1;
    newcontext.fillStyle = "rgba(255, 0, 0, 0.4)";
    newcontext.fillRect(g.x * ratioX, g.y - 5, g.w, g.h + 10);
  });

}

BORDER_LEFT_AL_MUSHAF_ODD = 12;
BORDER_TOP_AL_MUSHAF_ODD = 15;
BORDER_RIGHT_AL_MUSHAF_ODD = 116;
BORDER_BOTTOM_AL_MUSHAF_ODD = 92;
BORDER_LEFT_AL_MUSHAF_EVEN = 108;
BORDER_TOP_AL_MUSHAF_EVEN = BORDER_TOP_AL_MUSHAF_ODD;
BORDER_RIGHT_AL_MUSHAF_EVEN = 18;
BORDER_BOTTOM_AL_MUSHAF_EVEN = BORDER_BOTTOM_AL_MUSHAF_ODD;


function getBorder() {

  if (imagePageNo % 2 == 0) {
    return { left: BORDER_LEFT_AL_MUSHAF_EVEN, right: BORDER_RIGHT_AL_MUSHAF_EVEN }
  } else {
    return { left: BORDER_LEFT_AL_MUSHAF_ODD, right: BORDER_RIGHT_AL_MUSHAF_ODD }
  }

}


function handleCanvasTouch(x, y, w, h) {
  // var realX = parseInt(x*(Constants[publication].x/currentImage.x)),
  // realY =parseInt(y*(Constants[publication].y/currentImage.y));

  var pixelData = newcanvas.getContext('2d').getImageData(x, y, w, h).data;
  var whiteCount = 0;
  let colors = [];

  for (var i = 0; i < pixelData.length; i += 4) {
    let color = rgbToHex(pixelData[i], pixelData[i + 1], pixelData[i + 2]);
    if (!colors[color]) {
      colors[color] = {
        count: 0
      }
    }

    if (color == "#ffffff" || color == "#fefefe" || color == "#fdfdfd") {
      if (!colors["#ffffff"])
        colors["#ffffff"] = { count: 0 };
      whiteCount++;
      colors["#ffffff"].count++;
    }
    else
      colors[color].count++;

  }

  // console.log(colors);

  console.log(whiteCount / (pixelData.length / 4));
  if (whiteCount / (pixelData.length / 4) == 1) {
    return true
  }
  return false;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}
