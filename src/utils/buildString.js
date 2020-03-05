export const normalizeName = record => {
  let title = ''
  const suffix = [record.party, record.state]
    .filter(x => x)
    .join('-')
    .trim()

  if (record.type === 'member') {
    title = record.chamber === 'senate' ? 'Sen.' : 'Rep.'
    if (/^(AS|DC|GU|MP|PR|VI)/.test(record.state)) {
      title = 'Del.'
    }
  }
  return [
    `${title} `,
    record.name.replace('Committee', 'Cmte.'),
    suffix ? ` (${suffix})` : suffix
  ]
    .join('')
    .trim()
}

export const buildString = ({ changeType, newVal, oldVal }, user) => {
  const prefixes = {
    deactivated: 'Deactivated',
    suspended: 'Suspended',
    reactivated: 'Reactivated',
    screenName: 'Username',
    banner: 'Header',
    avatar: 'Profile picture',
    location: 'Location',
    description: 'Description',
    displayName: 'Display name',
    url: 'URL'
  }

  const name = normalizeName(user)
  if (changeType === 'protected' && newVal) {
    return [
      `${name} made their ${user.account_type || ''}`,
      `account "${user.screen_name}" private,`,
      'denying constituents and others easy access',
      'to communications of current and historical value'
    ]
      .join(' ')
      .replace(/\s{2,}/g, '')
  }

  const str = `${prefixes[changeType]}: ${name} ${user.account_type} account ${
    changeType === 'screenName' ? '' : `"${user.screen_name}"`
  }`.trim()

  if (changeType === 'description') {
    let usableLength = 280 - str.length
    const isNewValShortEnough = usableLength >= newVal.length + 6
    usableLength = usableLength - newVal.length - 6
    if (!isNewValShortEnough) {
      return `${str}\n\n"${newVal.slice(0, usableLength)}"`.trim()
    }
    usableLength = usableLength - 8
    if (usableLength > 4) {
      const slicedOldString = `${oldVal.slice(0, usableLength - 1)}${
        oldVal.length > usableLength - 1 ? '…' : ''
      }`
      return `${str}\n\n"${slicedOldString}" => "${newVal}"`
    }
    return `${str}\n\n"${newVal}"`
  } else if (/(avatar|banner)/gi.test(changeType)) {
    return `${str}\n\n${oldVal.replace('normal', 'bigger')} => ${newVal.replace(
      'normal',
      '400x400'
    )}`
  } else if (!/(tivated|spended)/gi.test(changeType)) {
    return `${str}\n\n"${oldVal}" => "${newVal}"`
  }

  return str
}

export const buildAltTextString = ({ changeType, oldVal, newVal }, user) => {
  const name = normalizeName(user)
  const templates = {
    description: `${name} old description ${oldVal} new description ${newVal}`,
    banner: `${name} old and new header image`,
    avatar: `${name} old and new profile image`
  }
  return templates[changeType].slice(0, 400)
}
