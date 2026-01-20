import { BaseController } from '../base.js'

const MIDI_COMMANDS = {
    NOTE_OFF: 0x80,
    NOTE_ON: 0x90,
    CC: 0xb0,
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
        this.emit({ action: 'log', args: [this.id, this.name, data] })
        const [command, eventCode, value] = data
        const commandType = command & 0xf0
        const channel = command & 0x0f
        if (commandType === MIDI_COMMANDS.CC) {
            this.emit({ action: 'controlChange', args: [channel + 1, eventCode, value] })
        } else if (commandType === MIDI_COMMANDS.NOTE_ON) {
            this.emit({ action: 'buttonDown', args: [channel + 1, eventCode] })
        } else if (commandType === MIDI_COMMANDS.NOTE_OFF) {
            this.emit({ action: 'buttonUp', args: [channel + 1, eventCode] })
        }
        return data
    }
}