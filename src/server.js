import sirv from 'sirv'
import express from 'express'
import compression from 'compression'
import * as sapper from '@sapper/server'
import { createServer } from 'http'
import { ApolloServer } from 'apollo-server-express'

import { resolvers, typeDefs } from './_schema'
		
const { PORT, NODE_ENV } = process.env,
	dev = NODE_ENV === 'development'

const start = async () => {
	try {
		const apollo = new ApolloServer({
			typeDefs,
			resolvers,
			context: async req => {
				let token = false

				if (req.connection && req.connection.context && req.connection.context.token) {
					token = req.connection.context.token
				}

				return {
					token,
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
