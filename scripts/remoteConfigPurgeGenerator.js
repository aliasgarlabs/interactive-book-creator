// {
//   "id": 2,
//   "purgeReason": "Removed the repeated munajaat on page 24",
//   "purgeDate": 1587692100000,
//   "active": true,
//   "purgeFiles": [
//     {
//       "folder": 1,
//       "page": 24,
//       "size": 1689014
//     }
//   ]
// }

let fs = require('fs'),
  _ = require('lodash'),
  $ = require('shelljs'),
  path = '/Users/aliasgar/projects/web/assets/audio/8',
  files = fs.readdirSync(path),
  folder =8,
  purgeDate = new Date().getTime(),
  purgeReason = 'Remove incorrect bihori juzz 2 audio',
  id = 1,
  active = true;


  let purgeRequest = {
    id,
    purgeDate,
    purgeReason,
    active
  };

// // console.log(purgeDate, files);

let purgeFiles = _.transform(files, (result, file) => {
  if(file.endsWith('.mp3')) {
    var size = fs.statSync(path+"/"+file).size;

    result.push({
      folder,
      page: parseInt(file.substr(4,3)),
      size
    });
  }
}, []);

// console.log(JSON.stringify(purgeFiles, "", 2));
// console.log(purgeFiles.length);

// purgeRequest.purgeFiles = purgeFiles;

// console.log(JSON.stringify(purgeRequest, null, 0));


// IMAGES


// let purgeFiles = _.transform(files, (result, file) => {
//   if(file.endsWith('.jpg')) {
//     var size = fs.statSync(path+"/"+file).size;

//     result.push({
//       folder,
//       page: parseInt(file),
//       size
//     });
//   }
// }, []);

// console.log(JSON.stringify(purgeFiles, "", 2));
// console.log(purgeFiles.length);

purgeRequest.purgeFiles = purgeFiles;

console.log(JSON.stringify(purgeRequest, null, 0));


