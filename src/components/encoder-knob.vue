<template>
    <div :class="['encoder-knob control', { active }]">
        <div class="knob" :style="{ transform: `rotate(${HOME_POSITION + value * DEG_PER_UNIT}deg)` }" />
        <span class="channel">CH{{ channel }}</span>
        <span class="cc">cc{{ cc }}</span>
    </div>
</template>

<script setup>
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
        default: 0,
    }
})

// Encoder has 127 units per full revolution
const DEG_PER_UNIT = 300 / 127
const HOME_POSITION = -150

const { active } = useActiveFlash(() => props.value)
</script>

<style lang="sass">
.encoder-knob
    aspect-ratio: 1
    border-radius: 100%
    background: radial-gradient(#000, #777)
    border: solid 2px #111
    position: relative
    span
        position: absolute
        &.cc
            right: 0
            top: -1em
        &.channel
            left: 0
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