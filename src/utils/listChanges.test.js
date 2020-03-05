import { getPropDiffs, checkForListChanges } from './listChanges'

describe('List change utilities', () => {
  describe('getPropDiffs', () => {
    test('Returns prop diffs', () => {
      const propDiffs = getPropDiffs(
        {
          banner: 'cool'
        },
        {
          banner: 'cool2'
        }
      )
      expect(propDiffs).toHaveLength(1)
    })
    test('Returns no prop diffs when nothing changes', () => {
      const propDiffs = getPropDiffs(
        {
          banner: 'cool'
        },
        {
          banner: 'cool'
        }
      )
      expect(propDiffs).toHaveLength(0)
    })
    test('Returns no prop diff when whitespace changed', () => {
      const propDiffs = getPropDiffs(
        {
          banner: 'cool\ncool',
          avatar: 'cool cool'
        },
        {
          banner: 'cool\n\ncool',
          avatar: 'cool  cool'
        }
      )
      expect(propDiffs).toHaveLength(0)
    })
    test('Returns prop diff when made private', () => {
      const propDiffs = getPropDiffs(
        {
          protected: true
        },
        {
          protected: false
        }
      )
      expect(propDiffs).toHaveLength(1)
      expect(propDiffs[0]).toEqual({
        changeType: 'protected',
        oldVal: false,
        newVal: true
      })
    })
    test('Returns no prop diff when made public', () => {
      const propDiffs = getPropDiffs(
        {
          protected: false
        },
        {
          protected: true
        }
      )
      expect(propDiffs).toHaveLength(0)
    })
  })
  describe('checkForListChanges', () => {
    beforeEach(() => jest.resetModules())
    test('Returns no changes when nothing is changed', async () => {
      const changes = await checkForListChanges(
        ...mockChanges({
          foo: true
        })
      )

      expect(Object.entries(changes)).toHaveLength(0)
    })
    test('Returns changes when newData has props changed', async () => {
      const changes = await checkForListChanges(
        ...mockChanges(
          {
            foo: '456'
          },
          {
            foo: '123'
          }
        )
      )

      expect(Object.entries(changes)).toHaveLength(1)
      expect(changes).toHaveProperty('123')
      expect(changes['123'].diffs[0]).toHaveProperty('changeType', 'foo')
    })
    test('Returns reactivated account', async () => {
      const mockedChanges = mockChanges({ foo: true })
      mockedChanges[1] = {}
      const changes = await checkForListChanges(...mockedChanges)

      expect(Object.entries(changes)).toHaveLength(1)
      expect(changes).toHaveProperty('123')
      expect(changes['123'].diffs[0]).toHaveProperty(
        'changeType',
        'reactivated'
      )
    })
    test('Does not return reactivated account when id in data updates', async () => {
      const mockedChanges = mockChanges({ foo: true }, {}, ['123'])
      mockedChanges[1] = {}
      const changes = await checkForListChanges(...mockedChanges)

      expect(Object.entries(changes)).toHaveLength(0)
    })
    test('Returns suspended account', async () => {
      jest.mock('./twitter', () => ({
        checkIfSuspended: () => true
      }))

      const mockedChanges = mockChanges({ foo: true }, {}, ['123'])
      mockedChanges[0] = {}
      const { checkForListChanges } = require('./listChanges')
      const changes = await checkForListChanges(...mockedChanges)

      expect(Object.entries(changes)).toHaveLength(1)
      expect(changes['123'].diffs[0]).toHaveProperty('changeType', 'suspended')
    })
    test('Returns deactivated account', async () => {
      jest.mock('./twitter', () => ({
        checkIfSuspended: () => false
      }))

      const mockedChanges = mockChanges({ foo: true }, {}, ['123'])
      mockedChanges[0] = {}
      const { checkForListChanges } = require('./listChanges')
      const changes = await checkForListChanges(...mockedChanges)

      expect(Object.entries(changes)).toHaveLength(1)
      expect(changes['123'].diffs[0]).toHaveProperty(
        'changeType',
        'deactivated'
      )
    })
  })
})
