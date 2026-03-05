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
const COMMAND_MAP = {}
for (const key in MIDI_COMMANDS) COMMAND_MAP[MIDI_COMMANDS[key]] = key

export function decodeMIDI(data) {
    const command = data[0] & 0xf0
    const channel = (data[0] & 0x0f) + 1
    const cc = data[1]
    const value = data[2] ?? ''
    return { command, channel, cc, value }
}

export function formatMIDI(data) {
    const { command, channel, cc, value } = decodeMIDI(data)
    return `${COMMAND_MAP[command]} CH${channel} CC#${cc} ${value}`
}