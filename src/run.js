import { TWITTER_CONFIG } from './config'
import redisClient from './redis'
import App from './app'

const runProcess = async () => {
  try {
  	const app = new App(redisClient, TWITTER_CONFIG)
    await app.run()
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log('error with process', e)
  }
  if (redisClient.connected) await redisClient.quit()
  return true
}

runProcess()
