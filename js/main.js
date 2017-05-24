// CONST & VARS
// Textareas
const asciiDiv = document.getElementById('ascii');
const morseDiv = document.getElementById('morse');
// Buttons
/*var toMorseBtn = document.getElementById('toMorse');
var toAsciiBtn = document.getElementById('toAscii');*/
const playBtn = document.getElementById('play');
// Status text
const toMorseStatus = document.getElementById('toMorseStatus');
const toAsciiStatus = document.getElementById('toAsciiStatus');
// Player elements
const playStatus = document.getElementById('playStatus');
const prevC = document.getElementById('prevChar');
const curC = document.getElementById('currentChar');
const nextC = document.getElementById('nextChar');
// Audio
const audio = document.getElementById('beep');
//const audio = new Audio('audio/beep.mp3');
const volumeControl = document.getElementById('volumeControl');
const volumeIcon = document.getElementById('volumeIcon');
// Playback speed
var speed = 1;
const speedControl = document.getElementById('speedControl');
const speedIcon = document.getElementById('speedIcon');
// Morse conversion tables
const charsTable = document.querySelector('#charsTable tbody')
const numsTable = document.querySelector('#numsTable tbody')
const specTable = document.querySelector('#specTable tbody')

// Array of valid chars
const valid = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '.', ',', '?', '!', '-', '/', '@', '(', ')', ' '];
// Morse code chars json
var morse;
fetch('json/morse.json')
  .then(blob => blob.json())
  .then(data => morse = data[0])
  .then(morse => populateTable(morse))
  .catch(error => console.log(error));

// FUNCTIONS

// Populate Morse Table
function populateTable(morse) {
  for (const key of Object.keys(morse)) {
    if(/[a-z]/i.test(key)) {
      charsTable.innerHTML += "<tr><td>"+key+"</td><td>"+morse[key]+"</td></tr>";
    } else if(/[0-9]/i.test(key)) {
      numsTable.innerHTML += "<tr><td>"+key+"</td><td>"+morse[key]+"</td></tr>";
    } else {
      specTable.innerHTML += "<tr><td>"+key+"</td><td>"+morse[key]+"</td></tr>";
    }
  }

}

// Reset beep
HTMLAudioElement.prototype.stop = function() {
  this.pause();
  this.currentTime = 0.0;
}

// Check if all characters of a string are convertable to Morse
function checkChars(string) {
  var invalidChars = []; // array of invalid chars
  var isValid = true; // set to false if any char is invalid
  var s = string.trim().toLowerCase();
  s.split('').map( // each char
    s => {
      if (valid.indexOf(s) == -1) { // if not found in the array of valid chars
        isValid = false; // set flag to false
        invalidChars.push(s); // add invalid char to array
      }
    }
  )
  if (invalidChars.length == 0) {
    // return nothing when everything is OK
    return ""; 
  } else {
    // else return the invalid characters
    return "Invalid character(s):<br>" + invalidChars.join(' ');
  }
};
// Morse -> ASCII
function decode(morseCode) {
  if(morseCode === '') {
    toAsciiStatus.textContent = "Textarea is empty";
    return "";
  }
  else {
    return morseCode.trim().split('   ').map( // each word
      s => s.split(' ').map( // split to chars
        s => { for(var key in morse) {
          if (morse[key]==s) {return key} // return latin char
        }}
      ).join('') // characters
    ).join(' ') // words
  }
};
// ASCII -> MORSE
function encode(string) {
  if(string === '') {
    toMorseStatus.textContent = "Textarea is empty";
    return "";
  }
  else {
    toMorseStatus.innerHTML = checkChars(string);
    return string.trim().toLowerCase().split(' ').map( // each word
      s => s.split('').map( // split to chars
        s => morse[s] // return morse char
      ).join(' ') // characters
    ).join('   ') // words
  }
};

// Capitalize the first letter of each sentence - TODO
function capitalize(string) {
  return string.split(/[.][ ]*/g).map(w => w[0].toUpperCase() + w.substr(1)).join('. ');
};

