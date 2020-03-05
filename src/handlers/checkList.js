import { getListMemberData } from '../utils/twitter'
import {
  loadBucketData,
  writeBucketData,
  publishSnsChanges
} from '../utils/awsData'
import { CHANGE_SNS } from '../config'
import { checkForListChanges } from '../utils/listChanges'
import { loadUserData } from '../utils/userData'

export const handler = async () => {
  try {
    const listData = await getListMemberData()

    const bucketData = await loadBucketData()
    const { dataUpdates = [], list: bucketList, accounts = {} } = bucketData
    if (!Object.keys(bucketData).length || !bucketList) {
      const newData = {
        ...bucketData,
        list: listData
      }

      if (!newData.accounts) {
        const loadedData = await loadUserData()
        Object.assign(newData, loadedData)
      }
      await writeBucketData(newData)
      return false
    }

    const changes = await checkForListChanges(
      listData,
      bucketList,
      accounts,
      dataUpdates
    )

    if (Object.keys(changes).length) {
      const newData = {
        ...bucketData,
        list: listData
      }

      if (newData.dataUpdates) delete newData.dataUpdates

      await writeBucketData(newData)
      await publishSnsChanges({
        TopicArn: CHANGE_SNS,
        Message: JSON.stringify(changes)
      })
    }

    return true
  } catch (e) {
    console.log('Check list error', e)
    return e
  }
}
