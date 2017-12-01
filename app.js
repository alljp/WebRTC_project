const express = require('express')
const ws = require('websocket.io')
const uuid = require('uuid')

let app = express()
app.use(express.static('./public'))

let server = app.listen(3000, '0.0.0.0')

app.get('/:room', function (req, res) {
  res.render('index.jade', {params: req.query,
    room_count: io.clientsByRoom[req.params.room] ? io.clientsByRoom[req.params.room].length : 0})
})

let io = ws.attach(server)
io.clientsByID = io.clientsByID || {}
io.clientsByRoom = io.clientsByRoom || {}

io.on('connection', function (socket) {
  let room = /\/(.+)/.exec(socket.req.url)[1]
  socket.id = uuid.v1()
  socket.room = room

  if (!room) {
    socket.close()
  }
  io.clientsByRoom[room] = io.clientsByRoom[room] || []
  io.clientsByRoom[room].push(socket)
  io.clientsByID[socket.id] = socket

  socket.send(JSON.stringify({
    type: 'assigned_id',
    id: socket.id
  }))
  socket.on('message', function (data) {
    let msg = JSON.parse(data)

    switch (msg.type) {
      case 'received_offer' :
      case 'receieved_candidate' :
      case 'received_answer' :
        for (let sock in io.clientsByRoom[socket.room]) {
          if (sock.id !== socket.id) {
            sock.send(JSON.stringify(msg))
          }
        }
        break
      case 'close' :
        socket.close()
    }
  })
})
