<template>
    <div :class="['horizontal-fader', { active }]">
        <div class="bg" />
        <div class="track" />
        <channel-select
            v-model="channel"
        />
        <input
            class="min"
            title="Minimum Value"
            type="number"
            v-model="min"
        >
        <div class="handle" :style="{ left }">
            <input
                class="cc"
                name="cc"
                title="Control Code"
                type="number"
                v-model="cc"
            >
        </div>
        <input
            class="max"
            title="Maximum Value"
            type="number"
            v-model="max"
        >
    </div>
</template>

<script setup>
import { computed } from 'vue'

import channelSelect from '@/components/channel-select.vue'
import { useActiveFlash } from '@/composables/active-flash.js'

const cc = defineModel('cc', { type: Number })
const min = defineModel('min', { type: Number })
const max = defineModel('max', { type: Number })
const channel = defineModel('channel', { type: Number })

const props = defineProps({
    value: {
        type: Number,
        default: 0
    }
})

const left = computed(() => `${props.value * AMOUNT_PER_UNIT}%`)

// Fader has 127 units from bottom to top
const AMOUNT_PER_UNIT = 78 / 127

const { active } = useActiveFlash(() => props.value)
</script>

<style lang="sass">
.horizontal-fader
    display: flex
    flex-direction: column
    justify-content: center
    position: relative
    &:hover, &.active
        input, select
            transition: none
            opacity: .5
        .handle input
            opacity: 1
    input, select
        opacity: 0
        text-align: center
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
        input
            background: #000 !important
    .min, .max, .channel-select
        position: absolute
        top: 50%
        z-index: 2
        transform: translate(-50%, -50%)
        &.channel-select
            left: 50%
            top: -2em
        &.min
            left: -2em
        &.max
            right: -5.5em
    .track
        position: relative
        z-index: 1
        background: black
        border-radius: 1rem
        height: 15%
        width: 100%
</style>