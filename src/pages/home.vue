<template>
    <main>
        <div class="wrapper">
            <h1>Faderfox UC4 Configurator</h1>
            <notifier ref="notifications" />
            <div :class="['device', waitingForMode, { waitingForMode }]">
                <div class="section encoders">
                    <div class="group">
                        <select
                            :value="currentGroup.index"
                            @change="changeGroup"
                        >
                            <option
                                v-for="(group, idx) of groups"
                                :key="idx"
                                :value="idx"
                            >
                                Group {{ idx + 1 }}
                            </option>
                        </select>
                        <input
                            type="text"
                            size="5"
                            maxlength="4"
                            placeholder="Name"
                            title="Group Name"
                            v-model="currentGroup.name"
                        >
                    </div>
                    <div
                        class="encoder-wrapper"
                        v-for="({ encoder, button }, idx) of encoders"
                        :key="idx"
                    >
                        <encoder-knob
                            :class="{ modified: hasChanged(encoder), editing: editSelection.parameters == encoder }"
                            v-bind="encoder"
                            @mousedown="bindEditWindow(encoder, 'encoder')"
                            v-model:cc="encoder.cc"
                            v-model:min="encoder.min"
                            v-model:max="encoder.max"
                            v-model:channel="encoder.channel"
                        />
                        <push-button
                            :class="{ modified: hasChanged(button), editing: editSelection.parameters == button }"
                            :pressed="button.value === button.max"
                            @mousedown="bindEditWindow(button, 'button')"
                            v-model:channel="button.channel"
                            v-model:cc="button.cc"
                        />
                    </div>
                </div>
                <div class="section">
                    <div class="faders">
                        <vertical-fader
                            v-for="(fader, idx) of currentGroup.faders"
                            :class="{ modified: hasChanged(fader), editing: editSelection.parameters == fader }"
                            :key="idx"
                            v-bind="fader"
                            @mousedown="bindEditWindow(fader, 'fader')"
                            v-model:cc="fader.cc"
                            v-model:min="fader.min"
                            v-model:max="fader.max"
                            v-model:channel="fader.channel"
                        />
                    </div>
                    <div class="cross-fader">
                        <push-button
                            class="setup"
                            color="gray"
                            :disabled="true"
                        />
                        <horizontal-fader
                            :class="{ modified: hasChanged(currentGroup.xFader), editing: editSelection.parameters == currentGroup.xFader }"
                            @mousedown="bindEditWindow(currentGroup.xFader, 'fader')"
                            v-bind="currentGroup.xFader"
                            v-model:cc="currentGroup.xFader.cc"
                            v-model:min="currentGroup.xFader.min"
                            v-model:max="currentGroup.xFader.max"
                            v-model:channel="currentGroup.xFader.channel"
                        />
                        <push-button
                            class="shift"
                            color="#333"
                            :disabled="true"
                        />
                    </div>
                    <div class="green-buttons">
                        <push-button
                            v-for="(button, idx) of currentGroup.greenBtns"
                            :key="idx"
                            :class="{ modified: hasChanged(button), editing: editSelection.parameters == button }"
                            @mousedown="bindEditWindow(button, 'button')"
                            color="#0a6"
                            :pressed="button.value === button.max"
                            v-model:cc="button.cc"
                            v-model:channel="button.channel"
                        />
                    </div>
                </div>
                <div class="status" v-if="waitingForMode === 'load'">
                    <p>Waiting for data...</p>
                    <ul class="actions">
                        <li>
                            <button type="button" @click="cancelMode">
                                Cancel
                            </button>
                        </li>
                    </ul>
                </div>
                <div class="status" v-if="waitingForMode === 'send'">
                    <p>Ensure receive mode is active, then hit Send.</p>
                    <ul class="actions">
                        <li>
                            <button type="button" @click="cancelMode">
                                Cancel
                            </button>
                        </li>
                        <li>
                            <button type="button" @click="send">
                                Send
                            </button>
                        </li>
                    </ul>
                </div>
                <div class="status" v-if="waitingForMode === 'armed'">
                    <p>MIDI Message Learned: {{ formatMIDI(activeRecording) }}</p>
                    <p>Touch Faderfox Control to map to...</p>
                    <ul class="actions">
                        <li>
                            <button type="button" @click="cancelMode">
                                Cancel
                            </button>
                        </li>
                    </ul>
                </div>
                <button
                    type="button"
                    class="advanced-toggle"
                    title="Show Advanced Options"
                    @click="toggleEditWindow()"
                >
                    ⚙
                </button>
            </div>
            <div class="actions">
                <ul>
                    <li>
                        <button type="button" @click="enterMode('load')" :disabled="activeInstructions.length">
                            Read from Device
                        </button>
                    </li>
                    <li>
                        <button type="button" @click="enterMode('send')" :disabled="activeInstructions.length">
                            Write to Device
                        </button>
                        <p class="warning" v-if="pendingChanges">
                            Unsaved Changes
                        </p>
                    </li>
                </ul>
            </div>
        </div>
        <ol class="instructions" v-if="activeInstructions.length">
            <li
                v-for="(line, idx) of activeInstructions"
                :key="idx"
                v-html="line.content"
                :class="line.anchor"
                :style="line.style"
            />
        </ol>
        <aside :class="['monitor', { active: showMIDIMonitor }]">
            <h3 @click="toggleMIDIMonitor">
                {{ showMIDIMonitor ? 'Hide' : 'Show' }} MIDI Monitor
            </h3>
            <transition name="slide">
                <midi-monitor v-show="showMIDIMonitor" />
            </transition>
        </aside>
        <aside class="other-devices learn" v-if="otherDevices.length">
            <h3>
                Other Devices
            </h3>
            <ul>
                <li v-for="device of otherDevices" :key="device.id">
                    <span class="name">{{ device.name }}</span>
                    <button
                        type="button"
                        :class="{ active: learnMode === device.id }"
                        @click="toggleLearn(device.id)"
                    >
                        {{ learnMode === device.id ? 'Disconnect' : 'Learn' }}
                    </button>
                </li>
            </ul>
        </aside>
        <transition name="appear">
            <edit-window
                v-if="showEditWindow"
                v-bind="editSelection"
                @close="toggleEditWindow(false)"
            />
        </transition>
    </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, reactive, ref } from 'vue'

