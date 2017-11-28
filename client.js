
function returnUserMedia () {
   // check if the browser supports the WebRTC
  return (navigator.getUserMedia || navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia)
}

if (navigator.getUserMedia = returnUserMedia()) {
  alert('WebRTC is supported. Select Allow to get video')
} else {
  alert('WebRTC is not supported')
}
