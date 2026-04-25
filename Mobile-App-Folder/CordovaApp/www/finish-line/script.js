var myGamePiece;
var myFinishLine;
var myObstacles = [];
var myImage = new Image();
var gameOver = false;
var isLuigi = false;
var isPeach = false; // Add flag for Peach
var useDPad = false;
var myObstacleImage = new Image();
myObstacleImage.src = "images/Obstacle.png";
var finishLineImage = new Image();
finishLineImage.src = "images/Finish-Line.png"; // Ensure this path is correct
var gravity = 0.05; // Add gravity
var onGround = false; // Add flag to check if character is on the ground

function handleCharacterChoice(imageSrc, luigi, peach) {
	showControlChoiceModal(function(wantsDPad) {
		useDPad = wantsDPad;
		isLuigi = luigi;
		isPeach = peach;
		startGame(imageSrc);
		if (useDPad) createDPad();
	});
}

document.getElementById("mario-button").addEventListener("click", function () {
	handleCharacterChoice("images/Mario_Jump.png", false, false);
});
document.getElementById("luigi-button").addEventListener("click", function () {
	handleCharacterChoice("images/Luigi_Jump.png", true, false);
});
document.getElementById("peach-button").addEventListener("click", function () {
	handleCharacterChoice("images/Peach_Jump.png", false, true);
});

function startGame(imageSrc) {
	document.getElementById("image-selection").style.display = "none";
	document.getElementById("gameCanvas").style.display = "block";
	myGameArea.start();
	myImage.src = imageSrc;
	myImage.onload = function () {
		if (isPeach) {
			myGamePiece = new component(55, 100, myImage, 10, 720); // Adjust dimensions for Peach
		} else {
			myGamePiece = new component(70, 100, myImage, 10, 720);
		}
		myFinishLine = new component(20, 825, finishLineImage, 1480, 0, "finish"); // Use finish line image
		myObstacles.push(new component(10, 100, myObstacleImage, 100, 750));
		myObstacles.push(new component(10, 100, myObstacleImage, 250, 750));
		myObstacles.push(new component(10, 100, myObstacleImage, 400, 750));
		myObstacles.push(new component(10, 100, myObstacleImage, 550, 750));
		myObstacles.push(new component(10, 100, myObstacleImage, 700, 750));
		myObstacles.push(new component(10, 100, myObstacleImage, 850, 750));
		myObstacles.push(new component(10, 100, myObstacleImage, 1000, 750));
		myObstacles.push(new component(10, 100, myObstacleImage, 1150, 750));
		myObstacles.push(new component(10, 100, myObstacleImage, 1300, 750));
		gameOver = false;
	};
}

var myGameArea = {
	canvas: document.getElementById("gameCanvas"),
	start: function () {
		this.canvas.width = 1500;
		this.canvas.height = 825;
		this.context = this.canvas.getContext("2d");
		this.interval = setInterval(updateGameArea, 20);
		window.addEventListener("keydown", function (e) {
			myGameArea.keys = myGameArea.keys || [];
			myGameArea.keys[e.keyCode] = e.type == "keydown";
		});
		window.addEventListener("keyup", function (e) {
			myGameArea.keys[e.keyCode] = e.type == "keydown";
		});

	},
	clear: function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},
	stop: function () {
		clearInterval(this.interval);
	},
};

