const should = require('should')

should(process.env.NODE_ENV).eql('test') //do not forget to set env properly: cross-env NODE_ENV=test mocha server.spec.js
const fs = require('fs-extra-promise')
const stream = require('stream')
const path = require('path')

const streamReader = require('../index')  

const fixturesRoot = __dirname + '/fixtures'
const testDir = __dirname + '/out'
const smallFixture = path.join(fixturesRoot, 'small.png')
const bigFixture = path.join(fixturesRoot, 'big.png')
const smallFilePath = path.join(testDir, 'small.png')
const bigFilePath = path.join(testDir, 'big.png')

const delay = timeSpanMs => {
    return new Promise( resolve => {        
        setTimeout( () => {resolve()}, timeSpanMs)
    })
}

function randomIntInc (low, high) {
    return Math.floor(Math.random() * (high - low + 1) + low);
}

describe('streamReader', () => {
    beforeEach( () => {
        try {fs.emptyDirSync(testDir)} catch(err) {}        
    })

    it('Copying a small file', async () => {
        const streamIn = fs.createReadStream(smallFixture, {highWatermark: 128, encoding: null, autoClose: true})
        const streamOut = fs.createWriteStream(smallFilePath, {flags: 'wx', encoding: null})

        let buffer;
        try {
            const rd = streamReader(streamIn)
            while (buffer = await rd()) {                
                await streamOut.write(buffer)
            }
        }
        catch (err) {
            streamOut.destroy()
            streamIn.destroy()
            throw err
        }
        
        streamOut.end()
        streamOut.destroy()

        fs.statSync(smallFixture).size.should.be.equal(fs.statSync(smallFilePath).size)
        fs.readFileSync(smallFixture).should.eql(fs.readFileSync(smallFilePath))
    })

    it('Copying a big file', async () => {
        const streamIn = fs.createReadStream(bigFixture, {encoding: null, autoClose: true})
        const streamOut = fs.createWriteStream(bigFilePath, {flags: 'wx', encoding: null})

        let buffer;
        try {
            const rd = streamReader(streamIn)
            while (buffer = await rd()) {                
                await streamOut.write(buffer)
            }
        }
        catch (err) {
            streamOut.destroy()
            streamIn.destroy()
            throw err
        }
        
        streamOut.end()
        streamOut.destroy()

        fs.statSync(bigFixture).size.should.be.equal(fs.statSync(bigFilePath).size)
        fs.readFileSync(bigFixture).should.eql(fs.readFileSync(bigFilePath))
    }).timeout(20000)

    it('Copying a small file with delay', async () => {
        const streamIn = fs.createReadStream(smallFixture, {highWaterMark: 256, encoding: null, autoClose: true})
        const streamOut = fs.createWriteStream(smallFilePath, {flags: 'wx', encoding: null})

        let buffer;
        try {
            const rd = streamReader(streamIn)
            let countChunks = 0
            while (buffer = await rd()) {    
                await delay(randomIntInc(50, 700))
                await streamOut.write(buffer)
                console.log(++countChunks)
                console.log(buffer)
            }
        }
        catch (err) {
            streamOut.destroy()
            streamIn.destroy()
            throw err
        }
        
        streamOut.end()
        streamOut.destroy()

        fs.statSync(smallFixture).size.should.be.equal(fs.statSync(smallFilePath).size)
        fs.readFileSync(smallFixture).should.eql(fs.readFileSync(smallFilePath))
    }).timeout(20000)
})