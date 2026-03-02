<template>
    <div :class="['horizontal-fader control', { active }]" ref="root">
        <div class="bg" />
        <div class="track" />
        <span class="channel">CH{{ channel }}</span>
        <div class="handle" :style="{ left }" @mousedown="dragStart">
            <span class="cc">cc{{ cc }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed, useTemplateRef } from 'vue'

import { useActiveFlash } from '@/composables/active-flash.js'
import draggable from '@/composables/draggable.js'

defineProps({
    cc: {
        type: Number,
        default: 0,
    },
    channel: {
        type: Number,
        default: 1,
    },
})

const value = defineModel('value', {
    type: Number,
    default: 0
})

const root = useTemplateRef('root')
const { dragStart } = draggable(null, {
    onDrag([x]) {
        const dims = root.value.getBoundingClientRect()
        value.value = Math.max(0, Math.min(127, value.value + x / dims.width * (100 / AMOUNT_PER_UNIT)))
    }
})

const left = computed(() => `${value.value * AMOUNT_PER_UNIT}%`)

// Fader has 127 units from left to right
const AMOUNT_PER_UNIT = 78 / 127

const { active } = useActiveFlash(() => value.value)
</script>

<style lang="sass">
.horizontal-fader
    display: flex
    flex-direction: column
    justify-content: center
    position: relative
    .bg
        position: absolute
        z-index: 0
        width: 82%
        height: 100%
        left: 10%
        background: repeating-linear-gradient(to right, transparent, transparent 95%, #ccc 95%, #ccc), repeating-linear-gradient(to right, transparent, transparent 98%, #ccc 98%, #ccc)
        background-size: 24% 100%
        background-position: 2% 0, 18% 0
    .handle
        position: absolute
        height: 80%
        aspect-ratio: 1
        background: #666
        z-index: 2
        display: flex
        flex-direction: column
        justify-content: center
        align-items: center
        box-shadow: 0 0 .5em rgba(0, 0, 0, .8)
        background: linear-gradient(to right, #333, #777 47%, #fff 47%, #fff 53%, #555 53%, #333)
        span
            background: #000 !important
            padding: .4em
    .channel
        position: absolute
        top: 50%
        z-index: 2
        transform: translate(-50%, -50%)
        left: 50%
        top: -2em
    .track
        position: relative
        z-index: 1
        background: black
        border-radius: 1rem
        height: 15%
        width: 100%
</style>