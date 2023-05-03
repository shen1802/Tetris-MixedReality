class user {
  constructor(id, busy) {
    this.id = id;
    this.busy = busy;
  }

  getId() {
    return this.id;
  }

  getBusy() {
    return this.busy;
  }

  setBusy(newBusy) {
    this.busy = newBusy;
  }
}
