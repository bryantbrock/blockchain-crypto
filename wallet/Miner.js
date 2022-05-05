class Miner {
  constructor({blockchain, pool, wallet, pubsub}) {
    this.blockchain = blockchain
    this.pool = pool
    this.wallet = wallet
    this.pubsub = pubsub
  }

  mineTransactions() {
    const validTransactions = [
      ...this.pool.getValidTransactions(),
      Transaction.createRewardTransaction({miner: this.wallet.publicKey}),
    ]

    this.blockchain.addBlock({data: validTransactions})
    this.pubsub.broadcastChain()
    this.pool.clear()
  }
}

module.exports = {Miner}