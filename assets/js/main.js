$(function() {
  $.get('/rec', function(data) {
    data.forEach(function(rec) {
      console.log("DATA", rec)
      var rr = $('<div>')
      var url = rec.audio
      var audio = $('<audio>')
      audio.attr('src', url)
      audio.attr('controls', true)
      var author = $('<span>')
      author.text(rec.email)
      rr.append(audio)
      rr.append(author)
      rr.attr('class', 'rr')
      console.log('appending')
      $('.recs').append(rr)
    })
  })
})
var recordingg = false;
function recordd() {
  if(recordingg) {
    recordingg = false
    $('#rec').attr('class', 'stopped')
    // stop recording
     stopRecording(this)
    
  } else {
    recordingg = true
    $('#rec').attr('class', 'recording')
    // start recording
    startRecording(this)
  }
}
function __log(e, data) {
    console.log("\n" + e + " " + (data || ''));
  }

  var audio_context;
  var recorder;

  function startUserMedia(stream) {
    var input = audio_context.createMediaStreamSource(stream);
    __log('Media stream created.');

    input.connect(audio_context.destination);
    __log('Input connected to audio context destination.');

    recorder = new Recorder(input);
    __log('Recorder initialised.');
  }

  function startRecording(button) {
    recorder && recorder.record();
    button.disabled = true;
    //button.nextElementSibling.disabled = false;
    __log('Recording...');
  }

  function stopRecording(button) {
    recorder && recorder.stop();
    button.disabled = true;
    //button.previousElementSibling.disabled = false;
    __log('Stopped recording.');

    // create WAV download link using audio data blob
    createDownloadLink();

    recorder.clear();
  }
  function blobber(blobUrl, cb) {
    var xhr = new XMLHttpRequest;
    xhr.responseType = 'blob';
    
    xhr.onload = function() {
     var recoveredBlob = xhr.response;
  
     var reader = new FileReader;
  
     reader.onload = function() {
       var blobAsDataUrl = reader.result;
       cb(blobAsDataUrl)
     };

   reader.readAsDataURL(recoveredBlob);
  };
  
  xhr.open('GET', blobUrl);
  xhr.send();
  }
  function createDownloadLink() {
    recorder && recorder.exportWAV(function(blob) {
      var url = URL.createObjectURL(blob);
      blobber(url, function(d) {
        $.post('/rec', {
          audio: d,
          email: $('#email').val()
        })
      })
      /*var li = document.createElement('li');
      var au = document.createElement('audio');
      var hf = document.createElement('a');

      au.controls = true;
      au.src = url;
      hf.href = url;
      hf.download = new Date().toISOString() + '.wav';
      hf.innerHTML = hf.download;
      li.appendChild(au);
      li.appendChild(hf);
      recordingslist.appendChild(li);*/
      /*$.post('/rec', {
        audio: url,
        email: $('#email').val()
      })*/
    });
  }

  window.onload = function init() {
    try {
      // webkit shim
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
      window.URL = window.URL || window.webkitURL;

      audio_context = new AudioContext;
      __log('Audio context set up.');
      __log('navigator.getUserMedia ' + (navigator.getUserMedia ? 'available.' : 'not present!'));
    } catch (e) {
      alert('No web audio support in this browser!');
    }

    navigator.getUserMedia({
      audio: true
    }, startUserMedia, function(e) {
      __log('No live audio input: ' + e);
    });
  };