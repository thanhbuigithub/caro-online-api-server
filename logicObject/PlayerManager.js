class PlayerManager {
  constructor() {
    if (!PlayerManager.instance) {
      this.players = [];
      PlayerManager.instance = this;
    }

    return PlayerManager.instance;
  }

  add(player) {
    const index = this.players.indexOf(player);
    if (index === -1) {
      this.players.push(player);
      return player;
    }
  }

  remove(playerId) {
    const index = this.players.indexOf(this.find(playerId));
    if (index > -1) {
      this.players.splice(index, 1);
    }
    //this.players = this.players.filter((p) => p.id === playerId);
  }

  find(playerId) {
    return this.players.find((player) => player.id === playerId);
  }

  getAll() {
    return this.players.map((player) => player.getUser().username);
  }
}

const instance = new PlayerManager();
Object.freeze(instance);

module.exports = instance;
