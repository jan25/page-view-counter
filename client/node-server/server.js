const express = require('express');
const app = express();

server = app.listen(3001, function(){
    console.log('server is running on port 3001')
});

const io = require('socket.io')(server);

var hitCounter = {};

var memjs = require('memjs');

var client = memjs.Client.create()

io.on('connection', function(socket) {
    console.log(socket.id);

    socket.on('INC_HIT_COUNT', function(data) {        
        if (!data.pageID) return;

        const roomID = 'room-' + data.pageID;
        socket.join(roomID);

        var hits = 0
        client.get( data.pageID, function(err, val) {
            if( val != null) {
                hits = parseInt(val.toString(), 10);
            } else {
                hits = 0;
            }
        });
        
        hits = hits + 1
        client.set(data.pageID, hits.toString(), {expires:10000}, function(err, val) {
        });

        io.to(roomID).emit('UPDATED_HIT_COUNT', {
            countViews : hits
        });
    });
});