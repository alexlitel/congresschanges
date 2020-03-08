import emoji from 'node-emoji'
import request from 'request-promise-native'
import { createCanvas, Image, registerFont } from 'canvas'
import { FONT_PATH } from '../config'

registerFont(`${FONT_PATH}/SourceSansPro-Regular.ttf`, {
  family: 'sans-serif'
})

export const wrapDescriptionWord = (word, measureFn) =>
  [...word].reduce(
    (chars, char) => {
      const combinedChars = chars[chars.length - 1] + char
      if (measureFn(combinedChars)) {
        chars[chars.length - 1] += char
      } else {
        chars.push(char)
      }
      return chars
    },
    ['']
  )

export const wrapDescriptionString = (description, measureFn) => {
  return emoji
    .unemojify(description)
    .replace(/(\n+|\s+)/g, ' ')
    .split(' ')
    .reduce(
      (wrappedString, currString) => {
        const lastString = wrappedString[wrappedString.length - 1]
        const combinedString = `${lastString} ${currString}`.trim()
        if (measureFn(combinedString)) {
          wrappedString[wrappedString.length - 1] = combinedString
        } else {
          wrappedString[wrappedString.length - 1] = lastString.trim()
          if (measureFn(currString)) {
            wrappedString.push(currString)
          } else {
            const longStringWithBreaks = wrapDescriptionWord(
              currString,
              measureFn
            )
            wrappedString.push(...longStringWithBreaks)
          }
        }
        return wrappedString
      },
      ['']
    )
    .join('\n')
    .trim()
}

export const getImage = async (changeType, imageUrl, isNew) => {
  try {
    if (!imageUrl) return null
    const optimizedUrl =
      changeType === 'avatar'
        ? imageUrl.replace('_normal.', '_400x400.')
        : isNew
        ? `${imageUrl}/600x200`
        : imageUrl
    return await request(optimizedUrl, {
      encoding: null
    })
  } catch (e) {
    console.log(`Unable to load ${changeType} ${imageUrl}`)
    return null
  }
}

export const getResolution = changeType => {
  if (changeType === 'avatar') return [1000, 500]
  if (changeType === 'banner') return [700, 600]
  return [1000, 600]
}

export const drawImagesOnCanvas = (ctx, changeType, images) => {
  const isAvatar = changeType === 'avatar'
  if (images[0]) {
    const oldImage = new Image()
    oldImage.src = images[0]
    const imageCoords = isAvatar ? [50, 50, 400, 400] : [50, 50, 600, 200]
    ctx.drawImage(oldImage, ...imageCoords)
  } else {
    const textPosition = isAvatar ? [50, 250] : [200, 150]
    ctx.fillText(
      `old ${isAvatar ? 'profile picture' : 'header'} unavailable`,
      ...textPosition
    )
  }
  const newImage = new Image()
  newImage.src = images[1]
  if (isAvatar) {
    ctx.fillText('→', 484, 250)
    ctx.drawImage(newImage, 550, 50, 400, 400)
  } else {
    ctx.fillText('↓', 334, 310)
    ctx.drawImage(newImage, 50, 350, 600, 200)
  }
}

export const createImage = async change => {
  try {
    const { oldVal, newVal, changeType } = change
    const resolution = getResolution(changeType)
    const canvas = createCanvas(...resolution)
    const ctx = canvas.getContext('2d', { alpha: false })
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, ...resolution)
    ctx.fillStyle = 'black'
    ctx.font = '32px sans-serif'
    const images =
      changeType === 'description'
        ? []
        : [
            await getImage(changeType, oldVal),
            await getImage(changeType, newVal, true)
          ]

    if (changeType === 'description') {
      const printableWidth = canvas.width - 100
      const description = [oldVal || '', newVal]
        .map(val =>
          wrapDescriptionString(
            val,
            str => ctx.measureText(str).width <= printableWidth
          )
        )
        .join(`\n\n${' '.repeat(72)}↓\n\n`)
      const newHeight =
        100 + Math.ceil(ctx.measureText(description).actualBoundingBoxDescent)
      ctx.canvas.height = newHeight
      ctx.fillStyle = 'white'
      ctx.fillRect(0, 0, resolution[0], newHeight)
      ctx.fillStyle = 'black'
      ctx.font = '32px sans-serif'
      ctx.fillText(description, 50, 50)
    } else {
      drawImagesOnCanvas(ctx, changeType, images)
    }

    return canvas.toBuffer()
  } catch (e) {
    console.log(e)
    return null
  }
}
