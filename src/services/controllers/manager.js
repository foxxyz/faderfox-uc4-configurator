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
    indicate(...args) {
        const tasks = []
        for (const device of this.attachedDevices) {
            if (!device.indicate) continue
            tasks.push(device.indicate(...args))
        }
        return Promise.all(tasks)
    }
    init() {
        for (const deviceType of HARDWARE_TYPES) {
            deviceType.addEventListener('connect', this.#onConnect.bind(this))
            deviceType.addEventListener('disconnect', this.#onDisconnect.bind(this))
            deviceType.monitor()
        }
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
    // Reconfigure controllers when mission changes
    configure(...args) {
        const tasks = []
        for (const device of this.attachedDevices) {
            if (!device.configure) continue
            tasks.push(device.configure(...args))
        }
        return Promise.all(tasks)
    }
}