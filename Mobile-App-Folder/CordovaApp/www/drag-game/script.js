var myGamePiece;
var myObstacles = [];
var myImage = new Image();
var myGamePiece;
var myObstacles = [];
var myImage = new Image();
myImage.src = "images/Mario_Jump.png";
var myObstacleImage = new Image();
myObstacleImage.src = "images/Obstacle.png";
var coins = [];
var coinsImage = new Image();
coinsImage.src = "images/Coin.png";
var score = 0;
var gameOver = false;
var isLuigi = false;
var isPeach = false;
var useDPad = false;

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
	myGameArea.start();
	myImage.src = imageSrc;
	if (isPeach) {
		myGamePiece = new component(40, 100, myImage, 10, 720);
	} else {
		myGamePiece = new component(70, 100, myImage, 10, 720);
	}
	myObstacles.push(new component(10, 100, null, -100, 1, true));
	myObstacles.push(new component(10, 100, myObstacleImage, 100, 1));
	myObstacles.push(new component(10, 100, myObstacleImage, 300, 1));
	myObstacles.push(new component(10, 100, myObstacleImage, 500, 1));
	myObstacles.push(new component(10, 100, myObstacleImage, 700, 1));
// useDPad already declared at the top
	myObstacles.push(new component(10, 100, myObstacleImage, 1100, 1));
	myObstacles.push(new component(10, 100, myObstacleImage, 1300, 1));
	myObstacles.push(new component(10, 100, myObstacleImage, 1500, 1));
	myObstacles.push(new component(10, 100, myObstacleImage, 1700, 1));
	myObstacles.push(new component(10, 100, myObstacleImage, 1900, 1));
	myObstacles.push(new component(10, 100, myObstacleImage, 2100, 1));
	myObstacles.push(new component(10, 100, myObstacleImage, 2300, 1));
	score = 0;
	gameOver = false;

	setInterval(addCoins, 500);
}

function addCoins() {
	coins.push(
		new component(
			60,
			70,
			coinsImage,
			Math.random() * (myGameArea.canvas.width - 60),
			Math.random() * (myGameArea.canvas.height - 70)
		)
	);
}

function respawnCoin(x, y) {
	coins.push(new component(60, 70, coinsImage, x, y));
}

var myGameArea = {
	canvas: document.createElement("canvas"),
	start: function () {
		   this.canvas.width = 1500;
		   this.canvas.height = 825;
		   this.context = this.canvas.getContext("2d");
		   document.body.insertBefore(this.canvas, document.body.childNodes[0]);
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

function component(width, height, image, x, y, isFollower = false) {
	this.width = width;
	this.height = height;
	this.image = image;
	this.x = x;
	this.y = y;
	this.isFollower = isFollower;
	this.speedY = 1;
	this.speedX = 1;
	this.update = function () {
		ctx = myGameArea.context;
		if (this.isFollower) {
			ctx.fillStyle = "red";
			ctx.fillRect(this.x, this.y, this.width, this.height);
		} else {
			ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
		}
	};
	this.newPos = function () {
		if (myGameArea.keys && myGameArea.keys[37]) {
			this.x -= 2;
		}
		if (myGameArea.keys && myGameArea.keys[39]) {
			this.x += 2;
		}
		if (myGameArea.keys && myGameArea.keys[38]) {
			this.y -= 2;
		}
		if (myGameArea.keys && myGameArea.keys[40]) {
			this.y += 2;
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

	// Wrap around canvas borders
	if (myGamePiece.x < 0) {
		myGamePiece.x = myGameArea.canvas.width - myGamePiece.width;
	} else if (myGamePiece.x + myGamePiece.width > myGameArea.canvas.width) {
		myGamePiece.x = 0;
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
			if (score < 15) {
				myGameArea.stop();
				gameOver = true;
				removeDPad();
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
			}
			return;
		}
		myObstacles[i].update();
	}
	for (var i = 0; i < coins.length; i++) {
		if (myGamePiece.crashWith(coins[i])) {
			coins.splice(i, 1);
			i--;
			score++;
			// Play coin collected sound
			var coinAudio = document.getElementById("coin-audio");
			if (coinAudio) {
				coinAudio.currentTime = 0;
				coinAudio.volume = 1;
				coinAudio.muted = false;
				coinAudio.play().catch(function(e) {
					// If playback is blocked, prompt user to click a button to play sound
					alert("Click OK to play the coin sound!");
					coinAudio.play();
				});
			}
		} else {
			coins[i].update();
		}
	}
	updateScore();
	if (score >= 15) {
		Congrats();
	}
}

function updateScore() {
	myGameArea.context.font = "30px Arial";
	myGameArea.context.fillStyle = "black";
	myGameArea.context.fillText("Score: " + score, 20, 40);
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

function Congrats() {
	gameOver = true;
	myGameArea.stop();
	myGameArea.context.clearRect(
		0,
		0,
		myGameArea.canvas.width,
		myGameArea.canvas.height
	);
	removeDPad();

	myGameArea.canvas.style.backgroundImage = "url('images/Congrats.png')";
	// Play win audio with autoplay handling
	var winAudio = document.getElementById("win-audio");
	if (winAudio) {
		winAudio.currentTime = 0;
		winAudio.volume = 1;
		winAudio.muted = false;
		winAudio.play().catch(function(e) {
			// If playback is blocked, prompt user to click a button to play sound
			alert("Click OK to play the win sound!");
			winAudio.play();
		});
	}
	if (!document.getElementById("restart-button")) {
		new RestartButton(0, 0, 200, 50, "Restart Game");
	}
}

function checkCollision() {
	if (myGamePiece.crashWith(myObstacles)) {
		myGameArea.stop();
	}
}

// D-pad and control mode selection support
// useDPad already declared at the top

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
    // Style D-pad buttons
    const style = document.createElement('style');
    style.textContent = `
      .dpad-btn {
        width: 48px; height: 48px; margin: 4px; font-size: 2em; border-radius: 12px; border: 2px solid #333; background: #eee; color: #222; box-shadow: 1px 1px 4px #aaa; }
      .dpad-btn:active { background: #ccc; }
    `;
    document.head.appendChild(style);
    // D-pad event listeners
    const keyMap = { 'dpad-up': 38, 'dpad-down': 40, 'dpad-left': 37, 'dpad-right': 39 };
    Object.keys(keyMap).forEach(id => {
      const btn = document.getElementById(id);
      btn.addEventListener('touchstart', e => {
        e.preventDefault();
        simulateKey(keyMap[id], true);
      });
      btn.addEventListener('touchend', e => {
        e.preventDefault();
        simulateKey(keyMap[id], false);
      });
      btn.addEventListener('mousedown', e => {
        e.preventDefault();
        simulateKey(keyMap[id], true);
      });
      btn.addEventListener('mouseup', e => {
        e.preventDefault();
        simulateKey(keyMap[id], false);
      });
      btn.addEventListener('mouseleave', e => {
        e.preventDefault();
        simulateKey(keyMap[id], false);
      });
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
