<template>
    <div
        :class="['push-button control', { active, disabled, pressed }]"
        :style="{ background: `radial-gradient(${color}, ${color} 60%, #111)` }"
    >
        <channel-select
            v-model="channel"
        />
        <input
            v-if="!disabled"
            class="cc"
            type="number"
            value="0"
            size="2"
            title="Control Code"
            v-model="cc"
        >
    </div>
</template>

<script setup>
import channelSelect from '@/components/channel-select.vue'
import { useActiveFlash } from '@/composables/active-flash.js'

const cc = defineModel('cc', { type: Number })
const channel = defineModel('channel', { type: Number })

const props = defineProps({
    color: {
        type: String,
        default: 'black'
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    pressed: {
        type: Boolean,
        default: false
    }
})

const { active } = useActiveFlash(() => props.pressed)
</script>

<style lang="sass">
.push-button
    aspect-ratio: 1
    border-radius: 100%
    background: radial-gradient(#0a6, #0a6 60%, #111)
    box-shadow: .2em .2em .5em rgba(0, 0, 0, .2)
    border: solid 1px #111
    position: relative
    display: flex
    justify-content: center
    align-items: center
    &.pressed
        background: radial-gradient(#5ca, #5ca 60%, #111)
        box-shadow: inset .1em .1em .5em rgba(0, 0, 0, .5)
        transform: translate(1px, 1px)
    input
        &:focus
            background-color: #222 !important
        &.min
            position: absolute
            left: -2em
            bottom: -.5em
            text-align: right
        &.max
            position: absolute
            right: -1.5em
            bottom: -.5em
    .channel-select
        position: absolute
        top: -2em
</style>