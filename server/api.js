const { Router } = require('express')
const { getChild } = require('./data')
const Cache = require('./cache')

// Overly simple response handler
const send = (res, data) => data ? res.json({ data }) : res.status(404).json({ error: 'Not found!' })

function getComments(ids) {
	const keys = ids.split(',').map(id => `/item/${id}`)
	return Promise.all(keys.map(getChild))
}

module.exports = Router()
	.get('/comment/:ids', async (req, res) => send(res, await getComments(req.params.ids))) // no cache
	.get('/item/:id', async (req, res) => send(res, await Cache.getKey('item', req.params.id)))
	.get('/user/:name', async (req, res) => send(res, await Cache.getKey('user', req.params.name)))
	.get('/:type', async (req, res) => send(res, await Cache.getPage(req.params.type, req.query.page)))
