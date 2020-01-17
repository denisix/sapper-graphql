import { start } from '@sapper/app';
import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { WebSocketLink } from 'apollo-link-ws';

if (window) {
	console.log('- okay, lets connect ')
	
	const link = new WebSocketLink({
		uri: 'ws://localhost:3000/graphql',
		options: {
			lazy: true,
			reconnect: true,
			timeout: 30000,
			connectionParams: () => ({
				token: localStorage.getItem('auth')
			})
		}
	});

	window.client = new ApolloClient({
		link,
		cache: new InMemoryCache()
	})
}

start({
	target: document.querySelector('#sapper')
})