function component(width, height, image, x, y, type) {
	this.type = type;
	this.width = width;
	this.height = height;
	this.image = image;
	this.x = x;
	this.y = y;
	this.speedX = 0;
	this.speedY = 0;
	this.update = function () {
		ctx = myGameArea.context;
		if (this.image) {
			ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		}
	};
	// Adjust touch movement logic for better alignment
	this.newPos = function () {
		if (myGameArea.keys && myGameArea.keys[38] && onGround) {
			this.speedY = -4; // Increase jump height
			onGround = false; // Set onGround to false when jumping
		} else {
			this.speedY += gravity; // Apply constant gravity
		}
		this.y += this.speedY;
		this.x += this.speedX;
		if (this.y >= myGameArea.canvas.height - this.height) {
			this.y = myGameArea.canvas.height - this.height;
			onGround = true; // Set onGround to true when on the ground
			this.speedY = 0; // Reset speedY when on the ground
		}
		if (myGameArea.keys && myGameArea.keys[37]) {
			this.x -= 2;
		}
		if (myGameArea.keys && myGameArea.keys[39]) {
			this.x += 2;
		}
		   // Touch movement removed
	};
	this.crashWith = function (otherobj) {
		var myleft = this.x;
		var myright = this.x + this.width;
		var mytop = this.y;
		var mybottom = this.y + this.height;
		var otherleft = otherobj.x;
		var otherright = otherobj.x + otherobj.width;
		var othertop = otherobj.y;
		var otherbottom = otherobj.y + otherobj.height;
		var crash = true;
		if (
			mybottom < othertop ||
			mytop > otherbottom ||
			myright < otherleft ||
			myleft > otherright
		) {
			crash = false;
		}
		return crash;
	};
	this.moveVertically = function () {
		this.y += this.speedY;
		if (
			this.y <= -100 ||
			this.y >= myGameArea.canvas.height - this.height + 100
		) {
			this.speedY = -this.speedY;
		}
	};
	this.moveHorizontally = function () {
		this.x += this.speedX;
		if (
			this.x <= -100 ||
			this.x >= myGameArea.canvas.width - this.width + 100
		) {
			this.speedX = -this.speedX;
		}
	};
	this.follow = function (target) {
		const speed = 1;
		if (this.x < target.x) {
			this.x += speed;
		} else if (this.x > target.x) {
			this.x -= speed;
		}
		if (this.y < target.y) {
			this.y += speed;
		} else if (this.y > target.y) {
			this.y -= speed;
		}
	};
}

function updateGameArea() {
	if (gameOver) return;
	myGameArea.clear();
	myGamePiece.newPos();
	myGamePiece.update();
	myFinishLine.update();

	if (myGamePiece.x < 0) {
		myGamePiece.x = 0; // Stop at the left wall
	} else if (myGamePiece.x + myGamePiece.width > myGameArea.canvas.width) {
		myGamePiece.x = myGameArea.canvas.width - myGamePiece.width;
	}
	if (myGamePiece.y < 0) {
		myGamePiece.y = myGameArea.canvas.height - myGamePiece.height;
	} else if (myGamePiece.y + myGamePiece.height > myGameArea.canvas.height) {
		myGamePiece.y = 0;
	}

	for (var i = 0; i < myObstacles.length; i++) {
		if (myObstacles[i].isFollower) {
			myObstacles[i].follow(myGamePiece);
		} else {
			myObstacles[i].moveVertically();
			myObstacles[i].moveHorizontally();
		}
		if (myGamePiece.crashWith(myObstacles[i])) {
			myGameArea.stop();
			gameOver = true;
			// Play losing sound
			var loseAudio = document.getElementById("lose-audio");
			if (loseAudio) {
				loseAudio.currentTime = 0;
				loseAudio.volume = 1;
				loseAudio.muted = false;
				loseAudio.play().catch(function(e) {
					alert("Click OK to play the losing sound!");
					loseAudio.play();
				});
			}
			setTimeout(function () {
				var gameOverImage = new Image();
				gameOverImage.src = isPeach
					? "images/Game_Over_Peach.png"
					: isLuigi
					? "images/Game_Over_Luigi.png"
					: "images/Game_Over.png";
				gameOverImage.onload = function () {
					myGameArea.context.drawImage(
						gameOverImage,
						0,
						0,
						myGameArea.canvas.width,
						myGameArea.canvas.height
					);
					if (!document.getElementById("restart-button")) {
						new RestartButton(650, 400, 200, 50, "Restart Game");
					}
				};
			}, 100);
			return;
		}
		myObstacles[i].update();
	}
	if (myGamePiece.crashWith(myFinishLine)) {
		myGameArea.stop();
		gameOver = true;
		// Hide the game piece, finish line, and obstacles
		myGamePiece = null;
		myFinishLine = null;
		myObstacles = [];
		myGameArea.clear();
		removeDPad();
		myGameArea.canvas.style.backgroundImage = "url('images/Congrats.png')";
        // Play win sound
        var winAudio = document.getElementById("win-audio");
        if (winAudio) {
            winAudio.currentTime = 0;
            winAudio.volume = 1;
            winAudio.muted = false;
            winAudio.play().catch(function(e) {
                alert("Click OK to play the win sound!");
                winAudio.play();
            });
        }
		// Show the restart button
		if (!document.getElementById("restart-button")) {
			new RestartButton(650, 400, 200, 50, "Restart Game");
		}
	}
}

