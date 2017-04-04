const fs = require('fs-extra-promise')
const path = require('path')

class WebAppBuilder {
    
    async buildUp (app, waresPath, log = false) {
        const wares = (await fs.readdirAsync(waresPath)).sort()
        for (const w of wares ) {
            log && console.log(`Loading ${w}...`)
            require(path.join(waresPath, w)).init(app)
            log && console.log(`Loaded ${w}`)
        }

        return app
    }
}

module.exports = new WebAppBuilder()
