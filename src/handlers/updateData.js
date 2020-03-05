import { loadUserData } from '../utils/userData'
import { loadBucketData, writeBucketData } from '../utils/awsData'

export const handler = async () => {
  const bucketData = await loadBucketData()
  const userData = await loadUserData()
  const newData = {
    ...bucketData,
    ...userData
  }
  if (bucketData.accounts) {
    const oldAccts = Object.keys(bucketData.accounts)
    const newAccts = Object.keys(userData.accounts)
    const removed = Object.keys(oldAccts).filter(key => !newAccts.includes(key))
    const added = Object.keys(newAccts).filter(key => !oldAccts.includes(key))
    newData.dataUpdates = [...removed, ...added]
  }

  await writeBucketData(newData)

  return true
}
