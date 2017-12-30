import rp from 'request-promise'
import bluebird from 'bluebird'

class App {
  static changeToText(key, change) {
  	let text = [key.charAt(0).toUpperCase(), key.slice(1).toLowerCase(), ':'].join('')
  	if (change.type === 'member') {
  		text = [text, `${change.chamber === 'senate' ? 'Sen' : 'Rep'}.
  						${change.name}
  						(${change.party}-${change.state})`.replace(/\n\s+/g, ' '),
  				].join(' ')
  	} else if (change.type === 'committee') {
  		text = [text, change.name.replace('Committee', 'Cmte.')].join(' ')
  		if (change.party) text = [text, `(${change.party})`].join(' ')
  	}

  	text = `${text} ${change.account_type || ''} account`.replace(/\s{2}/, ' ')

  	if (key !== 'renamed') {
  		text = `${text} "${change.screen_name}"`
  	} else {
  		text = `${text}\n"${change.old_name}"=>"${change.screen_name}"`
  	}

  	return text
  }

  async checkForChanges() {
  	return !!(await this.redisClient.hexistsAsync('app', 'changes'))
  }

  async getAndParseData() {
  	let changes = JSON.parse(await this.redisClient.hmgetAsync('app', 'changes'))
  	changes = Object.keys(changes).reduce((p, key) => {
  		const changeArr = changes[key].map(item => this.constructor.changeToText(key, item))
  		p.push(...changeArr)
  		return p
  	}, [])
  	return changes
  }

  async deleteChanges() {
  	return this.redisClient.hdelAsync('app', 'changes')
  }

  async tweet(text) {
    try {
      return (await rp({
		      method: 'POST',
		      uri: 'https://api.twitter.com/1.1/statuses/update.json',
		      oauth: this.config,
		      qs: {
		        status: text,
		      },
		      json: true,
		    })).id_str
    } catch (e) {
      return Promise.reject(e)
    }
  }

  async run() {
  	try {
  	if (await this.checkForChanges()) {
	  	const collection = await this.getAndParseData()
	  	// eslint-disable-next-line no-restricted-syntax
	  	for (const text of collection) {
	  		await bluebird.delay(5000)
	  		await this.tweet(text)
	  	}
	  	await this.deleteChanges()
   	}
   	return true
    } catch (e) {
   		return Promise.reject(e)
   	}
  }

  constructor(redisClient, config) {
    this.redisClient = redisClient
    this.config = config
  }
}

export default App
