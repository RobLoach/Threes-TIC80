// title: Threes
// author: Rob Loach
// description: Port of Threes to TIC-80.
// input: gamepad
// saveid: threes
// script: js

const screenWidth = 240
const screenHeight = 136
const colors = {
	background: 2,
	zero: 3,
	one: 4,
	two: 5,
	white: 15,
	black: 0
}
const wall = {
	top: 0,
	left: 1,
	right: 2,
	bottom: 3
}
const controls = {
	up: 0,
	down: 1,
	left: 2,
	right: 3,
	a: 4,
	b: 5,
	x: 6,
	y: 7
}
var tiles = []
var next = 0
var highscore = 0

/**
 * Starts a new game.
 */
function newGame() {
	tiles = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]
	next = getRandomInt(3) + 1

	addRandomTile(1)
	addRandomTile(1)
	addRandomTile(1)
	addRandomTile(2)
	addRandomTile(2)
	addRandomTile(2)
	addRandomTile(3)
	addRandomTile(3)
	addRandomTile(3)
}

/**
 * Get a random value depending on the given max value.
 */
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}

/**
 * Add the given value to a random available tile.
 */
function addRandomTile(val) {
	var x = getRandomInt(4)
	var y = getRandomInt(4)

	// Choose another tile if it's already taken.
	if (tiles[y][x] != 0) {
		return addRandomTile(val)
	}

	tiles[y][x] = val
}

/**
 * Add a random tile along the given wall.
 */
function addRandomTileAt(whichside) {
	availableTiles = []
	switch (whichside) {
		case wall.top:
			for (var x = 0; x < 4; x++) {
				if (tiles[0][x] == 0) {
					availableTiles.push({xPos: x, yPos: 0})
				}
			}
		break
		case wall.bottom:
			for (var x = 0; x < 4; x++) {
				if (tiles[3][x] == 0) {
					availableTiles.push({xPos: x, yPos: 3})
				}
			}
			break
		case wall.left:
			for (var y = 0; y < 4; y++) {
				if (tiles[y][0] == 0) {
					availableTiles.push({xPos: 0, yPos: y})
				}
			}
			break
		case wall.right:
			for (var y = 0; y < 4; y++) {
				if (tiles[y][3] == 0) {
					availableTiles.push({xPos: 3, yPos: y})
				}
			}
			break
	}

	if (availableTiles.length == 0) {
		return false
	}

	var tile = availableTiles[Math.floor(Math.random() * availableTiles.length)]
	tiles[tile.yPos][tile.xPos] = next
	next = getRandomInt(3) + 1
}

/**
 * Load all game information from persistent memory.
 */
function loadGame() {
	// Tiles
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 4; x++) {
        	var val = pmem(y * 4 + x)
        	if (val > 0) {
        		tiles[y][x] = val - 1
        	}
        }
    }

    // Highscore
    var highval = pmem(255)
    if (highval > 0) {
    	highscore = highval
    }

    // Next value
    var nextval = pmem(254)
    if (nextval > 0) {
    	next = nextval - 1
    }
}

/**
 * Save all game information to persistent memory.
 */
function saveGame() {
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 4; x++) {
        	pmem(y * 4 + x, tiles[y][x] + 1)
        }
    }
    pmem(255, highscore)
    pmem(254, next + 1)
}

/**
 * Swap and move the given tiles. Returns whether it moved or not.
 */
function swap(currentX, currentY, nextX, nextY) {
	// Find the values of the tiles.
	var current = tiles[currentY][currentX]
	var next = tiles[nextY][nextX]

	// If there is nothing there, just move the tile.
	if (current == 0) {
		tiles[currentY][currentX] = next
		tiles[nextY][nextX] = 0
		return true
	}

	// If there is something there and we can merge it, merge it.
	if ((current + next == 3) || ((current == next) && (current != 1 && current != 2))) {
		tiles[currentY][currentX] = current + next
		tiles[nextY][nextX] = 0
		return true
	}

	return false
}

/**
 * Push tiles up.
 */
function moveUp() {
	var moved = false
    for (var y = 0; y < 3; y++) {
        for (var x = 0; x < 4; x++) {
            if (swap(x, y, x, y + 1)) {
            	moved = true
            }
        }
    }
    if (moved) {
    	addRandomTileAt(wall.bottom)
    }
}

/**
 * Push tiles down.
 */
function moveDown() {
	var moved = false
    for (var y = 3; y > 0; y--) {
        for (var x = 0; x < 4; x++) {
            if (swap(x, y, x, y - 1)) {
            	moved = true
            }
        }
    }
    if (moved) {
    	addRandomTileAt(wall.top)
    }
}

/**
 * Push tiles left.
 */
function moveLeft() {
	var moved = false
    for (var y = 0; y < 4; y++) {
        for (var x = 0; x < 3; x++) {
            if (swap(x, y, x + 1, y)) {
            	moved = true
            }
        }
    }
    if (moved) {
    	addRandomTileAt(wall.right)
    }
}

/**
 * Push tiles to the right.
 */
