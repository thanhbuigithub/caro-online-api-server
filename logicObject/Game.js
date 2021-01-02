const config = require("./config");
const Timer = require("./Timer");

class Game {
  constructor(room) {
    this.playerX = null;
    this.playerO = null;
    this.turn = config.PLAYER_X;
    this.history = [];
    this.preMove = null;
    this.board = [];
    this.turnTimer = null;
    this.chatHistory = [];
    this.room = room;
    this.startedTime = null;
    this.winLine = null;
    this.init();
  }

  init() {
    this.playerX = this.room.playerX;
    this.playerO = this.room.playerO;
    this.board = Array(config.ROW)
      .fill(null)
      .map(() => {
        return Array(config.COLUMN).fill(config.EMPTY);
      });
    this.turnTimer = new Timer(this);
  }

  restartTurnTimer() {
    this.turnTimer.restart();
  }

  addHistory(x, y, chess) {
    this.history.push({ x, y, chess });
  }

  move(x, y, player) {
    if (this.room.state !== config.GAME_STATE.STARTED) {
      return false;
    }

    let chess = this.chess(player);

    if (chess === null) {
      return false;
    }

    if (this.turn !== chess) {
      return false;
    }

    if (this.preMove !== null && this.preMove.chess === chess) {
      return false;
    }

    if (x < 0 || x >= config.ROW || y < 0 || y >= config.COL) {
      return false;
    }

    if (this.board[x][y] !== config.EMPTY) {
      return false;
    }

    this.board[x][y] = chess;
    this.addHistory(x, y, chess);
    this.preMove = { x, y, chess };
    player.emitNewMove(this.preMove);
    const winLine = this.checkWin(x, y);
    if (winLine !== null) {
      this.onGameOver(winLine);
    }
    this.changeTurn();
    return this.preMove;
  }

  chess(player) {
    if (player === this.playerX) {
      return config.PLAYER_X;
    }

    if (player === this.playerO) {
      return config.PLAYER_O;
    }

    return null;
  }

  getCellAt(x, y) {
    if (x < 0 || x >= config.ROW || y < 0 || y >= config.COL) {
      return config.EMPTY;
    }
    return this.board[x][y];
  }

  checkWinTemplate(currentCell, backDir, frontDir) {
    // get data from current cell
    let currentData = this.getCellAt(currentCell.x, currentCell.y);

    // if there is nodata => out
    if (currentData === config.EMPTY) {
      return null;
    }

    // đếm số lượng ô thỏa điều kiện (>= 5 ô liên tiếp là win)
    let count = 1;
    let from, to, temp;
    let winLine = [{ x: currentCell.x, y: currentCell.y, chess: currentData }];

    // count to back
    from = currentCell;
    while (true) {
      temp = { x: from.x + backDir.x, y: from.y + backDir.y };
      let data = this.getCellAt(temp.x, temp.y);

      if (data !== currentData) {
        break;
      }
      winLine.push({ x: temp.x, y: temp.y, chess: data });
      from = temp;
      count++;
    }

    // count to front
    to = currentCell;
    while (true) {
      temp = { x: to.x + frontDir.x, y: to.y + frontDir.y };
      let data = this.getCellAt(temp.x, temp.y);

      if (data !== currentData) {
        break;
      }
      winLine.push({ x: temp.x, y: temp.y, chess: data });
      to = temp;
      count++;
    }

    // nếu có 5 ô giống nhau liên tiếp nhau => win
    if (count === 5) {
      return winLine;
    }

    return null;
  }

  checkWin(x, y) {
    let currentCell = { x, y };
    let backDir, frontDir;
    let winPath;

    // ============ check chieu ngang =============
    backDir = { x: -1, y: 0 };
    frontDir = { x: 1, y: 0 };
    winPath = this.checkWinTemplate(currentCell, backDir, frontDir);
    if (winPath != null) {
      return winPath;
    }
    // ============ check chieu doc ============
    backDir = { x: 0, y: -1 };
    frontDir = { x: 0, y: 1 };
    winPath = this.checkWinTemplate(currentCell, backDir, frontDir);
    if (winPath != null) {
      return winPath;
    }
    // ============ check cheo trai sang phai ============
    backDir = { x: -1, y: -1 };
    frontDir = { x: 1, y: 1 };
    winPath = this.checkWinTemplate(currentCell, backDir, frontDir);
    if (winPath != null) {
      return winPath;
    }
    // ============ check cheo phai sang trai ============
    backDir = { x: 1, y: -1 };
    frontDir = { x: -1, y: 1 };
    winPath = this.checkWinTemplate(currentCell, backDir, frontDir);
    if (winPath != null) {
      return winPath;
    }

    return null;
  }

  doTick() {
    let curTick = this.turnTimer.getCurrentTick();
    if (curTick > config.TURN_TIME_LIMIT) {
      this.onGameOver();
      return;
    }
  }

  onGameOver(winLine) {
    console.log("Game: GAME OVER");
    this.turnTimer.stop();
    this.winLine = winLine;
    this.playerX.emitGameOver(winLine);
    this.saveGame();
    this.room.onGameOver();
  }

  start() {
    this.startedTime = Date.now();
    this.turnTimer.start();
  }

  changeTurn() {
    this.turnTimer.restart();
    this.turn =
      this.turn === config.PLAYER_X ? config.PLAYER_O : config.PLAYER_X;
  }

  saveGame() {}

  toPacket() {
    return {
      turn: this.turn,
      history: this.history,
      preMove: this.preMove,
      currentTick: this.turnTimer.getCurrentTick(),
      winLine: this.winLine,
    };
  }
}

module.exports = Game;
