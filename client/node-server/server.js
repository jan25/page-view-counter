const express = require('express');
const app = express();

server = app.listen(3001, function(){
    console.log('server is running on port 3001')
});

const io = require('socket.io')(server);

var hitCounter = {};

io.on('connection', function(socket) {
    console.log(socket.id);

    socket.on('INC_HIT_COUNT', function(data) {        
        if (!data.pageID) return;

        const roomID = 'room-' + data.pageID;
        socket.join(roomID);

        if (data.pageID in hitCounter) {
            hitCounter[data.pageID] += 1;
        } else {
            hitCounter[data.pageID] = 1;
        }

        io.to(roomID).emit('UPDATED_HIT_COUNT', {
            countViews : hitCounter[data.pageID]
        });
    });
});