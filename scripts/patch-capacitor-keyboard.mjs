import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const keyboardSource = fileURLToPath(
  new URL(
    '../src-capacitor/node_modules/@capacitor/keyboard/ios/Sources/KeyboardPlugin/Keyboard.m',
    import.meta.url,
  ),
)
const delayedResize = '[self setKeyboardHeight:(int)height delay:duration];'
const immediateResize = '[self setKeyboardHeight:(int)height delay:0];'

const source = await readFile(keyboardSource, 'utf8')

if (source.includes(immediateResize)) {
  process.stdout.write('Capacitor iOS keyboard resize patch already applied.\n')
} else if (source.includes(delayedResize)) {
  await writeFile(keyboardSource, source.replace(delayedResize, immediateResize))
  process.stdout.write('Applied immediate Capacitor iOS keyboard resize patch.\n')
} else {
  throw new Error(
    'The Capacitor Keyboard iOS resize implementation changed; review the keyboard patch before building.',
  )
}
