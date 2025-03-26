var myGamePiece;
var myFinishLine;
var myObstacles = [];
var myImage = new Image();
var gameOver = false;
var isLuigi = false;
var isPeach = false; // Add flag for Peach
var myObstacleImage = new Image();
myObstacleImage.src = "images/Obstacle.png";
var finishLineImage = new Image();
finishLineImage.src = "images/Finish-Line.png"; // Ensure this path is correct
var gravity = 0.05; // Add gravity
var onGround = false; // Add flag to check if character is on the ground

document.getElementById("mario-button").addEventListener("click", function () {
	startGame("images/Mario_Jump.png");
	isLuigi = false;
	isPeach = false;
});

document.getElementById("luigi-button").addEventListener("click", function () {
	startGame("images/Luigi_Jump.png");
	isLuigi = true;
	isPeach = false;
});

// Add event listener for Peach button
document.getElementById("peach-button").addEventListener("click", function () {
	startGame("images/Peach_Jump.png"); // Correct the image source
	isLuigi = false;
	isPeach = true;
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
		myGameArea.canvas.style.backgroundImage = "url('images/Congrats.png')";
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