import editWindow from '@/components/edit-window.vue'
import encoderKnob from '@/components/encoder-knob.vue'
import pushButton from '@/components/push-button.vue'
import horizontalFader from '@/components/horizontal-fader.vue'
import midiMonitor from '@/components/midi-monitor.vue'
import notifier from '@/components/notifier.vue'
import verticalFader from '@/components/vertical-fader.vue'

import DEFAULT_CONFIG from '@/data/empty-config.json'
import { decodeMIDI, formatMIDI } from '@/util/format.js'

const SECTIONS = ['encoders', 'faders', 'encoderBtns', 'greenBtns']
function addTracking(config) {
    for (const group of config) {
        group.lastName = group.name
        for (const section of SECTIONS) {
            for (const control of group[section]) {
                for (const key in control) {
                    if (key.startsWith('last')) continue
                    control[`last${key[0].toUpperCase()}${key.slice(1)}`] = control[key]
                }
            }
        }
        const control = group.xFader
        for (const key in control) {
            control[`last${key[0].toUpperCase()}${key.slice(1)}`] = control[key]
        }
    }
    return config
}

const groups = ref(addTracking(DEFAULT_CONFIG))
const currentGroup = ref(groups.value[0])
const controls = computed(() => [...currentGroup.value.encoders, ...currentGroup.value.faders, ...currentGroup.value.encoderBtns, ...currentGroup.value.greenBtns, currentGroup.value.xFader])
const encoders = computed(() => {
    const zipped = []
    for (let i = 0; i < currentGroup.value.encoders.length; i++) {
        zipped.push({
            encoder: currentGroup.value.encoders[i],
            button: currentGroup.value.encoderBtns[i],
        })
    }
    return zipped
})

const notifications = ref()

const showMIDIMonitor = ref(false)
function toggleMIDIMonitor() {
    showMIDIMonitor.value = !showMIDIMonitor.value
}

const learnMode = ref('')
function toggleLearn(deviceID) {
    learnMode.value = learnMode.value === deviceID ? null : deviceID
}

const showEditWindow = ref(false)
const editSelection = ref({ parameters: {} })
function bindEditWindow(parameters, type) {
    editSelection.value = { parameters, type }
}
function toggleEditWindow(enabled) {
    showEditWindow.value = enabled !== undefined ? enabled : !showEditWindow.value
}

