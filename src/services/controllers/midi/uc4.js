import { MIDIDevice } from './base.js'
import { setupCodec } from './codec.js'

export class FaderfoxUC4 extends MIDIDevice {
    static MIDIName = 'Faderfox UC4'
    name = 'Faderfox UC4'
    receive({ data }) {
        const [command, eventCode, value] = super.receive({ data })
        // Sysex
        if ((command & 0xf0) === 0xf0) {
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