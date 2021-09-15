/* global Phaser, $ */
import PF from "pathfinding";
import ground from "../img/ground.png";
import knight from "../img/knight.png";
import bishop from "../img/bishop.png";
import bishopOdd from "../img/bishop-odd.png";
import chazz from "../img/princhess.png";

const tileSize = 48;

let score = 0;

console.log("game start!");

/*
 * -----------------------------
 *      CHESS PATHFINDING
 * -----------------------------
 */
function getChessNeighbors(node) {
  const { nodes } = this;
  let explore;
  const curx = node.x;
  const cury = node.y;
  const possibleMoves = [];
  const { piece } = this;
  const findMove = (dx, dy, grid) => {
    let x = curx + dx;
    let y = cury + dy;
    while (grid.isWalkableAt(x, y)) {
      possibleMoves.push(nodes[y][x]);
      if (explore.single) {
        break;
      }
      x += dx;
      y += dy;
    }
  };
  if (piece === "rook") {
    explore = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ];
  } else if (piece === "bishop") {
    explore = [
      [1, 1],
      [1, -1],
      [-1, 1],
      [-1, -1],
    ];
  } else if (piece === "knight") {
    explore = [
      [2, 1],
      [1, 2],
      [-1, 2],
      [-2, 1],
      [-2, -1],
      [-1, -2],
      [1, -2],
      [2, -1],
    ];
    explore.single = true;
  } else if (piece === "king" || piece === "queen") {
    explore = [
      [1, 0],
      [0, 1],
      [-1, 0],
      [0, -1],
      [1, 1],
      [1, -1],
      [-1, -1],
      [-1, 1],
    ];
    if (piece === "king") explore.single = true;
  }
  for (let i = 0; i < explore.length; i += 1) {
    const dx = explore[i][0];
    const dy = explore[i][1];
    findMove(dx, dy, this);
  }

  return possibleMoves;
}

