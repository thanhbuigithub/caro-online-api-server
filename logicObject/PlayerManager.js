class PlayerManager {
  constructor() {
    if (!PlayerManager.instance) {
      this.players = [];
      this.quickMatch = [];
      this.pollDisconnectedPlayers = [];
      this.cleanPollInterval = setInterval(() => {
        this.pollDisconnectedPlayers = [];
      }, 5 * 24 * 60 * 60 * 1000);
      PlayerManager.instance = this;
    }

    return PlayerManager.instance;
  }

  add(player) {
    const found = this.players.find((p) => p.id === player.id);
    if (found) {
      console.log("Already have player ");
      clearTimeout(found.disconnectTimeout);
      found.disconnectTimeout = null;
      found.socket = player.socket;
      found.socket.removeAllListeners();
      found.socketHandler();
      return false;
    }
    const pollPlayer = this.pollDisconnectedPlayers.find(
      (p) => p.id === player.id
    );
    if (pollPlayer) {
      console.log("pollDisconnectedPlayers");
      pollPlayer.disconnectTimeout = null;
      pollPlayer.socket = player.socket;
      pollPlayer.socket.removeAllListeners();
      pollPlayer.socketHandler();
      this.players.push(pollPlayer);
      return false;
    }

    console.log("New player ");
    this.players.push(player);
    return true;
    // const index = this.players.indexOf(player);
    // if (index === -1) {
    //   this.players.push(player);
    //   return player;
    // }
  }

  remove(playerId) {
    const index = this.players.indexOf(this.find(playerId));
    if (index > -1) {
      const player = this.players.splice(index, 1)[0];
      this.pollDisconnectedPlayers.push(player);
    }

    //this.players = this.players.filter((p) => p.id === playerId);
  }

  find(playerId) {
    return this.players.find((player) => player.id === playerId);
  }

  getAll() {
    return this.players.map((player) => player.toPacket());
  }

  addToQuickMatch(player) {
    const found = this.players.find((p) => p.id === player.id);
    if (found) {
      if (!this.quickMatch.find((p) => p.id === found.id)) {
        this.quickMatch.push(found);
      }
    }
  }

  matchingPlayers(player) {
    for (let i = 0; i < this.quickMatch.length; i++) {
      const p = this.quickMatch[i];
      if (
        p.id !== player.id &&
        p.user.elo <= player.user.elo + 500 &&
        p.user.elo >= player.user.elo - 500 &&
        p.room === null
      )
        return p;
    }
    return undefined;
  }

  removeFromQuickMatch(playerId) {
    const found = this.quickMatch.find((p) => p.id === playerId);
    if (found) {
      const index = this.quickMatch.indexOf(found);
      if (index > -1) {
        this.quickMatch.splice(index, 1)[0];
      }
    }
  }
}

const instance = new PlayerManager();
Object.freeze(instance);

module.exports = instance;