// PLAYBACK
function morsePlayback(str) {
  // toggle elements
  document.getElementById('play').style.display = 'none';
  prevC.innerHTML = ''; curC.innerHTML = '', nextC.innerHTML = '';
  document.getElementById('playStatus').style.display = 'block';

  setTimeout(function() {
    // start promise chain
    var sequence = Promise.resolve();
    // split string
    str.split('').forEach(function(char, i) {
      sequence = sequence.then(function() {
        // process the current character
        return playChar(str, char, i);
      }).catch(function(err) {
        // catch any error that happened along the way
        console.log("Oops: " + err);
      })
    })
  }, 300)
  console.log("starting playback...");
}
function checkEnd(str, i) {
  // if it reached the last character
  if (str.length == i + 1) {
    setTimeout(function () {
      document.getElementById('playStatus').style.display = 'none';
      document.getElementById('play').style.display = 'block';
      console.log('...playback ended.')
    }, 700)
  }
}
function playChar(str, char, i) {
  return new Promise(function (resolve, reject) {
    // character separator - pause - dont play beep
    if(char === ' ') {
      // update player status
      currentPlaying(str, i);
      setTimeout(function() {
        // check if its the last char
        resolve(checkEnd(str, i));
      }, 400*speed)
    }
    // morse character
    else {
      // short beep
      if(char == '.') {
        dur = 100;
      } else {
        // long beep
        if(char == '-') {
          dur = 300;
        } else reject('Invalid character');
      }
      setTimeout(function () {
        // update player status
        currentPlaying(str, i);
        // start beep
        audio.play();
        setTimeout(function () {
          // stop beep
          audio.stop();
          // check if its the last char
          resolve(checkEnd(str, i));
        }, dur*speed)
      }, 100)
    }
  })
};
// Update player status
function currentPlaying(morseCode, i) {
  /*switch (i) {
    case 0:
      prevC.innerHTML = "&nbsp;";
      curC.innerHTML = morseCode[i];
      nextC.innerHTML = morseCode[i+1];
      break;
    case 1:
      prevC.innerHTML = morseCode[i-1];
      curC.innerHTML = morseCode[i];
      nextC.innerHTML = morseCode[i+1] + "&nbsp;&nbsp;" + morseCode[i+2];
      break;
    case morseCode.length-2:
      prevC.innerHTML = morseCode[i-2] + "&nbsp;&nbsp;" + morseCode[i-1];
      curC.innerHTML = morseCode[i];
      nextC.innerHTML = morseCode[i+1];
      break;
    case morseCode.length-1:
      prevC.innerHTML = morseCode[i-2] + "&nbsp;&nbsp;" + morseCode[i-1];
      curC.innerHTML = morseCode[i];
      nextC.innerHTML = "&nbsp;";
      break;
    default:
      prevC.innerHTML = morseCode[i-2] + "&nbsp;&nbsp;" + morseCode[i-1];
      curC.innerHTML = morseCode[i];
      nextC.innerHTML = morseCode[i+1] + "&nbsp;&nbsp;" + morseCode[i+2];
      break;
  }*/

  var charAt = morseCode;
  prevC.innerHTML =( charAt[i-6] ? charAt[i-6] : ' ') +
    (charAt[i-5] ? charAt[i-5] : ' ') +
    (charAt[i-4] ? charAt[i-4] : ' ') +
    (charAt[i-3] ? charAt[i-3] : ' ') +
    (charAt[i-2] ? charAt[i-2] : ' ') +
    (charAt[i-1] ? charAt[i-1] : ' ');
  curC.innerHTML = charAt[i] ? charAt[i] : ' ';
  nextC.innerHTML = (charAt[i+1] ? charAt[i+1] : ' ') +
    (charAt[i+2] ? charAt[i+2] : ' ') + 
    (charAt[i+3] ? charAt[i+3] : ' ') + 
    (charAt[i+4] ? charAt[i+4] : ' ') + 
    (charAt[i+5] ? charAt[i+5] : ' ') + 
    (charAt[i+6] ? charAt[i+6] : ' ');
}

// EVENT LISTENERS
// input
asciiDiv.addEventListener('input', function() {
  morseDiv.value = encode(asciiDiv.value);
});
morseDiv.addEventListener('input', function() {
  asciiDiv.value = decode(morseDiv.value);
});
/*toMorseBtn.addEventListener('click', function() {
  morseDiv.value = encode(asciiDiv.value);
});
toAsciiBtn.addEventListener('click', function() {
  asciiDiv.value = decode(morseDiv.value);
});*/
// player
playBtn.addEventListener('click', function() {
  morsePlayback(morseDiv.value);
});
// volume controls
volumeControl.addEventListener('input', function() {
  audio.volume = volumeControl.value / 10;
  if (audio.volume == 0) {
    volumeIcon.innerHTML = "<i class='fa fa-volume-off'></i>";
  }
  else if (audio.volume <= 0.5) {
    volumeIcon.innerHTML = "<i class='fa fa-volume-down'></i>";
  }
  else {
    volumeIcon.innerHTML = "<i class='fa fa-volume-up'></i>";
  }
});
volumeIcon.addEventListener('click', function() {
  if(audio.volume == 0) {
    volumeControl.value = 4;
    volumeIcon.innerHTML = "<i class='fa fa-volume-down'></i>";
  }
  else {
    volumeControl.value = 0;
    volumeIcon.innerHTML = "<i class='fa fa-volume-off'></i>";
  }
  audio.volume = volumeControl.value / 10;
});
// speed controls
speedControl.addEventListener('input', function() {
  speed = 1 / (speedControl.value / 10);
  console.log('speed: ' + speed);
});
speedIcon.addEventListener('click', function() {
  if (speedControl.value != 10) {
    speedControl.value = 10;
  } 
  else {
    speedControl.value = 20;
  }
  speed = 1 / (speedControl.value / 10);
  console.log('speed: ' + speed);
});

// Page load
(function() {
  morseDiv.value = "... --- ...";
  asciiDiv.value = "sos";
  audio.volume = volumeControl.value / 10;
})();