// game level (walkability)
const matrix = [
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
const grid = new PF.Grid(matrix);

const finder = new PF.AStarFinder({
  heuristic(x, y) {
    return 0.1 * (x + y); // Lower number means better paths, worse performace.
  },
});

const findPath = (x1, y1, x2, y2, piece) => {
  const chessGrid = grid.clone();
  chessGrid.piece = piece;
  chessGrid.getNeighbors = getChessNeighbors;
  const path = finder.findPath(x1, y1, x2, y2, chessGrid);

  return path;
};

findPath(1, 7, 5, 6, "knight");

/*
 * -----------------
 *      PHASER
 * -----------------
 */

// global game variables
let map;
let enemies;
let mainCharacter;
let uiOverlay;
let game;
const enemytypes = ["knight", "bishop"];

// global game functions
const preload = () => {
  game.load.image("ground", ground);
  game.load.image("enemy-knight", knight);
  game.load.image("enemy-bishop", bishop);
  game.load.image("enemy-bishop-odd", bishopOdd);
  game.load.spritesheet("main-character", chazz, 24, 35);
};

const update = () => {};

const render = () => {};

// Other Global functions
const drawMoves = (moves) => {
  uiOverlay.beginFill(0x006600, 0.5);
  for (let i = 0; i < moves.length; i += 1) {
    const sx = moves[i].x;
    const sy = moves[i].y;
    uiOverlay.drawCircle(
      sx * tileSize + tileSize / 2,
      sy * tileSize + tileSize / 2,
      tileSize / 1.5
    );
  }
  uiOverlay.endFill();
};

const getUpdatedGrid = () => {
  const newGrid = grid.clone();
  for (let i = 0; i < enemies.children.length; i += 1) {
    const x = Math.floor(enemies.children[i].x / tileSize);
    const y = Math.floor(enemies.children[i].y / tileSize);
    newGrid.setWalkableAt(x, y, false);
  }
  return newGrid;
};

const moveEnemies = () => {
  for (let i = 0; i < enemies.children.length; i += 1) {
    const x = Math.floor(enemies.children[i].x / tileSize);
    const y = Math.floor(enemies.children[i].y / tileSize);
    const currentGrid = getUpdatedGrid();
    currentGrid.piece = enemies.children[i].piece;
    currentGrid.getNeighbors = getChessNeighbors;
    const path = finder.findPath(
      x,
      y,
      Math.floor(mainCharacter.x / tileSize),
      Math.floor(mainCharacter.y / tileSize),
      currentGrid
    );
    if (path.length > 0) {
      enemies.children[i].x = path[1][0] * tileSize;
      enemies.children[i].y = path[1][1] * tileSize;
    }
  }
};

const addEnemy = (x, y, type) => {
  enemies.create(
    x * tileSize,
    y * tileSize,
    `enemy-${type}${
      (x % 2) * (y % 2) + ((x + 1) % 2) * ((y + 1) % 2) === 1 &&
      type === "bishop"
        ? "-odd"
        : ""
    }`
  );
  enemies.children[enemies.children.length - 1].piece = type;
  enemies.children[enemies.children.length - 1].anchor.y = 0.35;
  enemies.children[enemies.children.length - 1].anchor.x = -0.15;
};

const addRandomEnemy = () => {
  const x = Math.floor(Math.random() * matrix.length);
  const y = Math.floor(Math.random() * matrix.length);
  const currentGrid = getUpdatedGrid();
  currentGrid.setWalkableAt(
    Math.floor(mainCharacter.x / tileSize),
    Math.floor(mainCharacter.y / tileSize),
    false
  );
  if (currentGrid.isWalkableAt(x, y)) {
    addEnemy(x, y, enemytypes[Math.floor(Math.random() * enemytypes.length)]);
  } else {
    addRandomEnemy();
  }
};

const getMainMoves = (forceLegal) => {
  // First, check if our move was legal. Based on previously determined legal moves/current position
  let legalMove = forceLegal === true;
  for (let i = 0; i < mainCharacter.oldMoves.length && !legalMove; i += 1) {
    legalMove =
      mainCharacter.oldMoves[i].x === Math.floor(mainCharacter.x / tileSize) &&
      mainCharacter.oldMoves[i].y === Math.floor(mainCharacter.y / tileSize);
  }
  for (let i = 0; i < enemies.children.length && !legalMove; i += 1) {
    legalMove =
      Math.floor(enemies.children[i].x / tileSize) ===
        Math.floor(mainCharacter.x / tileSize) &&
      Math.floor(enemies.children[i].y / tileSize) ===
        Math.floor(mainCharacter.y / tileSize);
  }
  // If the move is legal, move the character, get new possible moves and draw those.
  if (legalMove) {
    // erase possible moves
    uiOverlay.clear();
    // move character
    mainCharacter.oldPosition = { x: mainCharacter.x, y: mainCharacter.y };
    const x = Math.floor(mainCharacter.x / tileSize);
    const y = Math.floor(mainCharacter.y / tileSize);
    //
    const node = { x, y };
    let currentGrid = getUpdatedGrid();
    currentGrid.piece = "queen";
    currentGrid.getNeighbors = getChessNeighbors;
    // check if any enemy was killed
    const enemyKilled = !currentGrid.isWalkableAt(x, y);
    if (enemyKilled) {
      console.log("you killed an enemy!");
      score += 1;
      $("h1").html(score);
      for (let i = 0; i < enemies.children.length; i += 1) {
        const ex = Math.floor(enemies.children[i].x / tileSize);
        const ey = Math.floor(enemies.children[i].y / tileSize);
        if (x === ex && y === ey) {
          enemies.children[i].kill();
          enemies.removeChild(enemies.children[i]);
        }
      }
    }
    moveEnemies();
    if (enemyKilled) {
      addRandomEnemy();
      addRandomEnemy();
    }
    // check if dead
    if (!getUpdatedGrid().isWalkableAt(x, y)) {
      console.log("you're dead!");
      mainCharacter.kill();
      $("body").append(
        '<h1><a href="index.html">Game over :( - Play again!</a></h1>'
      );
      return;
    }
    currentGrid = getUpdatedGrid();
    currentGrid.piece = "queen";
    currentGrid.getNeighbors = getChessNeighbors;
    const moves = currentGrid.getNeighbors(node, null);
    mainCharacter.oldMoves = moves;
    drawMoves(moves);
  } // If the move was illegal, return the character back to its original position.
  else {
    mainCharacter.x = mainCharacter.oldPosition.x;
    mainCharacter.y = mainCharacter.oldPosition.y;
  }
};

const create = () => {
  // initialize and draw map

  map = game.add.tilemap();
  map.tileWidth = tileSize;
  map.tileHeight = tileSize;
  map.addTilesetImage("ground");

  const levelLayer = map.create(
    "level1",
    matrix[0].length,
    matrix.length,
    tileSize,
    tileSize
  );
  levelLayer.resizeWorld();

  for (let y = 0; y < matrix.length; y += 1) {
    for (let x = 0; x < matrix[y].length; x += 1) {
      map.putTile(
        matrix[y][x] * 2 + (x % 2) * (y % 2) + ((x + 1) % 2) * ((y + 1) % 2),
        x,
        y,
        levelLayer
      );
    }
  }

  // UI Overlay
  uiOverlay = game.add.graphics(0, 0);

  // Enemies
  enemies = game.add.group();
  addEnemy(3, 3, "knight");

  // main character
  mainCharacter = game.add.sprite(0, 0, "main-character");
  mainCharacter.oldPosition = { x: 0, y: 0 };
  mainCharacter.oldMoves = [];
  mainCharacter.width = 24;
  mainCharacter.height = 35;
  mainCharacter.anchor.x = -0.475;
  mainCharacter.anchor.y = -0.1825;
  mainCharacter.animations.add("idle", [0, 1, 2, 3], 5, true);
  mainCharacter.animations.play("idle");
  mainCharacter.inputEnabled = true;
  mainCharacter.input.enableDrag();
  mainCharacter.input.enableSnap(tileSize, tileSize, false, true);
  mainCharacter.input.useHandCursor = true;

  mainCharacter.events.onDragStop.add(getMainMoves);

  getMainMoves(true);
};

game = new Phaser.Game(
  tileSize * matrix.length,
  tileSize * matrix.length,
  Phaser.CANVAS,
  "chess",
  { preload, create, update, render }
);
