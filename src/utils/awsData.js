import AWS from 'aws-sdk'
import { BUCKET } from '../config'

export const loadBucketData = async () => {
  try {
    const s3 = new AWS.S3()
    const bucketData = (
      await s3
        .getObject({
          Bucket: BUCKET,
          Key: 'state.json'
        })
        .promise()
    ).Body.toString('utf-8')

    return JSON.parse(bucketData)
  } catch (e) {
    return {}
  }
}

export const writeBucketData = async data => {
  const s3 = new AWS.S3()
  await s3
    .putObject({
      Bucket: BUCKET,
      Key: 'state.json',
      Body: JSON.stringify(data),
      ContentType: 'application/json'
    })
    .promise()
  return true
}

export const publishSnsChanges = async data => {
  const sns = new AWS.SNS()
  await sns.publish(data).promise()
  return true
}
