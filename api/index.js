const express = require('express')
const request = require('request')
const bodyParser = require('body-parser')
const {Blockchain} = require('../core/Blockchain')
const {Pool} = require('../wallet/Pool')
const {PubSub} = require('./redis')

const app = express()
const blockchain = new Blockchain()
const pubsub = new PubSub({blockchain})
const ROOT_NODE_ADDRESS = 'http://localhost:3000'
const PORT = process.env.GENERATE_PEER_PORT === 'true'
  ? 3000 + Math.ceil(Math.random() * 1000)
  : 3000

setTimeout(() => pubsub.broadcastChain(), 4000)

app.use(bodyParser.json())

// Routes
app.get('/api/blocks', (req, res) => res.json(blockchain.chain))
app.post('/api/mine', (req, res) => {
  blockchain.addBlock({data: req.body.data})
  pubsub.broadcastChain()
  res.redirect('/api/blocks')
})

// Listen
app.listen(PORT, () => {
  console.log(`API is listening on localhost:${PORT}...`)

  // Sync peers to longest chain
  if (PORT !== 3000) {
    request({url: `${ROOT_NODE_ADDRESS}/api/blocks`}, (error, res, body) => {
      if (!error && res.statusCode === 200) {
        console.log('replace chain on a sync with ', JSON.parse(body))
        blockchain.replaceChain(JSON.parse(body))
      }
    })
  }
})