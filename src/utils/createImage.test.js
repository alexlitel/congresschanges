import { wrapDescriptionWord, wrapDescriptionString } from './createImage'

describe('Image creation utilities', () => {
  describe('wrapDescriptionWord', () => {
    let mockMeasure
    beforeAll(() => {
      mockMeasure = jest.fn(str => str.length <= 5)
    })
    beforeEach(() => {
      mockMeasure.mockClear()
    })
    test('Returns single string if word under canvas length', () => {
      expect(wrapDescriptionWord('123', mockMeasure)).toHaveLength(1)
      expect(mockMeasure).toHaveReturnedWith(true)
    })
    test('Returns multiple strings if word larger than canvas', () => {
      expect(wrapDescriptionWord('123456', mockMeasure)).toHaveLength(2)
      expect(mockMeasure).toHaveReturnedWith(false)
    })
  })
  describe('wrapDescriptionString', () => {
    let mockMeasure
    beforeAll(() => {
      mockMeasure = jest.fn(str => str.length <= 5)
    })
    beforeEach(() => {
      mockMeasure.mockClear()
    })
    test('Returns single-line string if string shorter than canvas width', () => {
      expect(wrapDescriptionString('1234', mockMeasure)).toBe('1234')
      expect(mockMeasure).toHaveBeenCalledTimes(1)
    })
    test('Returns multiline string if string longer than canvas width', () => {
      expect(wrapDescriptionString('12345 12345', mockMeasure)).toBe(
        '12345\n12345'
      )
      expect(mockMeasure).toHaveBeenCalledTimes(3)
    })
    test('Returns multiline string if word longer than canvas width', () => {
      expect(wrapDescriptionString('1234567', mockMeasure)).toBe('12345\n67')
    })
  })
})
