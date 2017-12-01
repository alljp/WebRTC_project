var socket = new WebSocket('ws://' + window.location.host + window.location.pathname)

socket.onmessage = function (message) {
  var msg = JSON.parse(message.data)
  console.log(msg)
  switch (msg.type) {
    case 'assigned_id' :
      socket.id = msg.id
      break
    case 'received_offer' :
      console.log('received offer', msg.data)
      pc.setRemoteDescription(new RTCSessionDescription(msg.data)).then(function () {
        console.log('create answer')
        pc.createAnswer().then(function (description) {
          console.log('sending answer')
          pc.setLocalDescription(description).then(function () {
            socket.send(JSON.stringify({
              type: 'received_answer',
              data: description
            }))
          })
        })
      })
      break
    case 'received_answer' :
      console.log('received answer')
      if (!connected) {
        pc.setRemoteDescription(new RTCSessionDescription(msg.data))
        connected = true
      }
      break
    case 'received_candidate' :
      console.log('received candidate', msg.data)
      var candidate = new RTCIceCandidate({
        sdpMLineIndex: msg.data.label,
        candidate: msg.data.candidate
      })
      pc.addIceCandidate(candidate)
      break
  }
}

const configuration = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]}
let stream
let pc = new RTCPeerConnection(configuration)
let connected = false
let mediaConstraints = {
  'mandatory': {
    'OfferToReceiveAudio': true,
    'OfferToReceiveVideo': true
  }
}

pc.onicecandidate = function (e) {
  if (e.candidate) {
    socket.send(JSON.stringify({
      type: 'received_candidate',
      data: {
        label: e.candidate.sdpMLineIndex,
        id: e.candidate.sdpMid,
        candidate: e.candidate.candidate
      }
    }))
  }
}

pc.onaddstream = function (e) {
  console.log('start remote video stream')
  vid2.src = URL.createObjectURL(e.stream)
  vid2.play()
}

function showVideo () {
  navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true
  })
    .then(function (s) {
      stream = s
      pc.addStream(s)
      vid1.src = window.URL.createObjectURL(stream)

      if (initCall) {
        start()
      }
    })
    .catch(function (err) {
      alert(err)
    })
}

function start () {
  // this initializes the peer connection
  console.log('start')
  pc.createOffer().then(function (description) {
    pc.setLocalDescription(description).then(function () {
      socket.send(JSON.stringify({
        type: 'received_offer',
        data: description
      }))
    })
  })
}

window.onload = function () {
  showVideo()
}

window.onbeforeunload = function () {
  socket.send(JSON.stringify({
    type: 'close'
  }))
  pc.close()
  pc = null
}
