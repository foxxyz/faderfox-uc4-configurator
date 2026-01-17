<template>
    <select
        class="channel-select"
        v-model="model"
        title="Channel"
    >
        <option v-for="i of 16" :value="i" :key="i">
            CH{{ i }}
        </option>
    </select>
</template>

<script setup>
const model = defineModel({ type: Number })
</script>

<style lang="sass">
.channel-select
    width: 5em
</style>