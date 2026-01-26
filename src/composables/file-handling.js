export function useFilePicker({ accept, onPick }) {
    function pickFile() {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = accept
        const changeHandler = () => {
            const file = input.files[0]
            const reader = new FileReader()
            reader.addEventListener('load', () => onPick(reader.result))
            reader.readAsText(file)
        }
        input.addEventListener('change', changeHandler, { once: true })
        input.click()
    }
    return { pickFile }
}

export function offerDownload(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || 'download'
    const clickHandler = () => {
        setTimeout(() => {
            URL.revokeObjectURL(url)
            removeEventListener('click', clickHandler)
        })
    }
    a.addEventListener('click', clickHandler, false)
    a.click()
}