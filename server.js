const express = require("express");
const http = require("http");
const fs = require("fs");
const { spawn } = require("child_process");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");

	if (req.method === "OPTIONS") {
		res.sendStatus(204);
		return;
	}

	next();
});

app.use(express.static(__dirname));

function findEdgePath() {
	const candidates = [
		process.env["ProgramFiles(x86)"] && process.env["ProgramFiles(x86)"] + "\\Microsoft\\Edge\\Application\\msedge.exe",
		process.env.ProgramFiles && process.env.ProgramFiles + "\\Microsoft\\Edge\\Application\\msedge.exe",
		process.env.LOCALAPPDATA && process.env.LOCALAPPDATA + "\\Microsoft\\Edge\\Application\\msedge.exe"
	].filter(Boolean);

	return candidates.find(candidate => fs.existsSync(candidate));
}

app.post("/install-app", (req, res) => {
	const url = `http://localhost:${PORT}`;
	const edgePath = findEdgePath();

	if (!edgePath) {
		res.status(500).json({ ok: false, message: "Microsoft Edge is not installed." });
		return;
	}

	try {
		const child = spawn(edgePath, [`--install-app=${url}`], {
			stdio: "ignore",
			detached: true
		});
		child.unref();
		res.json({ ok: true, message: "Install flow started in Edge." });
	} catch (error) {
		res.status(500).json({ ok: false, message: error.message });
	}
	return;
});

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