function groupHasChanges(group) {
    return group.name !== group.lastName ||
        group.faders.some(hasChanged) ||
        group.encoders.some(hasChanged) ||
        group.encoderBtns.some(hasChanged) ||
        group.greenBtns.some(hasChanged) ||
        hasChanged(group.xFader)
}
function hasChanged(control) {
    for (const key in control) {
        if (key.startsWith('last') || key === 'value' || key === 'pressed') continue
        if (control[key] !== control[`last${key[0].toUpperCase()}${key.slice(1)}`]) return true
    }
}
const pendingChanges = computed(() => groups.value.some(g => groupHasChanges(g)))

function findInOtherGroups({ channel, cc }, sections = []) {
    for (const group of groups.value) {
        for (const section of sections) {
            if (!group[section].length) {
                if (group[section].lastCc === cc && group[section].lastChannel === channel) return { group, control: group[section] }
                continue
            }
            for (const control of group[section]) {
                if (control.lastCc === cc && control.lastChannel === channel) return { group, control }
            }
        }
    }
}

function recv({ action, args }) {
    if (action === 'controlChange' || action === 'buttonDown' || action === 'buttonUp') {
        const [channel, cc, value] = args
        let matchingControls = controls.value.filter(c => c.lastCc === cc && c.lastChannel === channel)
        // No matching control in this group, find one in the others
        if (!matchingControls.length && !learnMode.value) {
            const otherGroup = findInOtherGroups({ cc, channel }, ['encoderBtns', 'encoders', 'faders', 'xFader', 'greenBtns'])
            if (!otherGroup) return notifications.value.notify({ text: 'No group found for control. Ensure your current configuration is loaded', severity: 'error' })
            notifications.value.notify({ text: `Auto-switching to group ${otherGroup.group.name}` })
            currentGroup.value = otherGroup.group
            matchingControls = [otherGroup.control]
        }
        for (const control of matchingControls) {
            if (activeRecording.value) {
                const { channel, cc } = decodeMIDI(activeRecording.value)
                control.cc = cc
                control.channel = channel
                activeRecording.value = null
                cancelMode()
            } else {
                control.value = value
            }
        }
    } else if (action === 'load') {
        groups.value = addTracking(args[0])
        currentGroup.value = groups.value[0]
        cancelMode()
        notifications.value.notify({ text: 'Configuration Received Successfully' })
    }
}

function changeGroup(e) {
    currentGroup.value = groups.value[e.target.value]
}

const activeInstructions = ref([])
const INSTRUCTIONS = {
    load: [
        {
            attachTo: '.shift.push-button',
            content: 'Hold <kbd>Shift</kbd>',
        },
        {
            attachTo: '.setup.push-button',
            content: 'Press <kbd>Setup</kbd> twice until the Setup LED is on',
        },
        {
            attachTo: '.encoder-wrapper:nth-child(4 of .encoder-wrapper)',
            content: 'Hold encoder <kbd>#4</kbd>.<br/><br/>[Display shows <kbd>Sndc</kbd>]<br/><br/>Keep holding until the lines disappear.',
        }
    ],
    send: [
        {
            attachTo: '.shift.push-button',
            content: 'Hold <kbd>Shift</kbd>',
        },
        {
            attachTo: '.setup.push-button',
            content: 'Press <kbd>Setup</kbd> twice until the Setup LED is on',
        },
        {
            attachTo: '.encoder-wrapper:nth-child(7 of .encoder-wrapper)',
            content: 'Hold encoder <kbd>#7</kbd>.<br/><br/>[Display shows <kbd>rec</kbd>]<br/><br/>Keep holding until <kbd>rc00</kbd> is visible.',
        }
    ],
}

const waitingForMode = ref(false)
function enterMode(mode) {
    waitingForMode.value = mode
    activeInstructions.value = INSTRUCTIONS[mode].map(line => {
        const { x, y, width } = document.querySelector(line.attachTo).getBoundingClientRect()
        const pos = [x + width, y + window.scrollY]
        line.anchor = 'left-anchor'
        if (pos[0] + 300 > window.innerWidth) {
            pos[0] = -(window.innerWidth - x)
            line.anchor = 'right-anchor'
        }
        line.style = `transform: translate(${pos[0]}px, ${pos[1]}px)`
        return line
    })
}
function cancelMode() {
    waitingForMode.value = false
    activeInstructions.value = []
}

const controllers = inject('$controllers')

