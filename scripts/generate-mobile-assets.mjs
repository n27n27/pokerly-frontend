import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const root = process.cwd()
const branding = path.join(root, 'assets', 'branding')
const iosAssets = path.join(root, 'src-capacitor', 'ios', 'App', 'App', 'Assets.xcassets')
const androidRes = path.join(root, 'src-capacitor', 'android', 'app', 'src', 'main', 'res')

const writePng = async (source, destination, width, height = width) => {
  await mkdir(path.dirname(destination), { recursive: true })
  await sharp(source).resize(width, height, { fit: 'cover' }).png().toFile(destination)
}

const iconSource = path.join(branding, 'app-icon.svg')
const splashSource = path.join(branding, 'splash.svg')

await writePng(
  iconSource,
  path.join(iosAssets, 'AppIcon.appiconset', 'AppIcon-512@2x.png'),
  1024,
)

for (const filename of [
  'splash-2732x2732.png',
  'splash-2732x2732-1.png',
  'splash-2732x2732-2.png',
]) {
  await writePng(splashSource, path.join(iosAssets, 'Splash.imageset', filename), 2732)
}

const iconSizes = {
  mdpi: 48,
  hdpi: 72,
  xhdpi: 96,
  xxhdpi: 144,
  xxxhdpi: 192,
}

for (const [density, size] of Object.entries(iconSizes)) {
  const directory = path.join(androidRes, `mipmap-${density}`)
  await writePng(iconSource, path.join(directory, 'ic_launcher.png'), size)
  await writePng(iconSource, path.join(directory, 'ic_launcher_round.png'), size)
  await writePng(iconSource, path.join(directory, 'ic_launcher_foreground.png'), size * 2.25)
}

const splashSizes = {
  'drawable/splash.png': [480, 320],
  'drawable-land-mdpi/splash.png': [480, 320],
  'drawable-land-hdpi/splash.png': [800, 480],
  'drawable-land-xhdpi/splash.png': [1280, 720],
  'drawable-land-xxhdpi/splash.png': [1600, 960],
  'drawable-land-xxxhdpi/splash.png': [1920, 1280],
  'drawable-port-mdpi/splash.png': [320, 480],
  'drawable-port-hdpi/splash.png': [480, 800],
  'drawable-port-xhdpi/splash.png': [720, 1280],
  'drawable-port-xxhdpi/splash.png': [960, 1600],
  'drawable-port-xxxhdpi/splash.png': [1280, 1920],
}

for (const [relativePath, [width, height]] of Object.entries(splashSizes)) {
  await writePng(splashSource, path.join(androidRes, relativePath), width, height)
}

console.log('Generated Pokerly mobile icons and splash assets.')
