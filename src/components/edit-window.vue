<template>
    <div class="edit-window" draggable="true">
        <form>
            <h3>Control Details</h3>
            <div class="channel">
                <label for="channel-select">Channel</label>
                <channel-select id="channel-select" v-model="parameters.channel" />
            </div>
            <div class="cc">
                <label for="cc">Control Code</label>
                <input
                    name="cc"
                    title="Control Code"
                    v-model="parameters.cc"
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
                    v-model="parameters.min"
                    size="2"
                >
            </div>
            <div class="cc">
                <label>Max/Down Value</label>
                <input
                    type="number"
                    min="0"
                    max="127"
                    v-model="parameters.max"
                    size="2"
                >
            </div>
            <div class="type">
                <label>Control Type</label>
                <select v-model="parameters.type">
                    <option
                        v-for="typeOption of TYPES[type]"
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
                <select v-model="parameters.mode">
                    <option
                        v-for="mode of MODES[type]"
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
                <select v-model="parameters.display">
                    <option
                        v-for="scale of SCALES[type]"
                        :key="scale.label"
                        :value="scale.value"
                        :title="scale.name"
                    >
                        {{ scale.label }}
                    </option>
                </select>
            </div>
        </form>
        <button
            type="button"
            class="close"
            @click="emit('close')"
        >
            ✕
        </button>
    </div>
</template>

<script setup>
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

defineProps({
    parameters: {
        type: Object,
        default: () => ({})
    },
    type: {
        type: String,
        default: null
    }
})

</script>

<style lang="sass">
.edit-window
    background: #333
    border-radius: .5rem

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

    form
        border: solid 2px #ccc
        border-radius: .5rem
        padding: .5rem 1rem 1rem

        > div
            display: flex
            align-items: center
            gap: 1em
            justify-content: space-between

        input, select
            width: 5em
</style>
