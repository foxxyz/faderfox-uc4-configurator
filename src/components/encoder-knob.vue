<template>
    <div :class="['encoder-knob control', { active }]" ref="root" @mousedown="dragStart">
        <div class="knob" :style="{ transform: `rotate(${HOME_POSITION + value * MOVEMENT_RANGE}deg)` }" />
        <span class="channel">CH{{ channel }}</span>
        <span class="cc">cc{{ cc }}</span>
    </div>
</template>

<script setup>
import { useTemplateRef } from 'vue'
import { useActiveFlash } from '@/composables/active-flash.js'
import draggable from '@/composables/draggable.js'
import { mod } from '@/util/math.js'

const props = defineProps({
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

// Range of movement
const MOVEMENT_RANGE = 300
const HOME_POSITION = -150

const root = useTemplateRef('root')
const { dragStart } = draggable(null, {
    onDrag(_, pos) {
        const dims = root.value.getBoundingClientRect()
        const offset = [
            pos[0] - (dims.left + dims.width / 2),
            pos[1] - (dims.top + dims.height / 2)
        ]
        const angle = Math.atan2(offset[1], offset[0])
        value.value = Math.max(0, Math.min(1, mod(angle / Math.PI * 180 - HOME_POSITION + 90, 360) / MOVEMENT_RANGE))
    }
})

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