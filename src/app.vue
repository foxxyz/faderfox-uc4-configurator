<template>
    <router-view />
    <footer>
        <ul>
            <li>
                🦊♥️
            </li>
            <li>
                <a href="https://github.com/foxxyz/faderfox-uc4-configurator">Github</a>
            </li>
            <li class="version">
                v{{ version }}
            </li>
        </ul>
    </footer>
</template>

<script setup>
// Displays version set in package.json
const version = __APP_VERSION__
</script>

<style lang="sass">
// Reset default styles
*
    margin: 0
    padding: 0
    box-sizing: border-box

// Set default color/background/font-size on root
body
    background: linear-gradient(to bottom, #000, #000 80%, #333)
    color: white
    font-size: 16px
    font-weight: 200
    font-family: Roboto, sans-serif
    position: relative

button
    background: linear-gradient(to bottom, #222, #444)
    border: solid 2px #444
    padding: .5rem 1rem
    color: inherit
    border-radius: .5em
    cursor: pointer
    &[disabled]
        opacity: .5
        color: #888
    &:not([disabled]):hover
        background: linear-gradient(to bottom, #444, #888)

footer
    font-size: .8em
    a
        color: inherit
        text-decoration: none
    li
        &:not(:first-child)
            border-left: solid 1px gray
            padding-left: .5rem
    ul
        display: flex
        gap: .5rem
        justify-content: center
        align-items: center
        list-style: none

// Use up at least available space
html, body
    min-height: 100vh

// Reset input styles
input, select
    font-size: inherit
    font-family: inherit

select
    cursor: pointer

</style>
