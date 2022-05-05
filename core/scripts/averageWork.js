const {Blockchain} = require("../Blockchain")

const blockchain = new Blockchain()
const times = []

let prevTimestamp
let nextTimestamp
let nextBlock
let timeDiff
let average

blockchain.addBlock({data: 'initial block'})

for (let i=0; i<10000; i++) {
  prevTimestamp = blockchain.chain[blockchain.chain.length-1].timestamp

  blockchain.addBlock({data: `block ${i}`})

  nextBlock = blockchain.chain[blockchain.chain.length-1]
  nextTimestamp = nextBlock.timestamp
  timeDiff = nextTimestamp - prevTimestamp

  times.push(timeDiff)

  average = times.reduce((total, num) => total + num) / times.length

  console.log(`
    Time to mine block: ${timeDiff}ms.
    Difficulty: ${nextBlock.difficulty}.
    Average time: ${average}
  `)
}