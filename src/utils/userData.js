import request from 'request-promise-native'
import { DATASET_URL } from '../config'

export const normalizeListData = listUsers =>
  listUsers.reduce((acc, acct) => {
    const {
      id_str: idStr,
      description,
      url,
      entities,
      location,
      name: displayName,
      screen_name: screenName,
      protected: protectedAcct,
      profile_image_url_https: avatar,
      profile_banner_url: banner
    } = acct

    const newUrl = url
      ? entities.url.urls.find(x => x.url === url).expanded_url
      : ''
    const newDescription = description
      .replace(
        /http(s)?:\/{2}t.co\/.+?\b/g,
        shortUrl =>
          entities.description.urls.find(x => x.url === shortUrl).expanded_url
      )
      .replace(/\n+/g, ' ')
      .replace(/\s{2,}/g, ' ')

    return {
      ...acc,
      [idStr]: {
        idStr,
        description: newDescription,
        url: newUrl,
        location,
        displayName,
        screenName,
        protected: protectedAcct,
        avatar,
        banner
      }
    }
  }, {})

export const extractAccounts = dataset =>
  dataset.reduce((acc, record) => {
    const pickedObject = ['type', 'name', 'party', 'state', 'chamber'].reduce(
      (newObj, key) => ({
        ...newObj,
        [key]: record[key]
      }),
      {}
    )
    const coercedAccounts = record.accounts.reduce(
      (accts, acct) => ({
        ...accts,
        [acct.id]: {
          ...pickedObject,
          ...acct
        }
      }),
      {}
    )
    return {
      ...acc,
      ...coercedAccounts
    }
  }, {})

export const loadUserData = async () => {
  const userData = await request(DATASET_URL, {
    json: true
  })
  const newData = {}
  newData.accounts = extractAccounts(userData)
  return newData
}