function send() {
    uc4.load(groups.value)
    groups.value = addTracking(groups.value)
    currentGroup.value = groups.value[0]
    cancelMode()
    notifications.value.notify({ text: 'Configuration Sent! Press Setup to return to normal operation.' })
}

// Learn incoming messages for enabled devices
const activeRecording = ref()
controllers.addEventListener('action', ({ action, args: [id, name, data] }) => {
    // Ignore non-log messages
    if (action !== 'log') return
    // Ignore sysex messages
    if ((data[0] & 0xf0) === 0xf0) return
    // Ignore devices that are not being learned
    if (learnMode.value !== id) return
    // Record the current MIDI data
    activeRecording.value = data
    waitingForMode.value = 'armed'
})

// Track devices that are connected (UC4 is special case)
let uc4
const otherDevices = reactive([])
function onConnect({ device }) {
    if (device.name === 'Faderfox UC4') {
        notifications.value.notify({ text: 'Faderfox UC4 successfully connected' })
        uc4 = device
        uc4.addEventListener('action', recv)
    } else {
        otherDevices.push(device)
    }
}
onBeforeUnmount(() => {
    if (!uc4) return
    uc4.removeEventListener('action', recv)
})

controllers.addEventListener('connect', onConnect)
onBeforeUnmount(() => controllers.removeEventListener('connect', onConnect))
</script>

