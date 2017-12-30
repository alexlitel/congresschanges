/* eslint-disable */
import dotEnv from 'dotenv'

dotEnv.config()

export const TWITTER_CONFIG = {
  consumer_key: process.env.CONSUMER_API_KEY || 'test',
  consumer_secret: process.env.CONSUMER_API_SECRET || 'test',
  token: process.env.ACCESS_TOKEN || 'test',
  token_secret: process.env.ACCESS_TOKEN_SECRET || 'test',
}

export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

export const APP_CONFIG = {
  TWITTER_CONFIG,
  REDIS_URL
}


/* eslint-enable */
