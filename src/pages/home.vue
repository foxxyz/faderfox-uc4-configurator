<template>
    <main>
        <div>
            <h1>Faderfox UC4 Configurator</h1>
            <notifier ref="notifications" />
            <div :class="['device', waitingForMode, { waitingForMode }]">
                <div class="section encoders">
                    <encoder-knob
                        v-for="(encoder, idx) of currentGroup.encoders"
                        :key="idx"
                        v-bind="encoder"
                        :pressed="currentGroup.encoderBtns[idx].pressed"
                        v-model:cc-button="currentGroup.encoderBtns[idx].cc"
                        v-model:min="encoder.min"
                        v-model:max="encoder.max"
                        v-model:channel="encoder.channel"
                    />
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
                </div>
                <div class="section">
                    <div class="faders">
                        <vertical-fader
                            v-for="(fader, idx) of currentGroup.faders"
                            :key="idx"
                            v-bind="fader"
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
                            color="#0a6"
                            v-bind="button"
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
                    </li>
                </ul>
            </div>
        </div>
        <ol class="instructions" v-if="activeInstructions.length">
            <li
                v-for="(line, idx) of activeInstructions"
                :key="idx"
                v-html="line.content"
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
    </main>
</template>

<script setup>
import { computed, inject, onBeforeUnmount, ref } from 'vue'

import encoderKnob from '@/components/encoder-knob.vue'
import pushButton from '@/components/push-button.vue'
import horizontalFader from '@/components/horizontal-fader.vue'
import midiMonitor from '@/components/midi-monitor.vue'
import notifier from '@/components/notifier.vue'
import verticalFader from '@/components/vertical-fader.vue'

import DEFAULT_CONFIG from '@/data/empty-config.json'

const groups = ref(DEFAULT_CONFIG)
const currentGroup = ref(groups.value[0])
const controls = computed(() => [...currentGroup.value.encoders, ...currentGroup.value.faders, currentGroup.value.xFader])

const notifications = ref()

const showMIDIMonitor = ref(false)
function toggleMIDIMonitor() {
    showMIDIMonitor.value = !showMIDIMonitor.value
}

function findInOtherGroups(cc, sections = []) {
    for (const group of groups.value) {
        for (const section of sections) {
            if (!group[section].length) {
                if (group[section].cc === cc) return { group, control: group[section] }
                continue
            }
            for (const control of group[section]) {
                if (control.cc === cc) return { group, control }
            }
        }
    }
}

function recv({ action, args }) {
    if (action === 'controlChange') {
        const [cc, value] = args
        let matchingControls = controls.value.filter(b => b.cc === cc)
        // No matching control in this group, find one in the others
        if (!matchingControls.length) {
            const otherGroup = findInOtherGroups(cc, ['encoders', 'faders', 'xFader'])
            if (!otherGroup) return notifications.value.notify({ text: 'No group found for control. Ensure your current configuration is loaded', severity: 'error' })
            notifications.value.notify({ text: `Auto-switching to group ${otherGroup.group.name}` })
            currentGroup.value = otherGroup.group
            matchingControls = [otherGroup.control]
        }
        for (const control of matchingControls) {
            control.value = value
        }
    } else if (action === 'buttonDown') {
        const cc = args[0]
        let control = currentGroup.value.encoderBtns.find(b => b.cc === cc) || currentGroup.value.greenBtns.find(b => b.cc === cc)
        if (!control) {
            const otherGroup = findInOtherGroups(cc, ['encoderBtns', 'greenBtns'])
            if (!otherGroup) return notifications.value.notify({ text: 'No group found for control. Ensure your current configuration is loaded', severity: 'error' })
            notifications.value.notify({ text: `Auto-switching to group ${otherGroup.group.name}` })
            currentGroup.value = otherGroup.group
            control = otherGroup.control
        }
        control.pressed = true
    } else if (action === 'buttonUp') {
        const id = args[0]
        const button = currentGroup.value.encoderBtns.find(b => b.cc === id) || currentGroup.value.greenBtns.find(b => b.cc === id)
        button.pressed = false
    } else if (action === 'load') {
        groups.value = args[0]
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
            attachTo: '.encoder-knob:nth-child(4)',
            content: 'Hold encoder <kbd>#4</kbd>.<br/><br/>(Display shows <kbd>Sndc</kbd>)<br/><br/>Keep holding until the lines disappear.',
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
            attachTo: '.encoder-knob:nth-child(7)',
            content: 'Hold encoder <kbd>#7</kbd>.<br/><br/>(Display shows <kbd>rec</kbd>)<br/><br/>Keep holding until <kbd>rc00</kbd> is visible.',
        }
    ],
}

