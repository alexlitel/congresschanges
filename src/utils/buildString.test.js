import { buildString, normalizeName, buildAltTextString } from './buildString'

describe('String utilities', () => {
  describe('normalizeName', () => {
    test('Normalizes commitee name', () => {
      const change = {
        chamber: 'house',
        type: 'committee',
        name: 'Test Committee on Stuff',
        party: 'D'
      }
      expect(normalizeName(change)).toEqual('Test Cmte. on Stuff (D)')
    })
    test('Normalizes caucus name', () => {
      const change = {
        chamber: 'house',
        type: 'caucus',
        name: 'Caucus on Stuff',
        party: 'D'
      }
      expect(normalizeName(change)).toEqual('Caucus on Stuff (D)')
    })
    test('Normalizes house rep name', () => {
      const change = {
        chamber: 'house',
        type: 'member',
        name: 'Test Person',
        party: 'I',
        state: 'CA'
      }
      expect(normalizeName(change)).toEqual('Rep. Test Person (I-CA)')
    })
    test('Normalizes house delegate name', () => {
      const change = {
        chamber: 'house',
        type: 'member',
        name: 'Test Person',
        party: 'I',
        state: 'VI'
      }
      expect(normalizeName(change)).toEqual('Del. Test Person (I-VI)')
    })
    test('Normalizes senator name', () => {
      const change = {
        chamber: 'senate',
        type: 'member',
        name: 'Test Person',
        party: 'I',
        state: 'CA'
      }
      expect(normalizeName(change)).toEqual('Sen. Test Person (I-CA)')
    })
  })
  describe('buildString', () => {
    test('Parses newly private account', () => {
      const change = {
        chamber: 'house',
        type: 'caucus',
        screen_name: 'Test',
        name: 'Test Caucus on Stuff',
        account_type: 'office',
        party: 'D',
        oldVal: 0,
        newVal: true
      }
      const changeString = buildString(
        {
          changeType: 'protected',
          newVal: true
        },
        change
      )
      expect(changeString).toContain(
        'Test Caucus on Stuff (D) made their office account "Test"'
      )
      expect(changeString).toContain('historical value')
    })
    test('Parses renamed account', () => {
      const change = {
        changeType: 'screenName',
        chamber: 'house',
        type: 'caucus',
        screenName: 'Test',
        name: 'Caucus',
        account_type: 'office',
        party: 'D',
        oldVal: 'Test',
        newVal: 'TestNew'
      }
      const changeString = buildString(
        {
          changeType: 'screenName',
          oldVal: 'Test',
          newVal: 'TestNew'
        },
        change
      )
      expect(changeString).toEqual(
        'Username: Caucus (D) office account\n\n"Test" => "TestNew"'
      )
    })
    test('Parses reactivated account', () => {
      const change = {
        chamber: 'house',
        type: 'caucus',
        screen_name: 'Test',
        name: 'Caucus',
        account_type: 'office',
        party: 'D'
      }
      const changeString = buildString({ changeType: 'reactivated' }, change)
      expect(changeString).toBe('Reactivated: Caucus (D) office account "Test"')
    })
    test('Parses banner change', () => {
      const change = {
        changeType: 'banner',
        chamber: 'house',
        type: 'caucus',
        screen_name: 'Test',
        name: 'Caucus',
        account_type: 'office',
        party: 'D'
      }
      const changeString = buildString(
        {
          changeType: 'banner',
          oldVal: 'Test',
          newVal: 'TestNew'
        },
        change
      )
      expect(changeString).toBe(
        'Header: Caucus (D) office account "Test"\n\nTest => TestNew'
      )
    })
  })
  describe('buildAltTextString', () => {
    test('Handles description ', () => {
      const change = {
        changeType: 'description',
        oldVal: 'blah',
        newVal: 'blah2',
        chamber: 'house',
        type: 'caucus',
        screen_name: 'Test',
        name: 'Caucus',
        account_type: 'office',
        party: 'D'
      }

      expect(buildAltTextString(change, change)).toContain('old description')
    })
    test('Handles banner ', () => {
      const change = {
        changeType: 'banner',
        oldVal: 'blah',
        newVal: 'blah2',
        chamber: 'house',
        type: 'caucus',
        screen_name: 'Test',
        name: 'Caucus',
        account_type: 'office',
        party: 'D'
      }

      expect(buildAltTextString(change, change)).toContain('header image')
    })
    test('Handles avatar ', () => {
      const change = {
        changeType: 'avatar',
        oldVal: 'blah',
        newVal: 'blah2',
        chamber: 'house',
        type: 'caucus',
        screen_name: 'Test',
        name: 'Caucus',
        account_type: 'office',
        party: 'D'
      }
      expect(buildAltTextString(change, change)).toContain('profile image')
    })
  })
})