function moveRight() {
	var moved = false
    for (var y = 0; y < 4; y++) {
        for(var x = 3; x > 0; x--) {
            if (swap(x, y, x - 1, y)) {
            	moved = true
            }
        }
    }
    if (moved) {
    	addRandomTileAt(wall.left)
    }
}

/**
 * Retrieves the text width of the given text.
 */
function getTextWidth(text, scale, smallfont) {
	if (!scale) {
		scale = 1
	}
	if (!smallfont) {
		smallfont = false
	}
	return print(text, -999, -999, colors.background, false, scale, smallfont)
}

/**
 * Renders the game screen.
 */
function drawBoard() {
	// Board Background
	var topPadding = 2
	var width = 27
	var height = 30
	var margin = 4
	var boardWidth = width * 4 + 5 * margin
	var leftPadding = screenWidth / 2 - boardWidth / 2
	rect(leftPadding - margin, 0, boardWidth, screenHeight, colors.background)

	// Each card
	for (var y = 0; y < 4; y++) {
		for (var x = 0; x < 4; x++) {
			var val = tiles[y][x]
			var color = colors.white
			switch (val) {
				case 0:
					color = colors.zero
					break
				case 1:
					color = colors.one
					break
				case 2:
					color = colors.two
					break
			}
			rect(leftPadding + x * width + x * margin, topPadding + y * height + y * margin, width, height, color)
			if (val > 0) {
				var num = val.toString()
				var numWidth = print(num, -10, -10)
				var numLeft = leftPadding + x * width + x * margin + width / 2 - numWidth / 2
				var numTop = topPadding + y * height + y * margin + height / 2 - 3
				print(val.toString(), numLeft, numTop, 0, false, 1)
			}
		}
	}

	// Score
	var textHeight = 5
	var highscoreText = highscore.toString()
	var textWidth = getTextWidth("Score")
	var leftColumnWidth = leftPadding - margin
	print("Score", leftColumnWidth / 2 - textWidth / 2, margin * 2, colors.black)
	var scoreText = getScore().toString()
	textWidth = getTextWidth(scoreText, 2)
	print(scoreText, leftColumnWidth / 2 - textWidth / 2, margin * 2 + 8, colors.black, false, 2)

	// Next
	textWidth = getTextWidth("Next")
	print("Next", leftColumnWidth / 2 - textWidth / 2, margin * 12, colors.black)
	var outWidth = width / 2 + margin * 2
	rect(leftColumnWidth / 2 - outWidth / 2, margin * 12 + 8, outWidth, height / 2 + margin * 2, colors.background)
	var cardcolor = colors.black
	switch (next) {
		case 0:
			cardcolor = colors.zero
			break
		case 1:
			cardcolor = colors.one
			break
		case 2:
			cardcolor = colors.two
			break
		case 3:
			cardcolor = colors.white
			break
	}
	var inWidth = width / 2 + margin * 2 - 4
	rect(leftColumnWidth / 2 - inWidth / 2, margin * 12 + 8 + 2, inWidth, height / 2 + margin * 2 - 4, cardcolor)

	// Best
	textWidth = getTextWidth("Best")
	print("Best", screenWidth - leftPadding / 2 - textWidth / 2, margin * 2, colors.black)
	textWidth = getTextWidth(highscoreText, 2)
	print(highscoreText, screenWidth - leftPadding / 2 - textWidth / 2, margin * 2 + 8, colors.black, false, 2)

	// Restart
	spr(0, leftPadding + boardWidth + margin - 4, screenHeight - 16, 1)
	print("Restart", leftPadding + boardWidth + margin + 6, screenHeight - 16, colors.black)

	// Credits
	var credits = "By Rob Loach"
	textWidth = getTextWidth(credits, 1, true)
	print(credits, screenWidth - textWidth / 2 - leftPadding / 2, screenHeight - margin * 2, colors.black, false, 1, true)
}

/**
 * Calculate the current score of the game.
 */
function getScore() {
	var score = 0
    for (var y = 0; y < 4; y++) {
        for(var x = 0; x < 4; x++) {
        	score += Math.pow(3, Math.log2(tiles[y][x] / 3) + 1)
        }
    }
    return Math.floor(score)
}

/**
 * Check if the score is now the highscore.
 */
function updateScore() {
	var score = getScore()
	if (score > highscore) {
		highscore = score
	}
}

/**
 * Process the user input.
 */
function updateInput() {
	if (btnp(controls.up))
		moveUp()
	if (btnp(controls.down))
		moveDown()
	if (btnp(controls.left))
		moveLeft()
	if (btnp(controls.right))
		moveRight()
	if (btnp(controls.a) || btnp(controls.b) || btnp(controls.x) || btnp(controls.y))
		newGame()
}

// Start a new game when the cart starts.
newGame()

function TIC() {
	// Clear the screen.
	cls(colors.white)

	// Load game state from pmem().
	loadGame()

	// Process user input.
	updateInput()

	// Update any score state.
	updateScore()

	// Save all information to pmem()
	saveGame()

	// Render the game state.
	drawBoard()
}
