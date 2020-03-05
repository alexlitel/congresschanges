const mockChanges = (oldProps = {}, newProps = {}, dataUpdates = []) => {
  const oldData = {
    '123': {
      idStr: '123',
      ...oldProps
    }
  }

  const newData = {
    '123': {
      idStr: '123',
      ...oldProps,
      ...newProps
    }
  }

  const accounts = {
    '123': {
      id: '123',
      name: 'Test'
    }
  }

  return [newData, oldData, accounts, dataUpdates]
}

global.mockChanges = mockChanges
