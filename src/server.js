import sirv from 'sirv'
import express from 'express'
import compression from 'compression'
import * as sapper from '@sapper/server'
import { createServer } from 'http'
import { MongoClient } from 'mongodb'
import { ApolloServer } from 'apollo-server-express'

//import { resolvers, typeDefs, APP_SECRET, jwt } from './__my_schema'
import { resolvers, typeDefs } from './_schema_test'
import jwt from 'jsonwebtoken'
const APP_SECRET = '11'
		
const { PORT, NODE_ENV } = process.env,
	dev = NODE_ENV === 'development',
	mongoURI = process.env.mongoURI || 'mongodb://localhost:27017',
	mongoDB = process.env.mongoDB || 'tasker'

const start = async () => {
	try {
		const mongo = await MongoClient.connect(`${mongoURI}/${mongoDB}`, { useNewUrlParser: true, useUnifiedTopology: true })
		const db = mongo.db(mongoDB)
		const user = db.collection('user')
		const project = db.collection('project')
		const sprint = db.collection('sprint')
		const task = db.collection('task')

		const apollo = new ApolloServer({
			typeDefs,
			resolvers,
			context: async req => {
				let token = false, uid = false;
				if (req.connection && req.connection.context && req.connection.context.token) {
					token = req.connection.context.token
					const { id } = jwt.verify(token, APP_SECRET)
					if (id) uid = id
				}

				return {
					db: mongo,
					token,
					uid,
					user,
					project,
					sprint,
					task,
				}
			},
			introspection: !!dev,
			playground: !!dev,
		})

		const app = express()
		const path = '/graphql'

		apollo.applyMiddleware({ app, path })

		app.use(
			compression({ threshold: 0 }),
			sirv('static', { dev }),
			sapper.middleware()
		)		
		
		const server = createServer(app)

		apollo.installSubscriptionHandlers(server)

		server.listen({ port: PORT }, (err) => {
			if (err) console.log('error', err);

			console.log(`🚀 Server ready at http://0.0.0.0:${PORT}${apollo.graphqlPath}`);
		});
	} catch (e) {
		console.error('Error:', e.toString())
	}
}

start()