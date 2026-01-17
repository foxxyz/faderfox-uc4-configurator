import { ref, watch } from 'vue'

export function useActiveFlash(onWatcher) {
    let clearActive
    const active = ref(false)
    watch(onWatcher, () => {
        active.value = true
        clearTimeout(clearActive)
        clearActive = setTimeout(() => active.value = false, 500)
    })
    return {
        active
    }
}