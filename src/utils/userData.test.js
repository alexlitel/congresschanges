import { normalizeListData } from './userData'

describe('User data utilities', () => {
  describe('normalizeListData', () => {
    test('Normalizes list data', () => {
      const listData = [
        {
          id_str: 'abc',
          description: 'Foo https://t.co/1',
          url: '',
          entities: {
            url: {},
            description: {
              urls: [
                {
                  url: 'https://t.co/1',
                  expanded_url: 'cool.com'
                }
              ]
            }
          },
          location: '',
          name: 'name',
          screen_name: '123',
          protected: false,
          profile_image_url_https: 'normal.jpg',
          profile_banner_url: 'test'
        }
      ]
      const normalized = normalizeListData(listData)
      expect(normalized).toHaveProperty('abc')
      expect(normalized.abc).toStrictEqual(
        expect.objectContaining({
          idStr: 'abc',
          description: 'Foo cool.com',
          displayName: 'name',
          screenName: '123',
          avatar: 'normal.jpg',
          banner: 'test'
        })
      )
    })
  })
})
