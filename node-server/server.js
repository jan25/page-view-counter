const express = require('express');
const app = express();

/**
 * We keep environment variables in this module
 */
const env = require('./environment');

/**
 * Start node server
 */
const server_port = env.server_port || 3001;
server = app.listen(server_port, function(){
    console.log(`server is running on port ${server_port}`);
});

/**
 * Initiatlise redis clients
 */
const redis = require('redis');
const redis_client = redis.createClient(env.redis.port, env.redis.ip);
const subscribe_client = redis.createClient(env.redis.port, env.redis.ip);
const publish_client = redis.createClient(env.redis.port, env.redis.ip);

/**
 * Handles socket connections
 */
const io = require('socket.io')(server);

io.on('connection', function(socket) {
    console.log(socket.id);

    socket.on('INC_HIT_COUNT', function(data) {        
        if (!data.pageID) return;

        /**
         * generate unique roomID
         * join the socket room for this roomID
         */
        const roomID = 'room-' + data.pageID;
        socket.join(roomID);

        /**
         * Subsribe to roomID channel if we didn't already do that for this socket
         * Increment count in redis database
         */
        subscribe_client.subscribe(roomID);
        redis_client.get(roomID, function(err, hits) {
            if (err) return;
            hits = parseInt(hits || 0);
            console.log(hits);
            redis_client.set(roomID, hits + 1, function(err, reply) {
                /**
                 * publish increment event to the roomID redis channel
                 */
                publish_client.publish(roomID, 'INC_HIT_COUNT');
            });
        });

    });
});

/**
 * Listen on updates from upstream redis database
 * Push the updated hit count to downstream socket connections
 */
subscribe_client.on('message', function(channel, message) {
    if (message === 'INC_HIT_COUNT') {
        redis_client.get(channel, function(err, hits) {
            if (err) return;
            io.to(channel).emit('UPDATED_HIT_COUNT', {
                countViews : hits,
            });
        });
    }
});