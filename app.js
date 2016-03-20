var path = require('path');
var favicon = require('serve-favicon');

var express = require('express'),
http = require('http');
var app = express();
var server = http.createServer(app);
var io = require('socket.io').listen(server);

var players = [];
var topChampion = null;

io.on('connection', function (socket) {

    // handle new play joins
    socket.on('player_join', function(data) {
        var connID = this.client.conn.id

        if (!data.id || !data.name) {
            return;
        }

        for (var i in players) {
            if (players[i].name == data.name && players[i].id == data.id) {
                return false;
            }
        }

        // add the new user into the players array
        currPlayer = { id: data.id, name: data.name, connID: connID };
        players.push(currPlayer);
        this.broadcast.emit('new_player', currPlayer);
        console.log("new_player: " + "[" + currPlayer.id + "] " + currPlayer.name);

        // every 3 users, update players list to remove any users not connected
        if (players.length % 3 == 0) {
            var socketList = io.sockets.server.eio.clients;
            var newPlayers = [];
            for (var i in players) {
                if (socketList[players[i].connID] !== undefined) {
                    newPlayers.push(players[i]);
                }
            }

            players = newPlayers;
        }

        this.emit('all_players', {players: players});
    });

    // handle user disconnection
    socket.on('disconnect', function(data) {
        if (!data.id) {
            return;
        }

        var removePlayer = playerById(data.id);

        if (!removePlayer) {
            console.log("Player not found: " + data.id);
            return;
        };

        players.splice(players.indexOf(removePlayer), 1);
        console.log("player disconnected: " + "[" + data.id + "] " + data.name);
    });


    // handle new champions
    socket.on('champion', function(data) {
        if (!data.id || !data.name || !data.champion) {
            return;
        }

        if (topChampion == null) {
            topChampion = data.champion;
        }

        if (data.champion.v >= topChampion.v) {
            this.broadcast.emit('new_champion', {id: data.id, name: data.name, champion: data.champion});
            console.log(data.name + "'s design has become the new champion");
        }
    });

});


function playerById(id) {
    var i;
    for (i = 0; i < players.length; i++) {
        if (players[i].id == id)
            return players[i];
    };

    return false;
}


/** Allowing cross origin request because internet */
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});


/** Ataching paths */
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(favicon(path.join(__dirname, 'assets', 'favicon.ico')));


/** FOR ASIMOV */
app.get('/robots.txt', function(req, res, next) {
    res.type('text/plain');
    res.send("User-agent: *\nDisallow: /");
});


/** Index route */
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/views/index.html');
});


/** Starting server */
const PORT = 3000;
server.listen(PORT);
console.log("Server listening on port %s", PORT);