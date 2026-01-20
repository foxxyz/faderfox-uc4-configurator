export function decodeMIDI(data) {
    const channel = (data[0] & 0xf) + 1
    const cc = data[1]
    const value = data[2]
    return { channel, cc, value }
}

export function formatMIDI(data) {
    const { channel, cc, value } = decodeMIDI(data)
    return `CH${channel} CC#${cc} ${value}`
}