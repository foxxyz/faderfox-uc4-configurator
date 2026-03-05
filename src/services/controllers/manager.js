import { MIDIController } from './midi/controller.js'
import { ConnectionEvent } from './base.js'

const HARDWARE_TYPES = [
    new MIDIController(),
]

// Manage and delegate events to/from attached MIDI controllers
export class ControllerManager extends EventTarget {
    #actionDelegator
    constructor() {
        super()
        this.attachedDevices = []
        this.#actionDelegator = this.delegate.bind(this)
    }
    delegate(event) {
        const newEvent = new event.constructor(event)
        this.dispatchEvent(newEvent)
    }
    destroy() {
        for (const device of this.attachedDevices) {
            device.destroy()
        }
    }
    init() {
        for (const deviceType of HARDWARE_TYPES) {
            deviceType.addEventListener('connect', this.#onConnect.bind(this))
            deviceType.addEventListener('disconnect', this.#onDisconnect.bind(this))
            deviceType.monitor()
        }
    }
    send(...args) {
        const tasks = []
        for (const device of this.attachedDevices) {
            if (!device.send) continue
            tasks.push(device.send(...args))
        }
        return Promise.all(tasks)
    }
    #onConnect({ device }) {
        if (this.attachedDevices.find(d => d.id === device.id)) return
        if (device.name) console.info(`Successfully attached controller: ${device.name}`)
        device.addEventListener('action', this.#actionDelegator)
        this.attachedDevices.push(device)
        this.dispatchEvent(new ConnectionEvent(device))
    }
    #onDisconnect({ device }) {
        const index = this.attachedDevices.findIndex(d => d.id === device.id)
        if (index < 0) return
        device.removeEventListener('action', this.#actionDelegator)
        this.attachedDevices.splice(index, 1)
        console.warn(`Disconnected ${device.name}`)
    }
}