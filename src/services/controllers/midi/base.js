import { BaseController } from '../base.js'

const MIDI_COMMANDS = {
    NOTE_OFF: 0x80,
    NOTE_ON: 0x90,
    PKP: 0xa0,
    CC: 0xb0,
    PC: 0xc0,
    AFTERTOUCH: 0xd0,
    PITCH_BEND: 0xe0,
    SYSEX: 0xf0,
}

export class MIDIDevice extends BaseController {
    #receiver
    constructor({ name, input, output }) {
        super()
        this.id = input.id
        this.name = name
        this.input = input
        this.output = output
        this.#receiver = this.receive.bind(this)
        this.input.addEventListener('midimessage', this.#receiver)
    }
    close() {
        this.input.removeEventListener('midimessage', this.#receiver)
    }
    receive({ data }) {
        this.emit({ action: 'log', args: [this.id, this.name, data, 'in'] })
        const [command, eventCode, value] = data
        const commandType = command & 0xf0
        const channel = command & 0x0f
        if (commandType === MIDI_COMMANDS.CC) {
            this.emit({ action: 'controlChange', args: [channel + 1, eventCode, value] })
        } else if (commandType === MIDI_COMMANDS.NOTE_ON) {
            this.emit({ action: 'buttonDown', args: [channel + 1, eventCode, value] })
        } else if (commandType === MIDI_COMMANDS.NOTE_OFF) {
            this.emit({ action: 'buttonUp', args: [channel + 1, eventCode, value] })
        }
        return data
    }
    send({ type = 'CC', channel, cc, value }) {
        const msg = new Uint8Array(type === 'PC' || type === 'AFTERTOUCH' ? 2 : 3)
        msg[0] = MIDI_COMMANDS[type] + channel - 1
        // Program changes are only 2 bytes
        if (type === 'PC' || type === 'AFTERTOUCH') {
            msg[1] = Math.round(value)
        } else {
            msg[1] = cc
            msg[2] = Math.round(value)
        }
        this.emit({ action: 'log', args: [this.id, this.name, msg, 'out'] })
        this.output.send(msg)
    }
}