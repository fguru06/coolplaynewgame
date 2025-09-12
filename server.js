const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

let players = {};

io.on("connection", (socket) => {
	console.log("A user connected:", socket.id);

	// Add new player
	players[socket.id] = { x: 10, y: 720, character: "Mario" };

	// Notify all players of the new player
	io.emit("updatePlayers", players);

	// Handle player movement
	socket.on("move", (data) => {
		if (players[socket.id]) {
			players[socket.id].x = data.x;
			players[socket.id].y = data.y;
			io.emit("updatePlayers", players);
		}
	});

	// Handle character selection
	socket.on("selectCharacter", (character) => {
		if (players[socket.id]) {
			players[socket.id].character = character;
			io.emit("updatePlayers", players);
		}
	});

	// Handle disconnection
	socket.on("disconnect", () => {
		console.log("A user disconnected:", socket.id);
		delete players[socket.id];
		io.emit("updatePlayers", players);
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
