var urlParams = new URLSearchParams(window.location.search),
  baseImagePath = "./assets",
  baseAudioPath = "./assets",
  audio = document.getElementById("audio"),
  publication = parseInt(urlParams.get('publication')) || 1,
  imagePageNo = 2,
  audioPageNo = 2,
  ibadatCollection,
  playbackRate = 1,
  Constants = {
    '1': {
      pages: 118
    },
    '2': {
      pages: 5
    },
    '3': {
      pages: 20
    }
  };

initializeApp();

function initializeApp() {
  // Set current tab active
  $('.nav-tabs a[href="#' + publication + '"]').tab('show');

  loadSegmentsJSON((response) => {
    ibadatCollection = JSON.parse(response);

    cleanList();
    _.each(ibadatCollection.publications, (pub) => {
      if (pub.id == publication) {
        _.each(pub.segments, (segment) => {
          appendList(segment.name, segment.start_page);
        })
      }
    });
  });
}

$('li a').click(function (e) {
  e.preventDefault();
  $('a').removeClass('active');
  $(this).addClass('active');
});

function switchPublication(newPublication) {
  publication = newPublication;
  initializeApp();
}

function listClicked(page) {
  window.location = 'player?publication=' + publication + '&page=' + page;
}

function cleanList() {
  document.getElementById("navigation-list").innerHTML = '';
}

function appendList(name, page) {
  var ul = document.getElementById("navigation-list");
  var li = document.createElement("li");
  var badge = document.createElement("span");
  badge.setAttribute("class", "badge badge-primary badge-pill"); // added l
  badge.innerHTML = page;

  li.appendChild(document.createTextNode(name));
  li.appendChild(badge);

  li.setAttribute("class", "list-group-item d-flex justify-content-between align-items-center"); // added line
  li.setAttribute("onclick", "listClicked(" + page + ")"); // added line

  ul.appendChild(li);
}

function zeroFill(number, width) {
  width -= number.toString().length;
  if (width > 0) {
    return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
  }
  return number + ""; // always return a string
}

if ('serviceWorker' in navigator) {
  console.log("Will the service worker register?");
  navigator.serviceWorker.register('service-worker.js')
    .then(function (reg) {
      console.log("Yes, it did.");
    }).catch(function (err) {
      console.log("No it didn't. This happened:", err)
    });
}

function loadSegmentsJSON(callback) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', './assets/data/segments.json', true); // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}
