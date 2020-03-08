import dotEnv from 'dotenv'

dotEnv.config()

export const IS_PROD = process.env.NODE_ENV === 'production'
export const FONT_PATH = IS_PROD ? './fonts' : './src/static/fonts'
export const LIST_ID = process.env.LIST_ID || 'test'
export const BUCKET = process.env.BUCKET || 'test'
export const CHANGE_SNS = process.env.CHANGE_SNS || 'test'
export const UPDATE_SNS = process.env.UPDATE_SNS || 'test'
export const DATASET_URL =
  'https://raw.githubusercontent.com/alexlitel/congresstweets-automator/master/data/users-filtered.json'

export const TWITTER_APP_CONFIG = {
  consumer_key: process.env.CONSUMER_API_KEY || 'test',
  consumer_secret: process.env.CONSUMER_API_SECRET || 'test'
}

export const LIST_TWITTER_CONFIG = {
  ...TWITTER_APP_CONFIG,
  token: process.env.LIST_ACCESS_TOKEN || 'test',
  token_secret: process.env.LIST_ACCESS_TOKEN_SECRET || 'test'
}

export const BOT_TWITTER_CONFIG = {
  ...TWITTER_APP_CONFIG,
  token: process.env.BOT_ACCESS_TOKEN || 'test',
  token_secret: process.env.BOT_ACCESS_TOKEN_SECRET || 'test'
}
