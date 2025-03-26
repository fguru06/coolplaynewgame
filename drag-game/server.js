const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(express.static("public")); // Serve static files from the "public" folder
const server = http.createServer(app);
const io = new Server(server);

const players = {}; // Store player data

io.on("connection", (socket) => {
	console.log("A player connected:", socket.id);

	// Add new player
	players[socket.id] = { x: 0, y: 0, score: 0, name: `Player ${socket.id}` };
	io.emit("updatePlayers", players);

	// Handle player movement
	socket.on("move", (data) => {
		if (players[socket.id]) {
			players[socket.id].x = data.x;
			players[socket.id].y = data.y;
			io.emit("updatePlayers", players);
		}
	});

	// Handle score updates
	socket.on("updateScore", (score) => {
		if (players[socket.id]) {
			players[socket.id].score = score;
			io.emit("updatePlayers", players);
		}
	});

	// Handle player disconnection
	socket.on("disconnect", () => {
		console.log("A player disconnected:", socket.id);
		delete players[socket.id];
		io.emit("updatePlayers", players);
	});
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
