const next = require('next')
const express = require('express')

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
	express()
		.disable('x-powered-by')
		.use('/api', require('./api'))
		.get('*', (req, res) => handle(req, res))
		.listen(3000, err => {
			if (err) throw err
	    console.log('> Ready on http://localhost:3000')
		})
})
