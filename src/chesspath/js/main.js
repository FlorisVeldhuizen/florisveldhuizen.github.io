import PF from "pathfinding";
// import { Phaser } from "./phaser.max.js";

var findPath, matrix;
var tileSize = 48;
var score = 0;

console.log('game start!');

$(document).ready(function () {
  /*
  * -----------------------------
  *      CHESS PATHFINDING
  * -----------------------------
  */
  var getChessNeighbors = function (node, diagonalMovement) {
    var nodes = this.nodes;
    var explore;
    var curx = node.x, cury = node.y;
    var possibleMoves = [];
    var piece = this.piece;
    var findMove = function (dx, dy, grid) {
      var x = curx + dx, y = cury + dy;
      while (grid.isWalkableAt(x, y)) {
        possibleMoves.push(nodes[y][x]);
        if (explore.single) { break }
        x += dx;
        y += dy;
      }
    }
    if (piece === 'rook') {
      explore = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    } else if (piece === 'bishop') {
      explore = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
    } else if (piece === 'knight') {
      explore = [[2, 1], [1, 2], [-1, 2], [-2, 1], [-2, -1], [-1, -2], [1, -2], [2, -1]];
      explore.single = true;
    } else if (piece === 'king' || piece === 'queen') {
      explore = [[1, 0], [0, 1], [-1, 0], [0, -1], [1, 1], [1, -1], [-1, -1], [-1, 1]];
      if (piece === 'king') explore.single = true;
    }
    for (var i = 0; i < explore.length; i++) {
      var dx, dy;
      dx = explore[i][0];
      dy = explore[i][1];
      findMove(dx, dy, this);
    }

    return possibleMoves;
  };

  //game level (walkability)
  const oldMatrix = [
    [0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1],
    [0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
    [0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0],
    [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
    [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0],
  ];

  /* rules for the matrix:

  TODO:
  There can be no nodes that are completely walled off from 9 sides
  prevent a L shape in the generation

  right now:
  The starting place (0,0) should be zero always
  ~25% of the squares will be generated as a wall

  idea for generation: every unit has max 3 squares siding with it. (all diagonals?)
  */
  const buildMatrix = () => {

    const matrixArray = [];
    for (let i = 0; i < 12; i++) {
      const row = [];
      for (let j = 0; j < 12; j++) {
        // generation math
        const square = Math.round(Math.random() * 4) < 3 ? 0 : 1;
        row.push(square);
      }
      matrixArray.push(row);
    }
    matrixArray[0][0] = 0;
    matrixArray[1][1] = 0
    const neighbors = [
      [-1, -1,],
      [-1, 0,],
      [-1, 1,],
      [0, -1],
      [0, 1,],
      [1, -1,],
      [1, 0,],
      [1, 1,],
    ]
    const maxNeighbors = 6

    matrixArray.forEach((row, rowIndex) => {
      row.forEach((value, valueIndex) => {
        let sum = 0;
        for (const neighbor of neighbors) {
          const x = neighbor[0] + valueIndex
          const y = neighbor[1] + rowIndex
          if (x < 0 || x > row.length - 1 || y < 0 || y > matrixArray.length - 1) {
            sum += 1
            continue
          }
          sum += matrixArray[y][x]
        }
        console.log(sum)
        matrixArray[rowIndex][valueIndex] = matrixArray[rowIndex][valueIndex] === 1 && sum <= maxNeighbors ? 1 : 0
      })
    })

    return matrixArray;
  }

  matrix = buildMatrix();

  var grid = new PF.Grid(matrix);

  var finder = new PF.AStarFinder({
    heuristic: function (x, y) {
      return 0.1 * (x + y);//Lower number means better paths, worse performace.
    }
  });


  findPath = function (x1, y1, x2, y2, piece) {
    var chessGrid = grid.clone();
    chessGrid.piece = piece;
    chessGrid.getNeighbors = getChessNeighbors;
    var path = finder.findPath(x1, y1, x2, y2, chessGrid);

    return path;
  }

  findPath(1, 7, 5, 6, "knight");


  /*
  * -----------------
  *      PHASER
  * -----------------
  */

  //global game variables
  var map, enemies, mainCharacter, uiOverlay;
  var enemytypes = ['rook', 'knight', 'bishop'];

  //global game functions
  var preload = function () {
    game.load.image('ground', 'assets/ground.png');
    game.load.image('enemy-rook', 'assets/rook.png');
    game.load.image('enemy-knight', 'assets/knight.png');
    game.load.image('enemy-bishop', 'assets/bishop.png');
    game.load.image('enemy-bishop-odd', 'assets/bishop-odd.png');
    game.load.spritesheet('main-character', 'assets/princhess.png', 24, 35);
  }

  var create = function () {
    //initialize and draw map

    map = game.add.tilemap();
    map.tileWidth = tileSize;
    map.tileHeight = tileSize;
    map.addTilesetImage('ground');

    const levelLayer = map.create('level1', matrix[0].length, matrix.length, tileSize, tileSize);
    levelLayer.resizeWorld();

    for (var y = 0; y < matrix.length; y++) {
      for (var x = 0; x < matrix[y].length; x++) {
        map.putTile(matrix[y][x] * 2 + (x % 2) * (y % 2) + ((x + 1) % 2) * ((y + 1) % 2), x, y, levelLayer);
      }
    }

    //UI Overlay
    uiOverlay = game.add.graphics(0, 0);

    //Enemies
    enemies = game.add.group();
    addEnemy(3, 3, 'knight');

    //main character
    mainCharacter = game.add.sprite(0, 0, 'main-character');
    mainCharacter.currentPosition = { x: 0, y: 0 };
    mainCharacter.currentMoves = [];
    mainCharacter.unfilteredMoves = [];
    mainCharacter.width = 24;
    mainCharacter.height = 35;
    mainCharacter.anchor.x = -0.475;
    mainCharacter.anchor.y = -0.1825;
    mainCharacter.animations.add('idle', [0, 1, 2, 3], 5, true);
    mainCharacter.animations.play('idle');
    mainCharacter.inputEnabled = true;
    mainCharacter.input.enableDrag();
    mainCharacter.input.enableSnap(tileSize, tileSize, false, true);
    mainCharacter.input.useHandCursor = true;

    mainCharacter.events.onDragStop.add(getMainMoves);

    getMainMoves(true);
  }

  var update = function () {

  }

  var render = function () {

  }

  //Other Global functions
  var drawMoves = function (moves, x, y) {
    uiOverlay.beginFill(0x006600, 0.5);
    document.querySelectorAll(".moveTile").forEach((el) => el.remove())
    for (var i = 0; i < moves.length; i++) {
      var sx = moves[i].x;
      var sy = moves[i].y;
      uiOverlay.drawCircle(sx * tileSize + tileSize / 2, sy * tileSize + tileSize / 2, tileSize / 1.5);
      
    }
    uiOverlay.endFill();
  }

  const movesCalculator = (node, getGridFunction) => {
    const tempGrid = getGridFunction();
    tempGrid.piece = "queen";
    tempGrid.getNeighbors = getChessNeighbors;
    const moves = tempGrid.getNeighbors(node, null);
    return moves;
  }

  const positionCheck = (position, type) => {
    for (var i = 0; i < mainCharacter[type].length && !position; i++) {
      position = (mainCharacter[type][i].x == Math.floor(mainCharacter.x / tileSize) && mainCharacter[type][i].y == Math.floor(mainCharacter.y / tileSize));
    }
    return position;
  }

  var getMainMoves = async function (forceLegal) {
    //First, check if our move was legal. Based on previously determined legal moves/current position
    let legalMove = (forceLegal === true);
    let legalPosition = false;
    let unfilteredPosition = false;
    let enemyOverlap = false;

    if (!legalMove) {
      legalPosition = positionCheck(legalPosition, "currentMoves");
      unfilteredPosition = positionCheck(unfilteredPosition, "unfilteredMoves");
      for (var i = 0; i < enemies.children.length && !enemyOverlap; i++) {
        enemyOverlap = (Math.floor(enemies.children[i].x / tileSize) == Math.floor(mainCharacter.x / tileSize) && Math.floor(enemies.children[i].y / tileSize) == Math.floor(mainCharacter.y / tileSize));
      }
      legalMove = legalPosition || (unfilteredPosition && enemyOverlap);
    }
    //If the move is legal, move the character, get new possible moves and draw those.
    if (legalMove) {
      //erase possible moves
      uiOverlay.clear();
      //move character
      mainCharacter.currentPosition = { x: mainCharacter.x, y: mainCharacter.y };
      var x = Math.floor(mainCharacter.x / tileSize);
      var y = Math.floor(mainCharacter.y / tileSize);
      //
      var node = { x: x, y: y };
      var currentGrid = getUpdatedGrid();
      currentGrid.piece = "queen";
      currentGrid.getNeighbors = getChessNeighbors;
      //check if any enemy was killed
      var enemyKilled = !currentGrid.isWalkableAt(x, y);
      if (enemyKilled) {
        console.log("you killed an enemy!");
        score++;
        $('h1').html(score);
        for (var i = 0; i < enemies.children.length; i++) {
          var ex = Math.floor(enemies.children[i].x / tileSize);
          var ey = Math.floor(enemies.children[i].y / tileSize);
          if (x == ex && y == ey) {
            enemies.children[i].kill();
            enemies.removeChild(enemies.children[i]);
          }
        }
      }
      await moveEnemies();
      if (enemyKilled) {
        addRandomEnemy();
        addRandomEnemy();
      }
      //check if dead
      if (!getUpdatedGrid().isWalkableAt(x, y)) {
        console.log("you're dead!");
        mainCharacter.kill();
        $('body').append('<h1><a href="index.html">Game over :( - Play again!</a></h1>');

        if (Math.random() > 0.05) return

        console.log("hee ouwe lekkere lellebel" + " wat zie je er weer snoezig uit vandaag");
        console.warn("als je nou niet oplet he")

        console.error("dan sla ik je voor je muil")
        alert("het is tijd voor een pofje!")
        const answer = prompt("do you want a pofje? tip: jazeker")
        if (annswer === "jazeker") {
          window.location.href = "http://www.maanraket.nl/experiments/fractals"
        }
        "zonne lekker pofske toch"
        "woef, woef! woef! woef!"
      }

      mainCharacter.currentMoves = movesCalculator(node, getUpdatedGrid);
      mainCharacter.unfilteredMoves = movesCalculator(node, () => grid.clone());

      drawMoves(mainCharacter.currentMoves, x, y);
    } // If the move was illegal, return the character back to its original position. 
    else {
      mainCharacter.x = mainCharacter.currentPosition.x;
      mainCharacter.y = mainCharacter.currentPosition.y;
    }
  }

  var getUpdatedGrid = function () {
    var newGrid = grid.clone();
    for (var i = 0; i < enemies.children.length; i++) {
      var x = Math.floor(enemies.children[i].x / tileSize);
      var y = Math.floor(enemies.children[i].y / tileSize);
      newGrid.setWalkableAt(x, y, false);
    }
    return newGrid;
  }

  var nextFrame = () => new Promise(requestAnimationFrame)

  var moveEnemies = async function () {
    for (var i = 0; i < enemies.children.length; i++) {
      var x = Math.floor(enemies.children[i].x / tileSize);
      var y = Math.floor(enemies.children[i].y / tileSize);
      var currentGrid = getUpdatedGrid();
      currentGrid.piece = enemies.children[i].piece;
      currentGrid.getNeighbors = getChessNeighbors;
      var path = finder.findPath(x, y, Math.floor(mainCharacter.x / tileSize), Math.floor(mainCharacter.y / tileSize), currentGrid);
      const numFrames = 10
      async function animate(sourceX, sourceY, targetX, targetY, t) {
        if (t >= 1) {
          enemies.children[i].x = targetX;
          enemies.children[i].y = targetY;
          return
        }
        const tsqrt = Math.sqrt(t)
        const diffX = targetX - sourceX
        const diffY = targetY - sourceY
        const newX = sourceX + tsqrt * diffX
        const newY = sourceY + tsqrt * diffY
        enemies.children[i].x = newX;
        enemies.children[i].y = newY;
        await nextFrame()
        return animate(sourceX, sourceY, targetX, targetY, t + 1 / numFrames)
      }
      if (path.length > 0) {
        const sourceX = enemies.children[i].x
        const targetX = path[1][0] * tileSize

        const sourceY = enemies.children[i].y
        const targetY = path[1][1] * tileSize

        await animate(sourceX, sourceY, targetX, targetY, 0)
      }
    }
  }

  var addEnemy = function (x, y, type) {
    enemies.create(x * tileSize, y * tileSize, 'enemy-' + type + (((x % 2) * (y % 2) + ((x + 1) % 2) * ((y + 1) % 2) == 1 && type == "bishop") ? "-odd" : ""));
    enemies.children[enemies.children.length - 1].piece = type;
    enemies.children[enemies.children.length - 1].anchor.y = 0.35;
    enemies.children[enemies.children.length - 1].anchor.x = -0.15;
  }

  var addRandomEnemy = function () {
    var x = Math.floor(Math.random() * matrix.length);
    var y = Math.floor(Math.random() * matrix.length);
    var currentGrid = getUpdatedGrid();
    currentGrid.setWalkableAt(Math.floor(mainCharacter.x / tileSize), Math.floor(mainCharacter.y / tileSize), false);
    if (currentGrid.isWalkableAt(x, y)) {
      addEnemy(x, y, enemytypes[Math.floor(Math.random() * enemytypes.length)]);
    } else {
      addRandomEnemy();
    }
  }

  var game = new Phaser.Game(tileSize * matrix.length, tileSize * matrix.length, Phaser.CANVAS, 'chess', { preload: preload, create: create, update: update, render: render }, false, false);
})