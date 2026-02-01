<template>
    <div :class="['edit-window', { dragging }]" :style="style">
        <form>
            <h3 ref="header">
                Control Details
            </h3>
            <div class="channel">
                <label for="channel-select">Channel</label>
                <channel-select id="channel-select" v-model="commonChannel" />
            </div>
            <div class="cc">
                <label for="cc">Control Code</label>
                <input
                    name="cc"
                    title="Control Code"
                    v-model="commonCC"
                    type="number"
                    min="0"
                    max="127"
                >
            </div>
            <div class="min">
                <label>Min/Up Value</label>
                <input
                    type="number"
                    min="0"
                    max="127"
                    v-model="commonMin"
                    size="2"
                >
            </div>
            <div class="cc">
                <label>Max/Down Value</label>
                <input
                    type="number"
                    min="0"
                    max="127"
                    v-model="commonMax"
                    size="2"
                >
            </div>
            <div class="type">
                <label>Control Type</label>
                <select
                    v-model="commonControlType"
                    :disabled="!commonType"
                >
                    <option
                        v-for="typeOption of TYPES[commonType]"
                        :key="typeOption.label"
                        :value="typeOption.value"
                        :title="typeOption.name"
                    >
                        {{ typeOption.label }}
                    </option>
                </select>
            </div>
            <div class="mode">
                <label>Control Mode</label>
                <select
                    v-model="commonMode"
                    :disabled="!commonType"
                >
                    <option
                        v-for="mode of MODES[commonType]"
                        :key="mode.label"
                        :value="mode.value"
                        :title="mode.name"
                    >
                        {{ mode.label }}
                    </option>
                </select>
            </div>
            <div class="scale">
                <label>Display Scale</label>
                <select
                    v-model="commonScale"
                    :disabled="!commonType"
                >
                    <option
                        v-for="scale of SCALES[commonType]"
                        :key="scale.label"
                        :value="scale.value"
                        :title="scale.name"
                    >
                        {{ scale.label }}
                    </option>
                </select>
            </div>
            <button
                type="button"
                class="close"
                @click="emit('close')"
            >
                ✕
            </button>
        </form>
    </div>
</template>

<script setup>
import { computed, useTemplateRef } from 'vue'
import draggable from '@/composables/draggable.js'

import channelSelect from './channel-select.vue'

const TYPES = {
    button: [
        { value: 0, label: 'Off', name: 'Sends no command' },
        { value: 1, label: 'Note', name: 'Sends a NOTE_ON / NOTE_OFF' },
        { value: 2, label: 'CC', name: 'Sends a Control Change' },
        { value: 3, label: 'PC', name: 'Sends a Program Change' },
        { value: 4, label: 'Aftertouch', name: 'Sends an aftertouch command' },
    ],
    encoder: [
        { value: 0, label: 'Rel CC 1', name: 'Relative Mode 1 [1 left, 127 right]' },
        { value: 1, label: 'Rel CC 2', name: 'Relative Mode 2 [63 left, 65 right]' },
        { value: 2, label: 'Abs CC', name: 'Absolute Control Change [0-127]' },
        { value: 3, label: 'Abs PC', name: 'Absolute Program Change [0-127]' },
        { value: 4, label: 'CC Hi-res', name: 'Two Control Change Outputs [0-16383]' },
        { value: 5, label: 'Pitch bend', name: 'Pitch Bend [14bit 0-16383]' },
        { value: 6, label: 'Aftertouch', name: 'Aftertouch Command [0-127]' },
    ],
    fader: [
        { value: 0, label: 'Abs CC', name: 'Absolute Control Change [0-127]' },
        { value: 1, label: 'Abs PC', name: 'Absolute Program Change [0-127]' },
        { value: 2, label: 'Pitch bend', name: 'Pitch Bend [14bit 0-16383]' },
        { value: 3, label: 'Aftertouch', name: 'Aftertouch Command [0-127]' },
    ]
}

const MODES = {
    button: [
        { value: 0, label: 'Button', name: 'Sends down on press, up on release' },
        { value: 1, label: 'Toggle', name: 'Press to toggle on, press again to toggle off' },
    ],
    encoder: [
        { value: 0, label: 'None', name: 'No acceleration during turning' },
        { value: 1, label: 'Mild', name: 'Low acceleration while turning' },
        { value: 2, label: 'Med', name: 'Medium acceleration while turning' },
        { value: 3, label: 'Max', name: 'Max acceleration while turning' },
    ],
    fader: [
        { value: 0, label: 'Snap', name: 'Sends command at end of move' },
        { value: 1, label: 'Jump', name: 'Immediate send while moving' },
    ]
}

const SCALES = {
    button: [
        { value: 0, label: 'Blind', name: 'No LED control' },
        { value: 1, label: 'Standard', name: 'LED control via device and external' },
        { value: 2, label: 'Ext', name: 'External LED control only' },
    ],
    encoder: [
        { value: 0, label: 'Blind', name: 'No display' },
        { value: 1, label: 'Standard', name: 'Standard [0-127]' },
        { value: 2, label: 'Bipolar', name: 'Bipolar [-63-63]' },
    ],
    fader: [
        { value: 0, label: 'Blind', name: 'No display' },
        { value: 1, label: 'Standard', name: 'Standard [0-127]' },
        { value: 2, label: 'Bipolar', name: 'Bipolar [-63-63]' },
    ]
}

const emit = defineEmits(['close'])

const props = defineProps({
    controls: {
        type: Array,
        default: () => [],
    }
})

const pos = defineModel('position', { type: Array })

function multiModel(key) {
    return computed({
        get() {
            const firstValue = props.controls[0]?.parameters[key]
            if (props.controls.some(c => c.parameters[key] !== firstValue)) return null
            return firstValue
        },
        set(value) {
            for (const control of props.controls) control.parameters[key] = value
        }
    })
}

const commonChannel = multiModel('channel')
const commonCC = multiModel('cc')
const commonMin = multiModel('min')
const commonMax = multiModel('max')
const commonControlType = multiModel('type')
const commonMode = multiModel('mode')
const commonScale = multiModel('display')

const commonType = computed(() => {
    const firstType = props.controls[0]?.type
    if (props.controls.some(c => c.type !== firstType)) return null
    return firstType
})

const header = useTemplateRef('header')
const { dragging } = draggable(header, {
    onDrag([dx, dy]) {
        pos.value[0] += dx
        pos.value[1] += dy
    }
})

const style = computed(() => ({
    transform: `translate(${pos.value[0]}px, ${pos.value[1]}px)`,
}))
</script>

<style lang="sass">
.edit-window
    &:not(.dragging)
        transition: transform .3s ease-in-out

    .close
        position: absolute
        top: 0
        right: 0
        background: none
        border: none
        color: #888
        padding: .5rem
        &:hover
            background: none
            border: none
            color: white

    h3
        font-family: Audiowide
        text-transform: uppercase
        font-size: .7em
        margin-bottom: 1em
        text-align: center
        cursor: move
        user-select: none

    form
        background: #333
        border: solid 2px #ccc
        border-radius: .5rem
        padding: .5rem 1rem 1rem
        box-shadow: .3em .3em .2em rgba(0, 0, 0, .3)

        > div
            display: flex
            align-items: center
            gap: 1em
            justify-content: space-between

        input, select
            width: 5em
</style>
