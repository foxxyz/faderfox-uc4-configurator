<template>
    <div :class="['vertical-fader', { active }]">
        <div class="bg" />
        <div class="track" />
        <channel-select
            v-model="channel"
        />
        <input
            class="max"
            type="number"
            title="Maximum Value"
            v-model="max"
        >
        <div class="handle" :style="{ bottom }">
            <input
                class="cc"
                name="cc"
                type="number"
                title="Control Code"
                v-model="cc"
            >
        </div>
        <input
            class="min"
            type="number"
            title="Minimum Value"
            v-model="min"
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
        input
            background: #000 !important
    .min, .max, .channel-select
        position: absolute
        left: 50%
        z-index: 2
        transform: translate(-50%, -50%)
        &.channel-select
            top: -3em
        &.min
            bottom: -3em
        &.max
            top: -1.5em
    .track
        position: relative
        z-index: 1
        background: black
        border-radius: 1rem
        width: 15%
        height: 100%
</style>