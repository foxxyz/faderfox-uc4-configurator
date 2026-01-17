class ActionEvent extends Event {
    constructor({ action, args }) {
        super('action')
        this.action = action
        this.args = args
    }
}

export class ConnectionEvent extends Event {
    constructor(device) {
        super('connect')
        this.device = device
    }
}

export class DisconnectionEvent extends Event {
    constructor(device) {
        super('disconnect')
        this.device = device
    }
}

export class BaseController extends EventTarget {
    emit(args) {
        this.dispatchEvent(new ActionEvent(args))
    }
}