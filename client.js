
function returnUserMedia () {
   // check if the browser supports the WebRTC
  return (navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia)
}

if (navigator.getUserMedia = returnUserMedia()) {
  alert('WebRTC is supported. Select Allow to get video')
  navigator.getUserMedia({ video: true, audio: true }, function (stream) {
    let video = document.querySelector('video')
    video.src = window.URL.createObjectURL(stream)
  }, function (err) { console.log(err) })
} else {
  alert('WebRTC is not supported')
}
