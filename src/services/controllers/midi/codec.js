
const CHAR_MAP = '0123456789AbCdEFGHIJLNnOPqrStUXYZ-_'
const char = {
    decode(char) {
        if (char < CHAR_MAP.length) return CHAR_MAP[char]
        if (char < 127) return String.fromCharCode(char)
        return '?'
    },
    encode(char) {
        // Try lower and uppercase versions
        const alternates = [char, char.toUpperCase(), char.toLowerCase()]
        for (const alt of alternates) {
            if (CHAR_MAP.includes(alt)) return CHAR_MAP.indexOf(alt)
        }
        return CHAR_MAP.indexOf('_')
    }
}

function keyList(key) {
    return {
        decode(r, values) {
            r[key] = values
        },
        encode(objs) {
            return objs.map(o => o[key])
        }
    }
}

const channelType = {
    decode(r, values) {
        r.type = values.map(v => (v & 0xf0) >> 4)
        r.channel = values.map(v => (v & 0x0f) + 1)
    },
    encode(objs) {
        return objs.map(o => (o.type << 4) + (o.channel - 1))
    }
}

const modeDisplay = {
    decode(r, values) {
        r.mode = values.map(v => (v & 0xf0) >> 4)
        r.display = values.map(v => v & 0x0f)
    },
    encode(objs) {
        return objs.map(o => (o.mode << 4) + o.display)
    }
}

const groupNames = {
    decode(r, values) {
        r.name = []
        for (let i = 0; i < values.length; i += 4) {
            r.name.push(values.slice(i, i + 4).map(char.decode).join(''))
        }
    },
    encode(objs) {
        return [...objs.map(o => o.name).join('')].map(char.encode)
    }
}

const XFADER_ORDER = [
    channelType,
    keyList('cc'),
    keyList('min'),
    keyList('max'),
    modeDisplay,
]

const xFaderParams = {
    decode(r, values) {
        for (let i = 0; i < XFADER_ORDER.length; i++) {
            const parser = XFADER_ORDER[i]
            parser.decode(r, values.filter((e, idx) => idx % 5 === i))
        }
    },
    encode(objs) {
        return objs.map(o => XFADER_ORDER.map(parser => parser.encode([o])).flat()).flat()
    }
}

const BANK_MAP = [
    {
        section: 'groups',
        filter: groups => groups,
        banks: [
            { sectionAddress: 0x14, address: 0x80, codec: groupNames },
        ],
    },
    {
        section: 'xFader',
        filter: groups => groups.map(o => o.xFader),
        banks: [
            { sectionAddress: 0x17, address: 0x00, codec: xFaderParams },
        ],
    },
    {
        section: 'encoders',
        filter: groups => groups.map(o => o.encoders).flat(),
        banks: [
            { sectionAddress: 0x1c, address: 0x00, codec: channelType },
            { sectionAddress: 0x1c, address: 0x40, codec: keyList('cc') },
            { sectionAddress: 0x1c, address: 0x80, codec: keyList('min') },
            { sectionAddress: 0x1c, address: 0xc0, codec: keyList('max') },
            { sectionAddress: 0x1d, address: 0x00, codec: modeDisplay },
        ],
    },
    {
        section: 'encoderBtns',
        filter: groups => groups.map(o => o.encoderBtns).flat(),
        banks: [
            { sectionAddress: 0x1d, address: 0x40, codec: channelType },
            { sectionAddress: 0x1d, address: 0x80, codec: keyList('cc') },
            { sectionAddress: 0x1d, address: 0xc0, codec: keyList('up') },
            { sectionAddress: 0x1e, address: 0x00, codec: keyList('down') },
            { sectionAddress: 0x1e, address: 0x40, codec: modeDisplay },
        ],
    },
    {
        section: 'greenBtns',
        filter: groups => groups.map(o => o.greenBtns).flat(),
        banks: [
            { sectionAddress: 0x1e, address: 0x80, codec: channelType },
            { sectionAddress: 0x1e, address: 0xc0, codec: keyList('cc') },
            { sectionAddress: 0x1f, address: 0x00, codec: keyList('up') },
            { sectionAddress: 0x1f, address: 0x40, codec: keyList('down') },
            { sectionAddress: 0x1f, address: 0x80, codec: modeDisplay },
        ],
    },
    {
        section: 'faders',
        filter: groups => groups.map(o => o.faders).flat(),
        banks: [
            { sectionAddress: 0x1f, address: 0xc0, codec: channelType },
            { sectionAddress: 0x20, address: 0x00, codec: keyList('cc') },
            { sectionAddress: 0x20, address: 0x40, codec: keyList('min') },
            { sectionAddress: 0x20, address: 0x80, codec: keyList('max') },
            { sectionAddress: 0x20, address: 0xc0, codec: modeDisplay },
        ],
    },
]

// Construct reverse lookup map for decoding
const BANK_LOOKUP = {}
for (const { section, banks } of BANK_MAP) {
    for (const { sectionAddress, address, codec } of banks) {
        if (!BANK_LOOKUP[sectionAddress]) BANK_LOOKUP[sectionAddress] = {}
        BANK_LOOKUP[sectionAddress][address] = [section, codec]
    }
}

