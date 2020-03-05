import request from 'request-promise-native'
import { LIST_TWITTER_CONFIG, BOT_TWITTER_CONFIG, LIST_ID } from '../config'
import { normalizeListData } from './userData'
import { buildString, buildAltTextString } from './buildString'
import { createImage } from './createImage'

const twitterApiInstance = request.defaults({
  baseUrl: 'https://api.twitter.com/1.1/',
  json: true
})

export const listApiRequest = twitterApiInstance.defaults({
  oauth: LIST_TWITTER_CONFIG
})

const botApiRequest = twitterApiInstance.defaults({
  oauth: BOT_TWITTER_CONFIG
})

const botMediaApiRequest = botApiRequest.defaults({
  baseUrl: 'https://upload.twitter.com/1.1/'
})

export const uploadImage = async image => {
  try {
    const encodedImage = (Buffer.isBuffer(image)
      ? image
      : Buffer.from(image)
    ).toString('base64')
    return (
      await botMediaApiRequest.post('media/upload.json', {
        form: {
          media_data: encodedImage
        }
      })
    ).media_id_string
  } catch (e) {
    console.log(e)
    return null
  }
}

export const uploadImageAltText = async (mediaId, altText) =>
  botMediaApiRequest.post('media/metadata/create.json', {
    body: {
      media_id: mediaId,
      alt_text: {
        text: altText
      }
    }
  })

export const createImageUpload = async (image, altText) => {
  try {
    const mediaId = await uploadImage(image)
    await uploadImageAltText(mediaId, altText)
    return mediaId
  } catch (e) {
    return null
  }
}

export const sendTweet = async params =>
  botApiRequest.post('statuses/update.json', {
    qs: params
  })

export const getListMemberData = async () => {
  try {
    const listData = await listApiRequest('lists/members.json', {
      qs: {
        count: 5000,
        list_id: LIST_ID
      }
    })

    return normalizeListData(listData.users)
  } catch (e) {
    return Promise.reject(e)
  }
}

export const checkIfSuspended = async id => {
  try {
    const result = await listApiRequest('users/show.json', {
      qs: {
        user_id: id
      },
      simple: false
    })
    return JSON.stringify(result)
      .toLowerCase()
      .includes('suspended')
  } catch (e) {
    console.log(e)
    return false
  }
}

export const createTweet = async (diff, user) => {
  try {
    const tweetParams = {}
    tweetParams.status = buildString(diff, user)
    if (/(avatar|banner|description)/gi.test(diff.changeType)) {
      const altText = buildAltTextString(diff, user)
      const image = await createImage(diff, user)
      if (image) {
        tweetParams.media_ids = await createImageUpload(image, altText)
      }
    }
    await sendTweet(tweetParams)
    return true
  } catch (e) {
    console.log(
      `Unable to create tweet for ${JSON.stringify(
        diff,
        null,
        2
      )} ${JSON.stringify(user, null, 2)}`
    )
    console.log(e)
    return false
  }
}
