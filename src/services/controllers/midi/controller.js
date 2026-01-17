import MIDIDevices from './index.js'
import { ConnectionEvent, DisconnectionEvent } from '../base.js'

// Monitor and manage attached MIDI devices
export class MIDIController extends EventTarget {
    constructor() {
        super()
        this.devices = {}
    }
    connectDevices() {
        for (const name in this.devices) {
            const deviceInfo = this.devices[name]
            // Continue if this device has already been instantiated
            if (deviceInfo.instance || !(deviceInfo.input && deviceInfo.output)) continue
            // Find matching class
            const deviceType = MIDIDevices.find(d => d.MIDIName === name)
            if (!deviceType) {
                console.warn(`No controller handler found for MIDI Device ${name}. Please add one.`)
                continue
            }
            // Connect the new device
            const device = new deviceType(this.devices[name])
            this.devices[name].instance = device
            this.dispatchEvent(new ConnectionEvent(device))
        }
    }
    discover({ inputs, outputs }) {
        // Collate inputs and outputs
        for (const port of [...inputs.values(), ...outputs.values()]) {
            this.processPort(port)
        }
    }
    processPort(port) {
        if (port.state === 'disconnected') {
            // Ignore if we're not tracking this device
            const deviceInfo = this.devices[port.name]
            if (!deviceInfo || !deviceInfo.instance) return
            const device = deviceInfo.instance
            device.close()
            this.dispatchEvent(new DisconnectionEvent(device))
            delete this.devices[port.name]
        } else if (port.state === 'connected') {
            const name = port.name
            if (!this.devices[name]) this.devices[name] = {}
            this.devices[name][port.type] = port
            this.connectDevices()
        }
    }
    destroy() {
        for (const entry of Object.values(this.inputs)) {
            entry.removeEventListener('midimessage', this._receiver)
        }
    }
    // Monitor midi devices and re-discover if they appear/disappear
    async monitor() {
        const access = await navigator.requestMIDIAccess({ sysex: true })
        access.addEventListener('statechange', ({ port }) => this.processPort(port))
        this.discover(access)
    }
}