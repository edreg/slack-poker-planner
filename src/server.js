const logger = require('./logger');
const Hapi = require('hapi');
const path = require('path');
const Vision = require('vision');
const Handlebars = require('handlebars');
const inert = require('inert');


async function create() {
    const server = new Hapi.Server({
        port: process.env.PORT,
        host: process.env.HOST,
        routes: {
            files: {
                relativeTo: path.join(__dirname, 'public')
            }
        }
    });

    await server.register(Vision);
    server.views({
        engines: {
            html: Handlebars
        },
        path: __dirname + '/views'
    });
    await server.register(inert);

    return server;
}


async function start(server) {
    initRoutes(server);
    await server.start();
    logger.info(`Server running at: ${server.info.uri}`);
}


function initRoutes(server) {
    server.route({
        method: 'GET',
        path: process.env.BASE_PATH,
        handler: require('./routes/index')
    });

    server.route({
        method: 'GET',
        path: path.join(process.env.BASE_PATH, 'privacy'),
        handler: require('./routes/privacy')
    });

    server.route({
        method: 'GET',
        path: path.join(process.env.BASE_PATH, 'oauth'),
        handler: require('./routes/oauth')
    });

    server.route({
        method: 'POST',
        path: path.join(process.env.BASE_PATH, 'slack/pp-command'),
        handler: require('./routes/pp-command')
    });

    server.route({
        method: 'POST',
        path: path.join(process.env.BASE_PATH, 'slack/action-endpoint'),
        handler: require('./routes/action-endpoint')
    });

    server.route({
        method: 'GET',
        path: path.join(process.env.BASE_PATH, '{param*}'),
        handler: {
            directory: {
                path: '.',
                redirectToSlash: true
            }
        }
    });

    server.route({
        method: 'GET',
        path: path.join(process.env.BASE_PATH, 'slack/direct-install'),
        handler: (request, reply) => {
            const url = `https://slack.com/oauth/v2/authorize?client_id=${process.env.SLACK_CLIENT_ID}&scope=${process.env.SLACK_SCOPE}`;
            return reply.redirect(url).code(302);
        }
    });
}


module.exports = { create, start };