const waitingForMode = ref(false)
function enterMode(mode) {
    waitingForMode.value = mode
    activeInstructions.value = INSTRUCTIONS[mode].map(line => {
        const { x, y, width } = document.querySelector(line.attachTo).getBoundingClientRect()
        line.style = `transform: translate(${x + width}px, ${y}px)`
        return line
    })
}
function cancelMode() {
    waitingForMode.value = false
    activeInstructions.value = []
}

const controllers = inject('$controllers')

function send() {
    const device = controllers.attachedDevices[0]
    device.load(groups.value)
    cancelMode()
    notifications.notify({ text: 'Configuration Sent! Press SHIFT to return to normal operation.' })
}

controllers.addEventListener('action', recv)
onBeforeUnmount(() => controllers.removeEventListener('action', recv))
</script>

<style lang="sass">
main
    padding: 2rem
    display: flex
    flex-direction: column
    align-items: center

    > div > .actions
        padding: 2rem
        button
            width: 12em
        ul
            display: flex
            list-style: none
            justify-content: space-around

    aside.monitor
        position: absolute
        right: 0
        top: 0
        overflow-x: hidden
        font-size: .8em
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

    h1
        font-size: 1.5em
        margin-bottom: .5em
        text-align: center
        font-family: Audiowide
        text-transform: uppercase

    p
        text-align: center
        margin-bottom: 1em

    .cross-fader
        display: flex
        justify-content: space-between
        align-items: center
        padding: .5rem 3rem
        margin-bottom: 1em
        .horizontal-fader
            height: 4rem
            width: 50%
        .push-button
            width: 2.5em

    .device
        background: #333
        width: 35rem
        padding: .5rem
        border-radius: .5rem
        position: relative
        &.waitingForMode
            .faders, .horizontal-fader, .green-buttons, .encoder-knob, .group
                transition: opacity .3s
                opacity: .1
                pointer-events: none
            &.load
                .encoder-knob:nth-child(4)
                    opacity: 1
            &.send
                .encoder-knob:nth-child(7)
                    opacity: 1

        input
            width: 3.5em
            &[type=number]
                &::-webkit-inner-spin-button, &::-webkit-outer-spin-button
                    -webkit-appearance: none
        input, select
            transition: all .5s
            background: transparent
            border: inset 1px #666
            border-color: transparent
            border-radius: .5em
            padding: .2em .5em
            color: white
            display: block
            font-size: .7em
            &:hover
                border-color: #666
                background-color: #222
                opacity: 1
                transition: none
        .section
            border: solid 2px #ccc
            border-radius: .5rem
            margin-bottom: .2rem

    .encoders
        display: flex
        padding: 2rem .5rem
        flex-wrap: wrap
        width: 100%
        gap: 5rem 2rem
        justify-content: space-between
        position: relative
        .encoder-knob
            flex-basis: 18%

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
        gap: 1rem
        > *
            flex-grow: 1

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
            width: 4em
            color: inherit
            background: inherit
            border: none
            font-size: inherit
            &:focus
                outline: none
            &:hover
                background-color: inherit
                color: inherit
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
            position: fixed
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

    @keyframes gleam
        0%
            background-position: 0 100%
        100%
            background-position: 0 -100%

    .slide-enter-active, .slide-leave-active
        transition: all .3s ease-in-out
    .slide-enter-from, .slide-leave-to
        transform: translate(30em, 0)
</style>
