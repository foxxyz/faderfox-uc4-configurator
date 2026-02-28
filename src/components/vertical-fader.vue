<template>
    <div :class="['vertical-fader control', { active }]">
        <div class="bg" />
        <div class="track" />
        <span class="channel">CH{{ channel }}</span>
        <div class="handle" :style="{ bottom }">
            <span class="cc">cc{{ cc }}</span>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

import { useActiveFlash } from '@/composables/active-flash.js'

const props = defineProps({
    cc: {
        type: Number,
        default: 0,
    },
    channel: {
        type: Number,
        default: 1,
    },
    value: {
        type: Number,
        default: 0
    }
})

const bottom = computed(() => `${props.value * AMOUNT_PER_UNIT}%`)

const { active } = useActiveFlash(() => props.value)

// Fader has 127 units from bottom to top
const AMOUNT_PER_UNIT = 86 / 127
</script>

<style lang="sass">
.vertical-fader
    display: flex
    justify-content: center
    position: relative
    .bg
        position: absolute
        z-index: 0
        width: 100%
        height: 90%
        top: 5%
        background: repeating-linear-gradient(to bottom, transparent, transparent 95%, #ccc 95%, #ccc), repeating-linear-gradient(to bottom, transparent, transparent 98%, #ccc 98%, #ccc)
        background-size: 100% 24%
        background-position: 0 2%, 0 18%
    .handle
        position: absolute
        bottom: 0
        width: 70%
        aspect-ratio: 1
        background: #666
        z-index: 2
        display: flex
        flex-direction: column
        justify-content: center
        align-items: center
        box-shadow: 0 0 .5em rgba(0, 0, 0, .8)
        background: linear-gradient(to bottom, #333, #777 47%, #fff 47%, #fff 53%, #555 53%, #333)
        span
            background: #000 !important
            padding: .4em
    .channel
        position: absolute
        left: 50%
        z-index: 2
        transform: translate(-50%, -50%)
        top: -1em
    .track
        position: relative
        z-index: 1
        background: black
        border-radius: 1rem
        width: 15%
        height: 100%
</style>