class RestartButton {
	constructor(x, y, width, height, text) {
		this.width = width;
		this.height = height;
		this.text = text;
		this.element = document.createElement("button");
		this.element.id = "restart-button";
		this.element.style.width = this.width + "px";
		this.element.style.height = this.height + "px";
		this.element.innerHTML = this.text;
		document
			.getElementById("restart-button-container")
			.appendChild(this.element);
		this.element.addEventListener("click", () => {
			location.reload();
		});
	}
}

function checkCollision() {
	if (myGamePiece.crashWith(myObstacles)) {
		myGameArea.stop();
	}
}

// Control choice modal and D-pad support (copied/adapted from drag-game)
function showControlChoiceModal(callback) {
		if (document.getElementById('control-choice-modal')) return;
		const modal = document.createElement('div');
		modal.id = 'control-choice-modal';
		modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:2000;';
		modal.innerHTML = `
			<div style="background:#fff;padding:32px 24px;border-radius:16px;box-shadow:0 4px 32px #0008;text-align:center;max-width:90vw;">
				<h2 style='margin-bottom:18px;'>How do you want to move?</h2>
				<button id="choose-dpad" style="margin:12px 16px;padding:12px 24px;font-size:1.2em;">Show Arrow Buttons</button>
				<button id="choose-keys" style="margin:12px 16px;padding:12px 24px;font-size:1.2em;">Use Keyboard Arrows</button>
			</div>
		`;
		document.body.appendChild(modal);
		document.getElementById('choose-dpad').onclick = function() {
				modal.remove();
				callback(true);
		};
		document.getElementById('choose-keys').onclick = function() {
				modal.remove();
				callback(false);
		};
}

function createDPad() {
		if (document.getElementById('dpad-container')) return;
		const dpad = document.createElement('div');
		dpad.id = 'dpad-container';
		dpad.innerHTML = `
			<div style="display:flex;flex-direction:column;align-items:center;position:fixed;bottom:30px;left:30px;z-index:1000;">
				<button class="dpad-btn" id="dpad-up">▲</button>
				<div style="display:flex;flex-direction:row;">
					<button class="dpad-btn" id="dpad-left">◀</button>
					<button class="dpad-btn" id="dpad-down">▼</button>
					<button class="dpad-btn" id="dpad-right">▶</button>
				</div>
			</div>
		`;
		document.body.appendChild(dpad);
		const style = document.createElement('style');
		style.textContent = `
			.dpad-btn {
				width: 48px; height: 48px; margin: 4px; font-size: 2em; border-radius: 12px; border: 2px solid #333; background: #eee; color: #222; box-shadow: 1px 1px 4px #aaa; }
			.dpad-btn:active { background: #ccc; }
		`;
		document.head.appendChild(style);
		const keyMap = { 'dpad-up': 38, 'dpad-down': 40, 'dpad-left': 37, 'dpad-right': 39 };
		Object.keys(keyMap).forEach(id => {
			const btn = document.getElementById(id);
			btn.addEventListener('touchstart', e => { e.preventDefault(); simulateKey(keyMap[id], true); });
			btn.addEventListener('touchend', e => { e.preventDefault(); simulateKey(keyMap[id], false); });
			btn.addEventListener('mousedown', e => { e.preventDefault(); simulateKey(keyMap[id], true); });
			btn.addEventListener('mouseup', e => { e.preventDefault(); simulateKey(keyMap[id], false); });
			btn.addEventListener('mouseleave', e => { e.preventDefault(); simulateKey(keyMap[id], false); });
		});
}

function simulateKey(keyCode, isDown) {
		myGameArea.keys = myGameArea.keys || [];
		myGameArea.keys[keyCode] = isDown;
}

function removeDPad() {
		const dpad = document.getElementById('dpad-container');
		if (dpad) dpad.remove();
}
