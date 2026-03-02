<template>
    <div
        :class="['push-button control', { active, disabled, pressed }]"
        :style="{ background: `radial-gradient(${color}, ${color} 60%, #111)` }"
        @pointerdown="activate(true)"
        @pointerup="activate(false)"
    >
        <span class="channel" v-if="!disabled">CH{{ channel }}</span>
        <span class="cc" v-if="!disabled">cc{{ cc }}</span>
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
    color: {
        type: String,
        default: 'black'
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    max: {
        type: Number,
        default: 127,
    },
    min: {
        type: Number,
        default: 0,
    },
})

const value = defineModel('value', {
    type: Number,
    default: 0
})

const pressed = computed(() => value.value === props.max)
const { active } = useActiveFlash(() => pressed.value)

function activate(enabled) {
    value.value = enabled ? props.max : props.min
}
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
    flex-direction: column
    justify-content: center
    align-items: center
    &.pressed
        background: radial-gradient(#5ca, #5ca 60%, #111)
        box-shadow: inset .1em .1em .5em rgba(0, 0, 0, .5)
        transform: translate(1px, 1px)
</style>