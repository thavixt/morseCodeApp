// morse json
var morse;
fetch('json/morse.json')
  .then(blob => blob.json())
  .then(data => morse = data[0])
  .catch(error => console.log(error.message));

function decode(morseCode) {
  return morseCode.trim().split('   ').map(
    s => s.split(' ').map(
      s => { for(var key in morse) {
        if (morse[key]==s) {return key}
      }}
    ).join('')
  ).join(' ')
};

function encode(string) {
  return string.trim().toLowerCase().split(' ').map(
    s => s.split('').map(
      s => morse[s]
    ).join(' ')
  ).join('   ')
};

function capitalize(str) {
  return str.split(/[.][ ]*/g).map(w => w[0].toUpperCase() + w.substr(1)).join('. ');
};

function play(morseCode) {
  for(var i = 0; i < morseCode.length; i++) {
    // play sounds
  }
};

document.getElementById('toMorse').addEventListener('click', function() {
  document.getElementById('morse').value = encode(document.getElementById('eng').value);
});


document.getElementById('fromMorse').addEventListener('click', function() {
  document.getElementById('eng').value = decode(document.getElementById('morse').value);
});

(function() {
  document.getElementById('eng').value = "lorem ipsum dolor sit amet, consectetuer adipiscing elit. ut odio. nam sed est.";
})();