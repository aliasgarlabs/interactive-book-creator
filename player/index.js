var urlParams = new URLSearchParams(window.location.search),
  baseImagePath = "../assets",
  baseAudioPath = "../assets",
  image = document.getElementById("image"),
  audio = document.getElementById("audio"),
  publication = parseInt(urlParams.get('publication')) || 4,
  imagePageNo = parseInt(urlParams.get('page', 16)) || 2,
  audioPageNo = 2,
  playbackRate = 1,
  trackId = 1,
  tracks= [],
  glyphs = [],
  isTracking = false,
  Constants = {
    1: {
      x: 450,
      y: 726,
      pages: 118
    },
    2: {
      pages: 14,
      x: 704,
      y: 1020
    },
    3: {
      pages: 20
    },
    4: {
      pages: 297,
      x: 741,
      y: 1143
    }
  },
  currentImage = {};

  var canvas = document.createElement('canvas');

initializeApp();

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
  if(!_.find(glyphs, (glyph) => glyph.id == trackId)) {
    alert('Glyph for track id ' + trackId + ' is not marked yet.');
    return;
  }
  playSound();
  var time = document.getElementById("audio").currentTime;
  currentTrack = {
    id: trackId,
    page_number: imagePageNo,
    start_time: tracks.length ? tracks[tracks.length-1].end_time: 0,
    end_time: time
  };

  lastTrackEndTime = time;

  tracks.push(currentTrack);
  trackId = glyphs[glyphs.length-1].id +1;;

  updateCurrentTrackIDText();
  invalidateTable();
}

function updateCurrentTrackIDText() {
  document.getElementById("trackId").innerHTML = "Current Track ID: " + trackId;
}

$(function(){

  image.onload = function() {
    currentImage = {
      x: this.width,
      y: this.height
    };
    draw();
  }

$('#imageholder img').on('mousemove', null, [$('#horizontal'), $('#vertical')],function(e){
  e.data[1].css('left', e.offsetX==undefined?e.originalEvent.layerX:e.offsetX);
  e.data[0].css('top', e.offsetY==undefined?e.originalEvent.layerY:e.offsetY);
});

  $(document).mousemove(function(e){
    if (e.pageX > currentImage.x || e.pageY > currentImage.y)
      return;

    // e.data[1].css('left', e.offsetX==undefined?e.originalEvent.layerX:e.offsetX);
    // e.data[0].css('top', e.offsetY==undefined?e.originalEvent.layerY:e.offsetY);

    var realX = parseInt(e.pageX*(Constants[publication].x/currentImage.x)),
      realY =parseInt(e.pageY*(Constants[publication].y/currentImage.y));

      $('#coordinates').html('x: ' + realX  + ' y : ' + realY);
  });



  $(document).mousedown(function(e){
    if (e.pageX > currentImage.x || e.pageY > currentImage.y)
    return;

    var glyphID = collides(e.pageX, e.pageY);
    if (glyphID) {
        alert('collision: ' + glyphID);
    } else {
        console.log('no collision');
    }

    if(_.find(glyphs, (glyph) => trackId == glyph.id)) {
      alert("Please add audio track record for track " + trackId);
      return;
    }

    var realX = parseInt(e.pageX*(Constants[publication].x/currentImage.x)),
      realY =parseInt(e.pageY*(Constants[publication].y/currentImage.y));

    if(!isTracking) {
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
    document.getElementById('tracking').innerHTML= isTracking ? "State: Tracking": "State: Not Tracking";
  });
})

function insertTableRow({ id, page_number,  min_x, min_y, max_x, max_y, start_time, end_time }) {
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

function generateDeleteTrackLink (id) {
  var link = document.createElement("a");
  link.setAttribute("href", "#");
  link.setAttribute("onclick", `deleteRecord(${id})`);

  var linkText = document.createTextNode("Delete");
  link.appendChild(linkText);
  return link;
}

function deleteRecord() {
  var glyphID = glyphs[glyphs.length-1].id, // get last glyph record
    glyphIndex = _.findIndex(glyphs, (glyph) => glyphID == glyph.id);
    trackIndex = _.findIndex(tracks, (track) => glyphID == track.id);

  glyphs.splice(glyphIndex, 1);

  if(trackIndex!=null)
    tracks.splice(trackIndex, 1);

  trackId= glyphs[glyphs.length-1].id +1 ;
  updateCurrentTrackIDText();
  invalidateTable();
  draw();
}

function saveFile(){
  var file = {
    glyphs: glyphs,
    tracks: tracks
  };

  var a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(JSON.stringify(file)));
  a.setAttribute('download', 'data.json');
  a.click()
}

function loadFile() {
  document.getElementById("fileUpload").style="display: block;"
}

function onFileUpload() {
  var files = document.getElementById("myFile").files;

  var fr = new FileReader();

  fr.onload = function(e) {
  try{
    var result = JSON.parse(e.target.result);
    console.log(result);
    loadData(result);
  } catch(e) {
    alert('Invalid file');
  }
  }

  fr.readAsText(files.item(0));
  // alert(file);
  document.getElementById("fileUpload").style="display: none;"
}

function loadData(data) {
  glyphs = data.glyphs;
  tracks = data.tracks;
  invalidateTable();
  trackId = tracks.length ? tracks[tracks.length-1].id: 1;
  trackId++;
  lastTrackEndTime = tracks.length ? tracks[tracks.length-1].end_time: 0;
  updateCurrentTrackIDText();
}

function deleteAudioMarker() {
  var glyphID = glyphs[glyphs.length-1].id, // get last glyph record
    trackIndex = _.findIndex(tracks, (track) => glyphID == track.id);

    console.log(glyphID, trackIndex)
  if(trackIndex!=-1) {
    trackId = glyphID;
    tracks.splice(trackIndex, 1);
    updateCurrentTrackIDText();
    invalidateTable();
  } else {
    alert("Last record not set anyway.");
  }

}

function invalidateTable() {
  var table = document.getElementById("table");

  while(table.rows.length > 1) {
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
        start_time: tracks.length && tracks[trackIndex] ? tracks[trackIndex].start_time: NaN,
        end_time: tracks.length && tracks[trackIndex]? tracks[trackIndex].end_time : NaN
     });
  });
}
function seekToTime(time) {
  audio.currentTime = time;
}

