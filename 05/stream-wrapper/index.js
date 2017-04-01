
 module.exports = function readStream(stm) {
     const clear = handlers => {
        for (const p of handlers)
            stm.removeListener(p[0],  p[1])
    }
    const hook = handlers => {
        for (const p of handlers)
            stm.once(p[0],  p[1])
    }            

    let globalEnd = false
    const gEndHandler = () => {globalEnd = true}
    stm.on('end', gEndHandler)

    //ensuring paused stream
    stm.removeAllListeners('data')
    stm.unpipe()
    stm.pause()

    let externalError
    stm.on('error', err => {externalError = err})

    return function() {        
        return new Promise( (resolve, reject) => {            
            if (externalError)
                reject(externalError)

            const instantData = stm.read()            
            if (instantData) {                
                resolve(instantData)
                return
            }
            if (globalEnd) {
                stm.removeListener('end',  gEndHandler)
                resolve()                
                return
            }
            
            const handlers = new Map([
                //next duffer of data is available
                ['readable', () => {
                    //console.log('Reader: Input readable')                    
                    clear(handlers)                    
                    resolve(stm.read())                    
                }],

                //if the stream is network and the client closes the connection
                ['close', () => {
                    //console.log('Reader: Input close')
                    clear(handlers)
                    stm.removeListener('end',  gEndHandler)
                    resolve()
                }],

                //if underlying file ends
                ['end', () => {
                    //console.log('Reader: Input end')
                    clear(handlers)                    
                    stm.removeListener('end',  gEndHandler)
                    resolve()
                }],

                ['error', () => {
                    //console.log('Reader: Input error: ')
                    console.log(err)
                    clear(handlers)
                    reject(err)    
                }]
            ])            

            hook(handlers)
        })
    }
 }
 