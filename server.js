import fs from 'fs'
import express from 'express'
import Router from 'express-promise-router'
import { createServer } from 'vite'
import viteConfig from './vite.config.js'
import { Server } from 'socket.io'

// Create router
const router = Router()

// Create vite front end dev server
const vite = await createServer({
    configFile: false,
    server: {
        middlewareMode: 'html',
    },
    ...viteConfig,
})

// Main route serves the index HTML
router.get('/', async (req, res, next) => {
    let html = fs.readFileSync('index.html', 'utf-8')
    html = await vite.transformIndexHtml(req.url, html)
    res.send(html)
})

// Use vite middleware so it rebuilds frontend
router.use(vite.middlewares)

// Everything else that's not index 404s
router.use('*', (req, res) => {
    res.status(404).send({ message: 'Not Found' })
})

// Create express app and listen on port 4444
const app = express()
app.use(router)

const port = process.env.PORT || 4000;

const server = app.listen(port, () => {
    console.log(`Listening on port http://localhost:${port}...`)
})

const ioServer = new Server(server)

let clients = {}
const messages = [];

ioServer.on('connection', (client) => {
    console.log(
        `User ${client.id} connected, there are currently ${ioServer.engine.clientsCount} users connected`
    )

    clients[client.id] = {
        name: "",
        position: [0, 1.5, 0],
        rotation: [0, 0, 0],
        action: "idle"
    }

    client.emit('move', clients)
    
    client.on('move', ({ id, name, rotation, position, action }) => {
        clients[id].name = name
        clients[id].position = position
        clients[id].rotation = rotation
        clients[id].action = action

        ioServer.sockets.emit('move', clients)
    })

    client.emit('message', messages);

    client.on('message', (msg) => {
        console.log(msg);
        messages.push(msg)
        // Broadcast the message to all connected clients
        ioServer.sockets.emit('message', messages);
    });

    client.on('disconnect', () => {
        console.log(
            `User ${client.id} disconnected, there are currently ${ioServer.engine.clientsCount} users connected`
        )

        //Delete this client from the object
        delete clients[client.id]

        ioServer.sockets.emit('move', clients)
    })

})
