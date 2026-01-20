<template>
    <div class="midi-monitor">
        <ul class="format-selector">
            <li
                v-for="formatType of FORMATS"
                :key="formatType"
                @click="setFormat(formatType.id)"
                :class="{ active: formatType.id === activeFormat }"
            >
                {{ formatType.name }}
            </li>
        </ul>
        <ol>
            <li
                v-for="message of log"
                :key="message.time"
            >
                {{ format(message) }}
            </li>
        </ol>
    </div>
</template>

<script setup>
import { inject, reactive, ref } from 'vue'
import { formatMIDI } from '@/util/format.js'

const controller = inject('$controllers')

const MAX_LOG_SIZE = 50
const log = reactive([])

function format({ time, name, data }) {
    const seconds = (Math.round(time) / 1000).toFixed(2)
    if (activeFormat.value === 'hex') {
        const hex = [...data].map(b => b.toString(16).padStart(2, '0'))
        return `${seconds}: [${name}] [${hex.join(' ')}]`
    }
    return `${seconds}: [${name}] ${formatMIDI(data)}`
}

const FORMATS = [
    { id: 'human', name: 'Human' },
    { id: 'hex', name: 'Hex' },
]
const activeFormat = ref('human')
function setFormat(type) {
    activeFormat.value = type
}

controller.addEventListener('action', ({ action, args: [id, name, data] }) => {
    // Ignore non-log messages
    if (action !== 'log') return
    // Ignore sysex messages
    if ((data[0] & 0xf0) === 0xf0) return
    const time = performance.now()
    log.unshift({ time, name, data })
    log.splice(MAX_LOG_SIZE, log.length - MAX_LOG_SIZE)
})
</script>

<style lang="sass">
.midi-monitor
    background: #444444cc
    min-height: 50em
    padding: 0 1rem 1rem
    ol
        list-style: none
        font-family: monospace
        > li
            animation: highlight 1s
            animation-delay: 2s
            animation-fill-mode: both

    .format-selector
        margin-bottom: 1rem
        display: flex
        list-style: none
        justify-content: flex-end
        gap: .5em
        color: #888
        li
            border: solid 1px #888
            padding: .2em .5em
            cursor: pointer
            &.active, &:hover
                border-color: white
                color: white

    @keyframes highlight
        from
            color: #fff
        to
            color: #666
</style>