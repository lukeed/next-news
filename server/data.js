const firebase = require('firebase')

firebase.initializeApp({
	databaseURL: 'https://hacker-news.firebaseio.com'
})

const DB = firebase.database().ref('v0')

const getChild = key => DB.child(key).once('value').then(s => s.val())

module.exports = { DB, getChild }
