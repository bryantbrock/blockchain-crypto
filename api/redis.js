const redis = require('redis')

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
}

class PubSub {
  constructor({blockchain}) {
    this.blockchain = blockchain
    this.publisher = redis.createClient()
    this.subscriber = redis.createClient()

    this.subscribeToChannels()

    this.subscriber.on('message', (c, m) => this.handleMessage(c, m))
  }

  handleMessage(channel, message) {
    const parsedMessage = JSON.parse(message)

    if (channel === CHANNELS.BLOCKCHAIN) {
      this.blockchain.replaceChain(parsedMessage)
    }
  }

  subscribeToChannels() {
    Object.values(CHANNELS).forEach(channel =>
      this.subscriber.subscribe(channel)
    )
  }

  publish({channel, message}) {
    // Unsubscribe, send message, subscribe again
    // to avoid sending messages to your own node
    this.subscriber.unsubscribe(channel, () =>
      this.publisher.publish(channel, message, () =>
        this.subscriber.subscribe(channel)
      )
    )
  }

  broadcastChain() {
    // Can only publish string messages
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    })
  }
}

module.exports = {PubSub}