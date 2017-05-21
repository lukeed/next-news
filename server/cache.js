const LRU = require('lru-cache')
const { DB, getChild } = require('./data')

const PER = 30 // inital # per type
const maxAge = 1000 * 60 * 60 // 1 hour
const TYPES = ['top', 'new', 'ask', 'show', 'job']

// Prepare caches
const stores = {
	list: new LRU({ maxAge }),
	user: new LRU({ maxAge, max: 100 }),
	item: new LRU({ maxAge, max: PER * TYPES.length })
}

// hoist as helpers
const getItem = id => getKey('item', id)
const setItem = id => addCache(`/item/${id}`, 'item')

TYPES.forEach(type => {
	const ref = DB.child(`${type}stories`)
	// Grab first X items per list; only @ startup!
	ref.once('value', snap => snap.val().slice(0, PER).forEach(setItem))
	// Set up list watchers; continuously updates
	ref.on('value', snap => stores.list.set(type, snap.val()))
})

/**
 * Store a (fresh) value into a Cache store
 * @param {String} path  The `firebase` ref path
 * @param {String} key   The type of Cache store to use
 */
async function addCache(path, key) {
	const data = await getChild(path)
	data && stores[key].set(path, data)
	return data
}

/**
 * Retrieve a Cached value, or request anew.
 * @param  {String} type  The type of Cache item
 * @param  {String} key   The item's unique identifier
 */
async function getKey(type, key) {
	const id = `/${type}/${key}`
	return stores[type].get(id) || await addCache(id, type)
}

/**
 * Get a paged-subset of list stories
 * @param  {String} list  The type of story; see `TYPES`
 * @param  {String} page  The paged set to collect; cast to Number
 */
function getPage(list, page) {
	const end = (+page || 1) * PER
	const all = stores.list.get(list) || []
	const data = all.slice(end - PER, end)
	return Promise.all(data.map(getItem)).then(items => ({ items, total:all.length }))
}

module.exports = { getKey, getPage }
