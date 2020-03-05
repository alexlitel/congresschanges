import { checkIfSuspended } from './twitter'

export const normalizePropValue = val =>
  String(val)
    .toLowerCase()
    .replace(/\n+/g, ' ')
    .replace(/\s+/g, ' ')

export const getPropDiffs = (newRecord, oldRecord) => {
  return Object.keys(newRecord).reduce((diffs, key) => {
    const newVal = newRecord[key]
    const oldVal = oldRecord[key]
    if (normalizePropValue(newVal) !== normalizePropValue(oldVal)) {
      if (key === 'protected' && !newVal) return diffs
      diffs.push({
        changeType: key,
        oldVal,
        newVal
      })
    }
    return diffs
  }, [])
}

export const checkForListChanges = async (
  listData = {},
  bucketList = {},
  accounts = {},
  dataUpdates = []
) => {
  try {
    const changes = await Object.values(listData).reduce((acc, acct) => {
      const { idStr, ...propsToIterate } = acct
      if (bucketList[idStr]) {
        const propDiffs = getPropDiffs(propsToIterate, bucketList[idStr])
        if (propDiffs.length) {
          acc[idStr] = {
            user: {
              ...accounts[idStr],
              ...listData[idStr]
            },
            diffs: propDiffs
          }
        }
      } else {
        const isReactivated = accounts[idStr] && !dataUpdates.includes(idStr)
        if (isReactivated) {
          acc[idStr] = {
            user: {
              ...accounts[idStr],
              ...listData[idStr]
            },
            diffs: [
              {
                changeType: 'reactivated'
              }
            ]
          }
        }
      }

      return acc
    }, {})

    const deactivated = Object.keys(bucketList).filter(
      key => !listData[key] && accounts[key]
    )

    if (deactivated.length) {
      for await (const id of deactivated) {
        const isSuspended = await checkIfSuspended(id)
        const changeType = isSuspended ? 'suspended' : 'deactivated'
        changes[id] = {
          user: {
            ...accounts[id],
            ...bucketList[id]
          },
          diffs: [{ changeType }]
        }
      }
    }

    return changes
  } catch (e) {
    return Promise.reject(e)
  }
}
