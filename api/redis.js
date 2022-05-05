const redis = require('redis')

const CHANNELS = {
  TEST: 'TEST',
  BLOCKCHAIN: 'BLOCKCHAIN',
  TRANSACTION_POOL: 'TRANSACTION_POOL'
}

class PubSub {
  constructor({blockchain, pool}) {
    this.blockchain = blockchain
    this.pool = pool

    this.publisher = redis.createClient()
    this.subscriber = redis.createClient()

    this.subscribeToChannels()

    this.subscriber.on('message', (c, m) => this.handleMessage(c, m))
  }

  handleMessage(channel, message) {
    const parsedMessage = JSON.parse(message)

    if (channel === CHANNELS.BLOCKCHAIN) {
      const chain = parsedMessage

      this.blockchain.replaceChain(
        chain,
        () => this.pool.clearBlockchainTransactions({chain})
      )
    }

    if (channel === CHANNELS.TRANSACTION_POOL) {
      const transaction = parsedMessage

      this.pool.setTransaction(transaction)
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
    this.publish({
      channel: CHANNELS.BLOCKCHAIN,
      message: JSON.stringify(this.blockchain.chain)
    })
  }

  broadcastTransaction(transaction) {
    this.publish({
      channel: CHANNELS.TRANSACTION_POOL,
      message: JSON.stringify(transaction)
    })
  }
}

module.exports = {PubSub}