const COMMAND_CODES = {
    0x49: 'sectionAddress',
    0x4a: 'bankAddress',
    0x4b: 'checksum1',
    0x4c: 'checksum2',
    0x4d: 'setValue',
}
const COMMAND_CODE_MAP = {}
for (const code in COMMAND_CODES) COMMAND_CODE_MAP[COMMAND_CODES[code]] = parseInt(code)

function zip(key, groups, values, numControls = 8) {
    for (let i = 0; i < groups.length; i++) {
        const objs = []
        for (let j = 0; j < numControls; j++) {
            const obj = {}
            for (const key in values) obj[key] = values[key][i * numControls + j]
            objs.push(obj)
        }
        groups[i][key] = numControls > 1 ? objs : objs[0]
    }
}

const commandCodec = {
    decode(bytes) {
        return {
            command: COMMAND_CODES[bytes[0]],
            value: ((bytes[1] & 0x0f) << 4) + (bytes[2] & 0x0f)
        }
    },
    encode({ command, value }) {
        return [COMMAND_CODE_MAP[command], 0x20 + (value >> 4), 0x10 + (value & 0x0f)]
    }
}

export const bank = {
    decode(buff) {
        let sectionCode, expectedChecksum, section, parser
        const values = []
        for (let i = 0; i < buff.length; i += 3) {
            const cmdBytes = buff.subarray(i, i + 3)
            const { command, value } = commandCodec.decode(cmdBytes)
            if (command === 'sectionAddress') {
                sectionCode = value
            } else if (command === 'bankAddress') {
                [section, parser] = BANK_LOOKUP[sectionCode][value]
            } else if (command === 'setValue') {
                values.push(value)
            } else if (command === 'checksum1') {
                expectedChecksum = value << 8
            } else if (command === 'checksum2') {
                expectedChecksum += value
                const actualChecksum = values.reduce((a, c) => a + c, 0) & 0xffff
                if (expectedChecksum !== actualChecksum) {
                    throw new Error(`Checksum failure! Expected ${expectedChecksum}, got ${actualChecksum}.`)
                }
                // Checksum passed, return
                // (add 30 more bytes for the null-byte padding at the end
                // of every section)
                return { numBytes: i + 30, section, parser, values }
            }
        }
    },
    encode({ sectionAddress, address, codec, objs }) {
        const values = codec.encode(objs)
        if (values.length % 32 !== 0) values.push(...Array(Math.ceil(values.length / 32) * 32 - values.length).fill(255))
        const checksum = values.reduce((a, c) => a + c, 0) & 0xffff
        return new Uint8Array([
            ...commandCodec.encode({ command: 'sectionAddress', value: sectionAddress }),
            ...commandCodec.encode({ command: 'bankAddress', value: address }),
            ...values.map(value => commandCodec.encode({ command: 'setValue', value })).flat(),
            ...commandCodec.encode({ command: 'checksum1', value: checksum >> 8 }),
            ...commandCodec.encode({ command: 'checksum2', value: checksum & 0xff }),
            ...Array(30).fill(0),
        ])
    }
}

const SYSEX_HEADER = [0xf0, 0x00, 0x00, 0x00]
const UC4_HEADER = [
    0x41, 0x20, 0x16,
    0x42, 0x20, 0x12,
    0x43, 0x20, 0x12,
    0x44, 0x20, 0x15
]
const UC4_FOOTER = [0x4f, 0x20, 0x16]
const SYSEX_FOOTER = [0xf7]

export const setupCodec = {
    decode(buff) {
        const setupValues = {}
        // Skip over first 4 bytes (0xf0 00 00 00 sysex)
        for (let i = 4; i < buff.length; i += 3) {
            const cmdBytes = buff.subarray(i, i + 3)
            const { command } = commandCodec.decode(cmdBytes)
            if (command !== 'sectionAddress') continue
            const { numBytes, section, parser, values } = bank.decode(buff.subarray(i))
            i += numBytes
            if (!setupValues[section]) setupValues[section] = {}
            parser.decode(setupValues[section], values)
        }

        // Process all the values into objects
        const groups = Array.from({ length: 8 }, (_, idx) => ({ index: idx }))
        for (const section in setupValues) {
            if (section === 'xFader') {
                zip(section, groups, setupValues[section], 1)
            } else if (section === 'groups') {
                for (let i = 0; i < 8; i++) groups[i].name = setupValues[section].name[i]
            } else {
                zip(section, groups, setupValues[section])
            }
        }

        return groups
    },
    encode(groups) {
        const banks = []
        for (const section of BANK_MAP) {
            const objs = section.filter(groups)
            for (const { sectionAddress, address, codec } of section.banks) {
                banks.push(bank.encode({
                    sectionAddress,
                    address,
                    codec,
                    objs
                }))
            }
        }
        // Every section/bank is 234 bytes
        const buff = new Uint8Array(SYSEX_HEADER.length + UC4_HEADER.length + banks.reduce((a, c) => a + c.length, 0) + UC4_FOOTER.length + SYSEX_FOOTER.length)
        let i = 0
        buff.set(SYSEX_HEADER, i)
        i += SYSEX_HEADER.length
        buff.set(UC4_HEADER, i)
        i += UC4_HEADER.length
        for (const bank of banks) {
            buff.set(bank, i)
            i += bank.length
        }
        buff.set(UC4_FOOTER, i)
        i += UC4_FOOTER.length
        buff.set(SYSEX_FOOTER, i)
        i += SYSEX_FOOTER.length
        return buff
    }
}