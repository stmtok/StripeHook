/**
 * Module dependencies.
 */
import app from './app'
import debug from 'debug'
import http from 'http'

const debugServer = debug('server')
/**
 * Get port from environment and store in Express.
 */
const _port = normalizePort(process.env.PORT || '3000');
app.set('port', _port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(_port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val: string) {
    const port = parseInt(val, 10);
    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error: any) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    const bind = typeof _port === 'string'
        ? 'Pipe ' + _port
        : 'Port ' + _port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            debugServer(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            debugServer(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
    const addr = server.address() || { port: null };
    const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    debugServer('Listening on ' + bind);
}
