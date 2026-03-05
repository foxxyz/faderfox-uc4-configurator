import { onMounted, ref } from 'vue'

export default function draggable(elRef, { button = 0, onDragStart, onDrag, onDragEnd }) {
    const dragging = ref(false)

    const dragStart = point => {
        // Only start drags with primary pointer button
        if (point.button !== button) return
        dragging.value = [point.clientX, point.clientY]
        if (onDragStart) onDragStart(dragging.value)
        // Allow for dragging anywhere, not just inside element
        // We're using mouse events instead of pointer events, because pointerdown
        // only gets fired ONCE when multiple buttons are pressed. boo.
        window.addEventListener('mousemove', drag)
        window.addEventListener('mouseup', dragEnd)
    }
    const drag = point => {
        if (!dragging.value) return
        const delta = [
            point.clientX - dragging.value[0],
            point.clientY - dragging.value[1],
        ]
        const absPos = [point.clientX, point.clientY]
        if (onDrag) onDrag(delta, absPos)
        dragging.value = absPos
    }
    const dragEnd = e => {
        // Drags can only be ended by lifting the primary pointer button
        if (e.button !== button) return
        if (onDragEnd) onDragEnd(dragging.value)
        dragging.value = null
        window.removeEventListener('mousemove', drag)
        window.removeEventListener('mouseup', dragEnd)
    }
    onMounted(() => {
        if (elRef) elRef.value.addEventListener('mousedown', dragStart)
    })

    return {
        dragging,
        dragStart,
    }
}
