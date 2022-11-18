import { promisify } from 'util'

const promiseSleep = promisify(setTimeout)

export default promiseSleep
