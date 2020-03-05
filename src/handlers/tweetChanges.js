import { createTweet } from '../utils/twitter'

export const handler = async event => {
  try {
    const changes = JSON.parse(event.Records[0].Sns.Message)
    const iterableChanges = Object.values(changes)
    for await (const { user, diffs } of iterableChanges) {
      for await (const diff of diffs) {
        await createTweet(diff, user)
      }
    }
    return true
  } catch (e) {
    console.log('Tweet changes error', e)
    return e
  }
}
