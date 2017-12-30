import redis from 'redis-mock'
import nock from 'nock'
import bluebird from 'bluebird'
import App from './app'
import { TWITTER_CONFIG } from './config'

bluebird.promisifyAll(redis)

let redisClient

const setUpMocks = () => {
  nock(/twitter\.com/)
    .persist()
    .post(/.*/)
    .reply(200, () => ({ id_str: '1' }))

  bluebird.delay = jest.fn(() => true)
}


const resetMocks = () => {
  nock.cleanAll()
  jest.resetModules()
  jest.resetAllMocks()
}


beforeAll(() => {
  resetMocks()
  setUpMocks()
  redisClient = redis.createClient()
})

afterAll(() => {
  resetMocks()
})

describe('App class methods', () => {
  describe('Static methods', () => {
    describe('changeToText', () => {
      test('Parses house member change', () => {
        const change = {
          account_type: 'office',
          screen_name: 'FooAccount',
          type: 'member',
          state: 'CA',
          party: 'D',
          name: 'Person Name',
          chamber: 'house',
        }
        expect(App.changeToText('deactivated', change)).toEqual('Deactivated: Rep. Person Name (D-CA) office account "FooAccount"')
      })

      test('Parses senate member change', () => {
        const change = {
          account_type: 'office',
          screen_name: 'FooAccount',
          type: 'member',
          state: 'CA',
          party: 'D',
          name: 'Person Name',
          chamber: 'senate',
        }
        expect(App.changeToText('deactivated', change)).toEqual('Deactivated: Sen. Person Name (D-CA) office account "FooAccount"')
      })

      test('Parses committee change', () => {
        const change = {
          account_type: 'office',
          screen_name: 'FooAccount',
          type: 'committee',
          party: 'D',
          name: 'House Committee on Stuff',
          chamber: 'senate',
        }
        expect(App.changeToText('deactivated', change)).toEqual('Deactivated: House Cmte. on Stuff (D) office account "FooAccount"')
      })

      test('Parses bipartisan committee change', () => {
        const change = {
          account_type: 'office',
          screen_name: 'FooAccount',
          type: 'committee',
          name: 'House Committee on Stuff',
          chamber: 'senate',
        }
        expect(App.changeToText('deactivated', change)).toEqual('Deactivated: House Cmte. on Stuff office account "FooAccount"')
      })

      test('Parses reactivated and deactivated accounts', () => {
        const change = {
          account_type: 'office',
          screen_name: 'FooAccount',
          type: 'committee',
          name: 'House Committee on Stuff',
          chamber: 'senate',
        }
        expect(App.changeToText('deactivated', change)).toEqual('Deactivated: House Cmte. on Stuff office account "FooAccount"')
        expect(App.changeToText('reactivated', change)).toEqual('Reactivated: House Cmte. on Stuff office account "FooAccount"')
      })

      test('Parses renamed accounts', () => {
        const change = {
          account_type: 'office',
          screen_name: 'FooAccount',
          old_name: 'Foo',
          type: 'committee',
          name: 'House Committee on Stuff',
          chamber: 'senate',
        }
        expect(App.changeToText('renamed', change)).toEqual('Renamed: House Cmte. on Stuff office account\n"Foo"=>"FooAccount"')
      })
    })
  })

  describe('Instance methods', () => {
    let app
    beforeEach(async () => {
      app = new App(redisClient, TWITTER_CONFIG)
      await redisClient.flushdbAsync()
      await redisClient.hmsetAsync('app', { foo: JSON.stringify([1, 2, 4]) })
    })

    describe('checkForChanges', () => {
      test('Returns false when no changes', async () => {
        await expect(app.checkForChanges()).resolves.toBeFalsy()
      })
      test('Returns true if changes exist', async () => {
        await redisClient.hmsetAsync('app', { changes: JSON.stringify([1, 2, 4]) })
        await expect(app.checkForChanges()).resolves.toBeTruthy()
      })
    })

    describe('getAndParseData', () => {
      test('Retrieves and translates change data into tweetable strings', async () => {
        const renamed = [{
          account_type: 'office',
          screen_name: 'FooAccount',
          old_name: 'Foo',
          type: 'committee',
          name: 'House Committee on Stuff',
          chamber: 'senate',
        }]
        const reactivated = [{
          account_type: 'office',
          screen_name: 'FooAccount',
          type: 'committee',
          name: 'House Committee on Stuff',
          chamber: 'senate',
        }]
        const changes = JSON.stringify({ renamed, reactivated })
        await redisClient.hmsetAsync('app', { changes })
        const parsed = await app.getAndParseData()
        expect(parsed.every(x => typeof x === 'string')).toBeTruthy()
        expect(parsed).toContain('Renamed: House Cmte. on Stuff office account\n"Foo"=>"FooAccount"')
        expect(parsed).toContain('Reactivated: House Cmte. on Stuff office account "FooAccount"')
      })
    })

    describe('deleteChanges', () => {
      test('Deletes changes key-value from redis store', async () => {
        await redisClient.hmsetAsync('app', { changes: JSON.stringify([1, 2, 4]), foo: 'blh' })
        await app.deleteChanges()
        await expect(redisClient.hgetallAsync('app')).resolves.toEqual({ foo: 'blh' })
      })
    })

    describe('tweet', () => {
      test('Creates tweet', async () => {
        await expect(app.tweet('Foo')).resolves.toEqual('1')
      })
    })

    describe('run', () => {
      const spyFns = {}
      let changes
      beforeEach(() => {
        // eslint-disable-next-line
        for (const key of Object.keys(spyFns)) {
          spyFns[key].mockRestore()
        }
        spyFns.tweet = jest.spyOn(app, 'tweet')
        spyFns.deleteChanges = jest.spyOn(app, 'deleteChanges')
        spyFns.getAndParseData = jest.spyOn(app, 'getAndParseData')
        spyFns.checkForChanges = jest.spyOn(app, 'checkForChanges')

        changes = JSON.stringify({
          renamed: [{
            account_type: 'office',
            screen_name: 'FooAccount',
            old_name: 'Foo',
            type: 'committee',
            name: 'House Committee on Stuff',
            chamber: 'senate',
          }],
          reactivated: [{
            account_type: 'office',
            screen_name: 'FooAccount',
            type: 'committee',
            name: 'House Committee on Stuff',
            chamber: 'senate',
          }],
        })
      })

      test('Runs if there are changes', async () => {
        await redisClient.hmsetAsync('app', { changes })
        await app.run()
        expect(spyFns.checkForChanges).toHaveBeenCalled()
        expect(spyFns.getAndParseData).toHaveBeenCalled()
        expect(spyFns.tweet).toHaveBeenCalledTimes(2)
        expect(spyFns.deleteChanges).toHaveBeenCalled()
      })

      test('Runs if there are not changes', async () => {
        await redisClient.hmsetAsync('app', { foo: 'blah' })
        await app.run()
        expect(spyFns.checkForChanges).toHaveBeenCalled()
        expect(spyFns.getAndParseData).not.toHaveBeenCalled()
        expect(spyFns.tweet).not.toHaveBeenCalled()
        expect(spyFns.deleteChanges).not.toHaveBeenCalled()
      })
    })
  })
})
