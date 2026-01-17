import { MIDIDevice } from './base.js'
import { setupCodec } from './codec.js'

const MIDI_COMMANDS = {
    NOTE_OFF: 0x80,
    NOTE_ON: 0x90,
    CC: 0xb0,
    SYSEX: 0xf0,
}

export class FaderfoxUC4 extends MIDIDevice {
    static MIDIName = 'Faderfox UC4'
    name = 'Faderfox UC4'
    receive({ data }) {
        this.emit({ action: 'log', args: [data] })
        const [command, eventCode, value] = data
        const commandType = command & 0xf0
        if (commandType === MIDI_COMMANDS.CC) {
            const id = eventCode
            this.emit({ action: 'controlChange', args: [id, value] })
        } else if (commandType === MIDI_COMMANDS.NOTE_ON) {
            const id = eventCode
            this.emit({ action: 'buttonDown', args: [id] })
        } else if (commandType === MIDI_COMMANDS.NOTE_OFF) {
            const id = eventCode
            this.emit({ action: 'buttonUp', args: [id] })
        } else if (commandType === MIDI_COMMANDS.SYSEX) {
            const config = setupCodec.decode(data)
            this.emit({ action: 'load', args: [config] })
        }
    }
    load(config) {
        const buff = setupCodec.encode(config)
        return this.send(buff)
    }
    send(buff) {
        this.output.send(buff)
    }
}