 /* global describe, before, beforeEach, after, it, context - mocha facilities to structure test */

const should = require('should')

should(process.env.NODE_ENV).eql('test') //do not forget to set env properly: cross-env NODE_ENV=test mocha server.spec.js

const request = require('request-promise').defaults({
    encoding: null, //to return the buffer, not an utf-8 string
    simple: false, //not to fail on 2XX codes
    resolveWithFullResponse: true //to return headers
 })

const plainRequest = require('request').defaults({
    encoding: null, //to return the buffer, not an utf-8 string    
 })

const Promise = require('bluebird')
const fs = require('fs-extra-promise')
const config = require('config')
const path = require('path')
const url = require('url')
const {Readable} = require('stream')

const testedServer = require('../server')

const host = `http://${config.get('host')}:${config.get('port')}`
const filesDir = config.get('filesDir')
const fixturesRoot = __dirname + '/fixtures'

const smallFilePath = path.join(filesDir, 'small.png')
const bigFilePath = path.join(filesDir, 'big.png')
const smallFixture = path.join(fixturesRoot, 'small.png')
const bigFixture = path.join(fixturesRoot, 'big.png')

describe('Server', () => {
    before( done  => {        
        testedServer.listen(config.get('port'), config.get('host'), done)
    })

    after(done => {
        testedServer.close( res => {
            fs.emptyDirSync(filesDir)
            done(res)
        })
    })

    /*beforeEach( () => {
        fs.emptyDirSync(filesDir)
    })*/

    describe('Get a file', () => {
        // this will be invoked before each test in that block ("Get a file")
        before( () => {
            fs.copySync(smallFixture, smallFilePath)
        })
        after( () => {fs.emptyDirSync(filesDir)} )

        context('When exists', () => {


            it('returns the file', async () => {
                const file = fs.readFileAsync(smallFixture)
                const req = request.get(url.resolve(host, 'small.png'))

                let [buff, resp] = await Promise.all([file, req])
                resp.statusCode.should.be.equal(200)                
                resp.body.equals(buff).should.be.true()
            })
        })

        context('otherwise', () => {
            it('returns 404', async  () => {

                //console.log('...Testing')
                //fs.readdirSync(filesDir).forEach(file => {console.log(file) })

                const rsp = await request.get(url.resolve(host, 'small2.png'))
                rsp.statusCode.should.be.equal(404)                
            })
        })

        it('for nested path returns 400', async () => {
            const rsp = await request.get(url.resolve(host, '/folder/small.png'))
            rsp.statusCode.should.be.equal(400)            
        })
    })

    describe('Post a file', () => {
        context('When the same file already exists on the server', () => {
            before( () => {
                fs.copySync(smallFixture, smallFilePath)                
            })
            after( () => {fs.emptyDirSync(filesDir)} )

            it('returns 409 and file is intacted', async () => {                
                const mtime1 = fs.statSync(smallFilePath).mtime
                
                const req = request.post(url.resolve(host, 'small.png'))
                fs.createReadStream(smallFixture).pipe(req)
                const rsp = await req
                
                rsp.statusCode.should.be.equal(409)

                const mtime2 = fs.statSync(smallFilePath).mtime
                mtime2.should.eql(mtime1) //deep equality: needs here, for dates
            })                        
        })

        context('When the same file already exists on the server: step 2', () => {
            before( () => {
                fs.copySync(smallFixture, smallFilePath)                
            })
            after( () => {fs.emptyDirSync(filesDir)} )

            it('return 409 and file is intacted on zero posted size', async () => {
                const mtime1 = fs.statSync(smallFilePath).mtime
                const req = request.post(url.resolve(host, 'small.png'))
                const stream = new Readable();

                stream.pipe(req)
                stream.push(null)

                const rsp = await req
                
                rsp.statusCode.should.be.equal(409)

                fs.statSync(smallFilePath).size.should.not.equal(0)
                const mtime2 = fs.statSync(smallFilePath).mtime
                mtime2.should.eql(mtime1) //deep equality: needs here, for dates
            })
        })

        context('otherwise', () => {
            beforeEach( () => {
                try {fs.unlinkSync(smallFilePath)} catch(err) {}
                try {fs.unlinkSync(bigFilePath)} catch(err) {}
            })

            it('small file uploaded successfully', async () => {
                const req = request.post(url.resolve(host, 'small.png'))
                fs.createReadStream(smallFixture).pipe(req)
                const rsp = await req
                
                rsp.statusCode.should.be.equal(200)            

                const [buff1, buff2] = await Promise.all([fs.readFileAsync(smallFixture), fs.readFileAsync(smallFilePath)])
                buff1.equals(buff2).should.be.true()
            })

            it('big file fails with 413 code', (done) => {
                /*const req = plainRequest.post(url.resolve(host, 'big.png'), (err, rsp) => {
                    if (err) {
                        if (err.code === 'ECONNRESET' || err.code === 'EPIPE' || err.code === 'ECANCELED') {
                            fs.existsSync(bigFilePath).should.be.false()
                            done()
                        } else {
                            done(err)
                        }
                    }
                    else {
                        rsp.statusCode.should.be.equal(413)

                        setTimeout( () => {
                            fs.existsSync(bigFilePath).should.be.false()
                            done()
                        }, 50)
                    }
                })                

                fs.createReadStream(bigFixture).pipe(req)*/                
                plainRequest({
                    url: url.resolve(host, 'big.png'),
                    method: 'POST',
                    formData: {
                        'regularFile': fs.createReadStream(bigFixture)                        
                    }
                }, (err, rsp) => {
                    if (err) {
                        if (err.code === 'ECONNRESET' || err.code === 'EPIPE') {
                            fs.existsSync(bigFilePath).should.be.false()
                            done()
                        } else {
                            done(err)
                        }
                    }
                    else {
                        rsp.statusCode.should.be.equal(413)

                        setTimeout( () => {
                            fs.existsSync(bigFilePath).should.be.false()
                            done()
                        }, 50)
                    }})
                })

            it('zero size file should be accepted', async () => {
                const req = request.post(url.resolve(host, 'small.png'))
                const stream = new Readable();

                stream.pipe(req)
                stream.push(null)

                const rsp = await req
                
                rsp.statusCode.should.be.equal(200)

                fs.statSync(smallFilePath).size.should.equal(0)
            })

        })
    })
})