function generatePlayLink (time) {
  var link = document.createElement("a");
  link.setAttribute("href", "#");
  link.setAttribute("onclick", `seekToTime(${time/1000})`);

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

  if (page > 0 && page <= Constants[publication].pages) {
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

function playSound() {
  var sound = document.getElementById("beep");
  sound.play();
}

setPlaybackRate();

function previous() {
  if (imagePageNo <= 1) return;

  imagePageNo = imagePageNo - 1;
  renderImage();
}


function gotoPage(page) {
  if (page <= 1) return;
  if (page > Constants[publication].pages) return;

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
  if (imagePageNo > Constants[publication].pages) {
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

function generateTrackDB() {
  let visited = [];
  let currentOffset;

  let pageOffsetTracks = _.map(tracks, (track) => {
    if(!visited.includes(track.page_number)) {
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
    return `INSERT INTO audio_bihori VALUES (${track.id}, ${track.page_number}, "FALSE", ${parseInt(track.page_start_time*1000)}, ${parseInt(track.page_end_time*1000)})`;
  }).join(';\n');

  console.log(sqlQueries);

  var a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(sqlQueries));
  a.setAttribute('download', 'sqlQueries.sql');
  a.click()
}

function generateGlyphDB() {
  let sqlQueries = _.map(glyphs, (glyph) => {
    return `INSERT INTO glyphs_bihori VALUES (${glyph.id}, ${glyph.page_number}, ${glyph.min_x}, ${glyph.min_y}, ${glyph.max_x}, ${glyph.max_y})`;
  }).join(';\n');

  console.log(sqlQueries);

  var a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(sqlQueries));
  a.setAttribute('download', 'sqlQueries.sql');
  a.click()
}

loadJSONData();

function loadJSONData () {
  if(glyphs.length ==0 ) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', '../scripts/data/data_4.json', true); // Replace 'my_data' with the path to your file
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
  canvas.style.width='100%';
  canvas.style.height='100%';
  //Set canvas drawing area width/height
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  //Position canvas
  canvas.style.position='absolute';
  canvas.style.left=0;
  canvas.style.top=0;
  canvas.style.zIndex=100000;
  canvas.style.pointerEvents='none'; //Make sure you can click 'through' the canvas
  document.body.appendChild(canvas); //Append canvas to body element
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);

  _.forEach(glyphs, (glyph) => {
    if(glyph.page_number == imagePageNo) {
      //Position parameters used for drawing the rectangle
      let { min_x, min_y, max_x, max_y} = glyph;

      console.log(min_x, min_y, max_x, max_y);


      var ratioX = parseFloat(currentImage.x/Constants[publication].x),
      ratioY = parseFloat(currentImage.y/Constants[publication].y);
      var x = min_x * ratioX;
      var y = min_y * ratioY;
      var width = (max_x-min_x) *ratioX;
      var height = (max_y-min_y) * ratioY;

      console.log(imagePageNo, x, y, width, height);

      // Check if track is available
    var trackIndex = _.findIndex(tracks, (track) => glyph.id == track.id);

    let color = "rgba(0, 150, 50, 0.2)";

    if(trackIndex < 0) {

    // Yellow if track not done
      "rgba(0, 150, 150, 0.2)"
    }
      //Draw rectangle
      context.rect(x, y, width, height);
      context.fillStyle = color;
      context.fill();

      context.fillStyle = "red";
      context.font = "30px Arial";
      context.fillText(glyph.id, x, y);
    }
  });


}

let p = {
  "publications": [
    {
      "id": 1,
      "name": "Bihori",
      "segments": [
        {
          "id": 1,
          "name": "صلاة الاستفتاح",
          "start_page": 2,
          "end_page": 11
        },
        {
          "id": 2,
          "name": "صلاة نصف الليل",
          "start_page": 12,
          "end_page": 30
        },
        {
          "id": 3,
          "name": "صلاة مغفرة الذنوب",
          "start_page": 30,
          "end_page": 39
        },
        {
          "id": 4,
          "name": "قضاء الحوائج",
          "start_page": 39,
          "end_page": 54
        },
        {
          "id": 5,
          "name": "صلاة التهجد",
          "start_page": 55,
          "end_page": 70
        },
        {
          "id": 6,
          "name": "صلاة وحشة القبور",
          "start_page": 70,
          "end_page": 79
        },
        {
          "id": 7,
          "name": "صلاة كشف الهم والغم",
          "start_page": 79,
          "end_page": 83
        },
        {
          "id": 8,
          "name": "صلاة طلب الرزق الواسع",
          "start_page": 83,
          "end_page": 87
        },
        {
          "id": 9,
          "name": "صلاة طلب العافية",
          "start_page": 87,
          "end_page": 92
        },
        {
          "id": 10,
          "name": "صلاة نور القبر",
          "start_page": 92,
          "end_page": 95
        },
        {
          "id": 11,
          "name": "صلاة خاتمة الخير",
          "start_page": 95,
          "end_page": 99
        },
        {
          "id": 12,
          "name": "صلاة قبول الصلاة والصيام",
          "start_page": 99,
          "end_page": 102
        },
        {
          "id": 13,
          "name": "صلاة الشفع",
          "start_page": 102,
          "end_page": 999
        },
        {
          "id": 14,
          "name": "صلاة الوتر",
          "start_page": 103,
          "end_page": 105
        },
        {
          "id": 15,
          "name": "صلاة الجلوس",
          "start_page": 105,
          "end_page": 113
        },
        {
          "id": 16,
          "name": "معطي السؤالات",
          "start_page": 117,
          "end_page": 118
        }
      ],
      "pageCount": 118
    },
    {
      "id": 2,
      "name": "Daska",
      "segments": [
        {
          "id": 1,
          "name": "Daska 1 First Dua",
          "start_page": 1,
          "end_page": 2
        },
        {
          "id": 2,
          "name": "Daska 1 Second Dua",
          "start_page": 3,
          "end_page": 4
        },
        {
          "id": 3,
          "name": "Daska 2 First Dua",
          "start_page": 5,
          "end_page": 6
        },
        {
          "id": 4,
          "name": "Daska 2 Second Dua",
          "start_page": 6,
          "end_page": 9
        },
        {
          "id": 5,
          "name": "Daska 3 First Dua",
          "start_page": 9,
          "end_page": 11
        },
        {
          "id": 6,
          "name": "Daska 3 Second Dua",
          "start_page": 11,
          "end_page": 14
        }
      ],
      "pageCount": 14
    },
    {
      "id": 3,
      "name": "Fajr",
      "segments": [
        {
          "id": 1,
          "name": "دعاء",
          "start_page": 2,
          "end_page": 13
        },
        {
          "id": 2,
          "name": "روزه ني نية",
          "start_page": 14,
          "end_page": 16
        },
        {
          "id": 3,
          "name": "فحوى",
          "start_page": 17,
          "end_page": 30
        }
      ],
      "pageCount": 30
    }
  ]
};

console.log(JSON.stringify(p));

function collides(x, y) {
  _.forEach(glyphs, (glyph) => {
    if(glyph.page_number == imagePageNo) {
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

