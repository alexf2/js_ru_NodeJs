Error.stackTraceLimit = 1000
require('trace') //stack trace for Node
require('clarify') //removes nodecore part of stack trace

/*const chain = require('stack-chain') //allows starck trace filtration

chain.filter.attach(async (error, frames) {
  return frames.filter(async (callSite) {
    const name = callSite && callSite.getFileName()
    return name && !~name.indexOf("/co/")
  })
})*/
