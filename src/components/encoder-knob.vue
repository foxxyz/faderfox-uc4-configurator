<template>
    <div :class="['encoder-knob control', { active }]">
        <div class="knob" :style="{ transform: `rotate(${HOME_POSITION + value * DEG_PER_UNIT}deg)` }" />
        <channel-select
            v-model="channel"
        />
        <input
            class="cc"
            title="Control Code (Rotate)"
            type="number"
            min="0"
            max="127"
            size="2"
            v-model="cc"
        >
        <input
            class="min"
            type="number"
            min="0"
            max="127"
            v-model="min"
            title="Minimum Value"
            size="2"
        >
        <input
            class="max"
            type="number"
            min="0"
            max="127"
            v-model="max"
            title="Maximum Value"
            size="2"
        >
    </div>
</template>

<script setup>
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

// Encoder has 127 units per full revolution
const DEG_PER_UNIT = 300 / 127
const HOME_POSITION = -150

const { active } = useActiveFlash(() => [props.value, props.pressed])
</script>

<style lang="sass">
.encoder-knob
    aspect-ratio: 1
    border-radius: 100%
    background: radial-gradient(#000, #777)
    border: solid 2px #111
    position: relative
    > input, > select
        position: absolute
        &.min
            left: -2em
            bottom: -.5em
            text-align: right
        &.max
            right: -1.5em
            bottom: -.5em
        &.cc
            right: -1.5em
            top: -1em
        &.channel-select
            left: -2em
            top: -1em
    label
        display: none
    .knob
        display: block
        width: 70%
        height: 70%
        margin-left: -35%
        margin-top: -35%
        position: absolute
        left: 50%
        top: 50%
        background: #444
        border: solid 2px #222
        border-radius: 100%
        &:before
            content: ''
            display: block
            width: 10%
            background: #aaa
            height: 20%
            left: 50%
            top: -25%
            position: absolute
            margin-left: -5%
</style>