<style lang="sass">
main
    padding: 1rem
    display: flex
    flex-direction: column
    align-items: center
    @media(min-width: 700px)
        padding: 2rem

    > div > .actions
        padding: 2rem
        button
            width: 12em
            margin-bottom: 1em
        li
            position: relative
        ul
            display: flex
            list-style: none
            justify-content: space-around
        .warning
            position: absolute
            left: 50%
            top: -1em
            white-space: nowrap
            transform: translate(-50%, -50%)
            background: #c44
            font-size: .8em
            padding: .2em 1em
            border-radius: .5em

    aside.monitor
        position: absolute
        right: 0
        top: 0
        overflow-x: hidden
        font-size: .8em
        z-index: 30
        &.active
            h3:after
                transform: rotate(90deg)
        h3
            padding: .5rem 1rem
            cursor: pointer
            background: #88888844
            font-family: Audiowide
            text-transform: uppercase
            font-size: .8em
            display: flex
            gap: .5em
            align-items: center
            justify-content: flex-end
            &:after
                content: '▶'
                display: block
                transition: transform .5s
            &:hover
                background: #88888866

    aside.other-devices
        position: absolute
        left: 0
        top: 0
        font-size: .8em
        background: #88888844
        padding: 1em
        h3
            margin-bottom: 1em
            font-family: Audiowide
            text-transform: uppercase
            font-size: .8em
            gap: .5em
        li
            display: flex
            gap: 1em
            align-items: center
        ul
            list-style: none

    h1
        font-size: 1.2em
        margin-bottom: .5em
        text-align: center
        font-family: Audiowide
        text-transform: uppercase
        @media(min-width: 700px)
            font-size: 1.5em

    p
        text-align: center
        margin-bottom: 1em

    .advanced-toggle
        position: absolute
        top: .5rem
        right: .5rem
        background: transparent
        color: #444
        border: none
        font-size: 2em
        padding: 0
        width: 1em
        height: 1em
        border-radius: 0
        display: flex
        justify-content: center
        align-items: center
        &:hover
            color: white
            background: transparent

    .cross-fader
        display: flex
        justify-content: space-between
        align-items: center
        padding: .5rem 1rem
        margin-bottom: 1em
        @media(min-width: 500px)
            padding: .5rem 3rem
        .horizontal-fader
            height: 4rem
            width: 50%
        .push-button
            width: 2.5em

    .device
        background: #333
        padding: .5rem
        border-radius: .5rem
        position: relative
        &.waitingForMode
            .faders, .horizontal-fader, .green-buttons, .encoder-wrapper, .group
                transition: opacity .3s
                opacity: .1
                pointer-events: none
            &.load
                .encoder-wrapper:nth-child(4 of .encoder-wrapper)
                    opacity: 1
            &.send
                .encoder-wrapper:nth-child(7 of .encoder-wrapper)
                    opacity: 1

        input
            max-width: 3em
            &[type=number]
                &::-webkit-inner-spin-button, &::-webkit-outer-spin-button
                    -webkit-appearance: none
        .control
            &:hover, &.active, &:has(*:focus)
                input, select
                    transition: none
                    opacity: .5
                .handle input
                    opacity: 1
            &.editing
                outline: solid 1px #ccc6
            &.modified
                outline: dashed 2px red
            input, select
                opacity: 0
                text-align: center
                transition: all .5s
                border-color: transparent
                background: transparent
                font-size: .7em
                &:hover
                    border-color: #666
                    background-color: #222
                    opacity: 1
                    transition: none
            select
                padding: .2em 0
        .section
            border: solid 2px #ccc
            border-radius: .5rem
            margin-bottom: .2rem

    .edit-window
        position: absolute
        right: 2rem
        top: 4rem

    .encoders
        display: flex
        padding: 2rem .5rem
        flex-wrap: wrap
        width: 100%
        gap: 5rem 2rem
        justify-content: space-between
        position: relative
        .encoder-wrapper
            flex-basis: 17%
            flex-grow: 1
            position: relative
        .push-button
            position: absolute
            top: 50%
            width: 70%
            box-shadow: none
            background: #444 !important
            flex-direction: column
            left: 50%
            transform: translate(-50%, -50%)
            &.pressed
                background: radial-gradient(#ccc6, #ccc6 60%, #111) !important
            .channel-select
                position: static

    .faders
        display: flex
        padding: 3rem .5rem 2rem
        height: 22rem
        margin-bottom: 3rem
        gap: .5rem
        justify-content: space-between
        > *
            flex-grow: 1

    .green-buttons
        display: flex
        padding: .5rem
        gap: .5rem
        > *
            flex-grow: 1
        @media(min-width: 700px)
            gap: 1rem

    .group
        position: absolute
        left: 50%
        top: 50%
        transform: translate(-50%, -50%)
        font-size: 1.2em
        color: black
        display: flex
        border-radius: .5em
        background: #666
        overflow: hidden
        select, input
            padding: .3em .5em
            color: inherit
            background: inherit
            border: none
            font-size: inherit
            &:hover
                background-color: inherit
                color: inherit
        input
            max-width: 6em
        select
            padding-right: 0
            width: 6em

    .instructions
        list-style: none
        line-height: 1.3em
        kbd
            color: black
            padding: 0 .5em
            background: #ccc
            border-radius: .5em
            font-family: inherit
            font-weight: bold
        li
            position: absolute
            top: -1em
            left: 2em
            padding: .5em 1em
            max-width: 15em
            opacity: 0
            font-weight: 100
            border-radius: .4em
            background: #26413C
            border: solid 1px white
            animation: appear 1s
            animation-fill-mode: forwards
            box-shadow: .3em .3em .2em rgba(0, 0, 0, .3)
            @for $i from 1 through 5
                &:nth-child(#{$i})
                    animation-delay: .5s * ($i - 1)
                    &:after
                        content: '#{$i}'
                        position: absolute
                        font-size: 1.2em
                        border: solid 1px white
                        background: #26413C
                        font-weight: 500
                        top: -1em
                        left: -1em
                        width: 1.5em
                        height: 1.5em
                        border-radius: 1em
                        display: flex
                        justify-content: center
                        align-items: center
            &.right-anchor
                left: auto
                right: 1em
                top: -4em

        @keyframes appear
            from
                opacity: 0
            to
                opacity: 1

    .status
        position: absolute
        padding: 1em 3em
        background: linear-gradient(to bottom, #03120E, #262626, #262626, #03120E)
        background-size: 100% 50%
        border: solid 2px #888
        font-weight: 400
        animation: gleam 2s linear infinite
        border-radius: .5rem
        left: 50%
        top: 50%
        transform: translate(-50%, -50%)
        box-shadow: .2em .2em .5em rgba(0, 0, 0, .3)
        display: flex
        flex-direction: column
        justify-content: center
        align-items: center
        button
            display: block
        .actions
            display: flex
            list-style: none
            gap: 1rem
            justify-content: center

    .wrapper
        width: 100%
        max-width: 35rem

    @keyframes gleam
        0%
            background-position: 0 100%
        100%
            background-position: 0 -100%

    .appear-enter-active, .appear-leave-active
        transition: all .3s ease-in-out
    .appear-enter-from, .appear-leave-to
        opacity: 0
        transform: scale(0.8) translate(0, -1em)

    .slide-enter-active, .slide-leave-active
        transition: all .3s ease-in-out
    .slide-enter-from, .slide-leave-to
        transform: translate(30em, 0)
</style>
