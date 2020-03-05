import { UPDATE_SNS } from '../config'
import { publishSnsChanges } from '../utils/awsData'

export const handler = async event => {
  try {
    await publishSnsChanges({
      TopicArn: UPDATE_SNS,
      Message: 'Needs update'
    })

    return {
      statusCode: 200,
      body: 'Success'
    }
  } catch (e) {
    return {
      statusCode: 400,
      body: 'Error'
    }
  }
}
