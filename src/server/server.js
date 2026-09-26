const express = require('express');
const path = require('path');
const app = express();
const clientRoot = path.join(__dirname, '../client');
const port = process.env.PORT || 3000;

async function start() {
	if (process.env.NODE_ENV === 'production') {
		app.use(express.static(path.join(__dirname, '../../dist')));
	} else {
		const { createServer } = await import('vite');
		const vite = await createServer({
			root: clientRoot,
			server: { middlewareMode: true },
			appType: 'spa',
		});
		app.use(vite.middlewares);
	}

	app.listen(port, () => {
		console.log(`Server listening on port ${port}`);
	});
}

start().catch((error) => {
	console.error(error);
	process.exitCode = 1;
});
