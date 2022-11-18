import { createTweet } from '../utils/twitter'
import {
  loadDuplicateIdCheckData,
  writeDuplicateIdCheckData
} from '../utils/awsData'
import promiseSleep from '../utils/promiseSleep'

export const handler = async event => {
  try {
    const eventIds = await loadDuplicateIdCheckData()
    const { Message, MessageId } = event.Records[0].Sns

    if (eventIds.includes(MessageId)) {
      console.log('Duplicate event')
      return false
    }

    const changes = JSON.parse(Message)
    console.log('Changes received', JSON.stringify(changes))
    for await (const { user, diffs } of changes) {
      for await (const diff of diffs) {
        await createTweet(diff, user)
        await promiseSleep(1000)
      }
    }

    eventIds.push(MessageId)
    await writeDuplicateIdCheckData(eventIds)
    return true
  } catch (e) {
    console.log('Tweet changes error', e)
    return e
  }
}
