let startButton = document.getElementById('startButton')
let callButton = document.getElementById('callButton')
let hangupButton = document.getElementById('hangupButton')
callButton.disabled = true
hangupButton.disabled = true
startButton.onclick = start
callButton.onclick = call
hangupButton.onclick = hangup

let localVideo = document.getElementById('localVideo')
let remoteVideo = document.getElementById('remoteVideo')

let localStream
let pc1
let pc2
let offerOptions = {
  offerToReceiveAudio: 1,
  offerToReceiveVideo: 1
}

function getOtherPc (pc) {
  return (pc === pc1) ? pc2 : pc1
}

function gotStream (stream) {
  localVideo.srcObject = stream
  localStream = stream
  callButton.disabled = false
}

function start () {
  startButton.disabled = true
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  })
    .then(gotStream)
    .catch(function (e) {
      alert('getUserMedia() error: ' + e.name)
    })
}

function call () {
  callButton.disabled = true
  hangupButton.disabled = false
  var servers = null
  pc1 = new RTCPeerConnection(servers)
  pc1.onicecandidate = function (e) {
    onIceCandidate(pc1, e)
  }
  pc2 = new RTCPeerConnection(servers)
  pc2.onicecandidate = function (e) {
    onIceCandidate(pc2, e)
  }
  pc2.onaddstream = gotRemoteStream

  pc1.addStream(localStream)
  pc1.createOffer(
    offerOptions
  ).then(
    onCreateOfferSuccess
  )
}

function onCreateOfferSuccess (desc) {
  pc1.setLocalDescription(desc).then(
    function () {
    })
  pc2.setRemoteDescription(desc).then(
    function () {
    })
  pc2.createAnswer().then(
    onCreateAnswerSuccess
  )
}

function gotRemoteStream (e) {
  remoteVideo.srcObject = e.stream
}

function onCreateAnswerSuccess (desc) {
  pc2.setLocalDescription(desc).then(
    function () {
    })
  pc1.setRemoteDescription(desc).then(
    function () {
    })
}

function onIceCandidate (pc, event) {
  getOtherPc(pc).addIceCandidate(event.candidate)
    .then(
      function () {
      },
      function (err) {
        console.log(err)
      }
    )
}

function hangup () {
  pc1.close()
  pc2.close()
  pc1 = null
  pc2 = null
  hangupButton.disabled = true
  callButton.disabled = false
}

// function returnUserMedia () {
//    // check if the browser supports the WebRTC
//   return (navigator.getUserMedia || navigator.webkitGetUserMedia ||
//       navigator.mediaDevices.getUserMedia || navigator.mozGetUserMedia)
// }

// const getUserMedia = returnUserMedia
// if (getUserMedia) {
//   alert('WebRTC is supported. Select Allow to get video')
//   navigator.mediaDevices.getUserMedia({
//     audio: true,
//     video: true
//   })
//     .then(function (stream) {
//       let video = document.querySelector('video')
//       video.src = window.URL.createObjectURL(stream)
//       window.stream = stream
//     })
//     .catch(function (e) {
//       alert('getUserMedia() error: ' + e.name)
//     })
// } else {
//   alert('WebRTC is not supported')
// }
