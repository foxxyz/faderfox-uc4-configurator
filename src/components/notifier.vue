<template>
    <TransitionGroup name="list" tag="ul" class="notifications">
        <li
            v-for="notification of notifications"
            :key="notification"
            :class="notification.severity"
        >
            {{ notification.text }}
        </li>
    </TransitionGroup>
</template>

<script setup>
import { reactive } from 'vue'

const notifications = reactive([])
function notify({ text, severity = 'info' }) {
    if (!notifications.find(n => n.text === text)) notifications.push({ text, severity })
    setTimeout(endNotification, 4000)
}

function endNotification() {
    notifications.shift()
}

defineExpose({ notify })
</script>

<style lang="sass">
.notifications
    list-style: none
    .list-enter-active, .list-leave-active
        transition: all 0.5s ease
    .list-enter-from, .list-leave-to
        opacity: 0
        transform: translate(-50%, -10em)
    li
        position: absolute
        z-index: 100
        left: 50%
        top: 10em
        transform: translate(-50%, 0)
        padding: .5rem 1rem
        border-radius: .5rem
        &.error
            background: #c33
        &.info
            background: #0a6
</style>