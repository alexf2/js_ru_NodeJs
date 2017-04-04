const Router = require('koa-router')
const mongoose = require('./libs/db-context')
const UserCollection = require('./libs/user')
const pick = require('lodash/pick')

const router = new Router({prefix: '/users'})

const fetchById = async (id, context) => {
    if (!mongoose.Types.ObjectId.isValid(id))
        context.throw(`Invalid is: ${id}`, 404)
    else {
        const res = await UserCollection.findById(id)
        if (!res)
            context.throw(`Used ${id} not found`, 404)
        else
            return res
    }    
}

module.exports = router
    .get('/', async (context, next) => {                
        const users = await UserCollection.find({})
        context.body = users.map(u => u.toObject())
    })
    .del('/:id', async (context) => {        
        const user = await fetchById(context.params.id)
        if (user) {
            user.remove()
            context.body = 'ok'
        }
    })
    .get('/:id', async context => {
        const user = await fetchById(context.params.id)
        if (user) 
            context.body = user.toObject()
    })
    .patch('/:id', async context => {
        const user = await fetchById(context.params.id)
        if (user) {
            Object.assign(user, pick(context.request.body, UserCollection.publicFields))
            await user.save()

            context.body = user.toObject()
        }
    })
    .post('/', async context => {
        const user = await UserCollection.create(pick(ctx.request.body, User.publicFields))

        // userSchema.options.toObject.transform hides __v
        context.body = user.toObject()
    })

    .routes()

