// Textareas
var asciiDiv = document.getElementById('ascii');
var morseDiv = document.getElementById('morse');

// Buttons
var toMorseBtn = document.getElementById('toMorse');
var toAsciiBtn = document.getElementById('toAscii');
var playBtn = document.getElementById('play');

// Status indicators
var toMorseStatus = document.getElementById('toMorseStatus');
var toAsciiStatus = document.getElementById('toAsciiStatus');
var volumeIcon = document.getElementById('volumeIcon');


var playStatus = document.getElementById('playStatus');
var prevC = document.getElementById('prevChar');
var curC = document.getElementById('currentChar');
var nextC = document.getElementById('nextChar');

// Audio
var audio = new Audio('audio/beep.wav');
var volumeControl = document.getElementById('volumeControl');

// Array of valid chars
var valid = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '.', ',', '?', '!', '-', '/', '@', '(', ')', ' '];
// Morse code chars json
var morse;
fetch('json/morse.json')
  .then(blob => blob.json())
  .then(data => morse = data[0])
  .catch(error => console.log(error.message));


// Functions
// Reset beep
HTMLAudioElement.prototype.stop = function() {
  this.pause();
  this.currentTime = 0.0;
}

// Check if all characters of a string are convertable to Morse
function checkChars(string) {
  let invalidChars = []; // array of invalid chars
  let isValid = true; // set to false if any char is invalid
  let s = string.trim().toLowerCase();
  s.split('').map( // each char
    s => {
      if (valid.indexOf(s) == -1) { // if not found in the array of valid chars
        isValid = false; // set flag to false
        invalidChars.push(s); // add invalid char to array
      }
    }
  )
  if (isValid) {
    // return nothing when everything is OK
    return ""; 
  } else {
    // else return the invalid characters
    return "Invalid character(s):<br>" + invalidChars.join(" ");
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

// Capitalize the first letter of each sentence
function capitalize(string) {
  return string.split(/[.][ ]*/g).map(w => w[0].toUpperCase() + w.substr(1)).join('. ');
};

// Beep Morse code
function play(morseCode) {
  if(morseCode === '') {
    return false;
  }
  var time = 200;
  for(var i = 0; i < morseCode.length; i++) {
    switch (morseCode[i]) {
      case '.':
        (function(i) {
          time += 350;
          setTimeout(function() {
            audio.play();
            currentPlaying(morseCode, i);
          }, time+100);
          setTimeout(function() { audio.stop(); }, (time) + 200);
        })(i);
        break;
        
      case '-':
        (function(i) {
          time += 550;
          setTimeout(function() {
            audio.play();
            currentPlaying(morseCode, i);
          }, time);
          setTimeout(function() { audio.stop(); }, (time) + 400);
        })(i);
        break;
        
      case ' ':
        (function(i) {
          time += 800;
          setTimeout(function() {
            currentPlaying(morseCode, i);
          }, time);
        })(i);
        break;
        
      default:
        break;
    }
  }
  return true;
};
function currentPlaying(morseCode, i) {
  morseCode.replace(/ /g, 'asd');
  console.log(morseCode[i]);
  switch (i) {
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
  }
}


// Event listeners
toMorseBtn.addEventListener('click', function() {
  morseDiv.value = encode(asciiDiv.value);
});
toAsciiBtn.addEventListener('click', function() {
  asciiDiv.value = decode(morseDiv.value);
});
playBtn.addEventListener('click', function() {
  play(morseDiv.value);
});
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

// Page load
(function() {
  morseDiv.value = "... --- ...";
  audio.volume = volumeControl.value / 10;
})();