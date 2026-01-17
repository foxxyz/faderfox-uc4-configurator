import { BaseController } from '../base.js'

export class MIDIDevice extends BaseController {
    #receiver
    constructor({ input, output }) {
        super()
        this.id = input.id
        this.input = input
        this.output = output
        this.#receiver = this.receive.bind(this)
        this.input.addEventListener('midimessage', this.#receiver)
    }
    close() {
        this.input.removeEventListener('midimessage', this.#receiver)
    }
    // eslint-disable-next-line
    receive({ data }) {}
}