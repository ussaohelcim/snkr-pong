import { Server, ServerOptions } from "socket.io";
import express from "express"
import {createServer} from "http"
import path from "path";
import { ISnake, SnkrServer } from "./SnkrServer";
import { jwML } from "./jwML";

const app = express();

const server = createServer(app);

const io = new Server(server,{});
app.use(express.static(path.join(__dirname, '..', 'dist')))

const snkrServer = new SnkrServer();

io.on('connection', (socket) => {
	socket.on('player-join', (playerName,roomName, sendToClient) => {
		socket.data.playername = playerName
		socket.data.room = roomName

		let room = snkrServer.rooms[socket.data.room]

		if (!room) {
			snkrServer.createRoom(roomName)

			room = snkrServer.rooms[socket.data.room]
		}

		if (room) {
			if (room.players.length < 2) {
				let player = room.createPlayer(
					socket.id,
					//if already have player, add to right, ifnot left
					room.players[0] ? 'right' : 'left'
				)

				player.snake.name = playerName + `${room.players.length == 0 ? ' (left)' : " (right)"}`
				snkrServer.joinRoom(player, room)
				room.refreshRoom()
				socket.join(roomName)

				sendToClient({
					snakes: room.getSnakes(),
					rect: room.rect,
					egg: room.egg,
					ball: room.ball.shape
				})

			}
			else {
				//TODO enviar erro 
				sendToClient({
					err: true
				})
			}

			
		}
		
	})

	socket.on('update', (mousePos, sendToClient) => {
		let room = snkrServer.rooms[socket.data.room]

		if (room) {
			let p = room.getPlayer(socket.id)

			if (mousePos) {
				let dir = jwML.vector2Angle(p!.snake.body[0],mousePos)
				p!.snake.angle = dir
			}
			
			sendToClient({
				snakes: room.getSnakes(),
				egg: room.egg,
				ball: room.ball.shape
			})
		}
	})

	socket.on("disconnect", (reason) => {
		let room = snkrServer.rooms[socket.data.room]

		if (room) {
			room.removePlayer(socket.id)
			if (room.players.length === 0) {
				snkrServer.deleteRoom(socket.data.room)
				let idx = snkrServer.roomNames.indexOf(socket.data.room)
				snkrServer.roomNames.splice(idx,1)
			}
		}
  });
})

server.listen(process.env.PORT || 9999, async () => {
	console.log("running at",server.address())
})

setInterval(() => {

	snkrServer.roomNames.forEach((rn) => {
		let room = snkrServer.rooms[rn]

		if (room) {
			room.players.forEach((p) => {
				if (room) {//why the fuck i need this??
					//TODO checar colisao bola  parede

					if (room.checkCollisionWalls(p)) {
						
						io.to(rn).emit('death', p.snake)
						
						p.snake.body = [{ x: Math.random() * room.rect.w, y: Math.random() * room.rect.h, r: 5, egg:false }]
						
					} else if (room.checkCollisionPlayers(p)) {
						io.to(rn).emit('death', p.snake)
						
						p.snake.body = [{ x: Math.random() * room.rect.w, y: Math.random() * room.rect.h, r: 5, egg:false }]
					} else if (room.checkCollisionEgg(p)) {
						room.egg = room.newEgg()
						// io.to(rn).emit('point', p.snake.body[0])
			
						p.ateEgg = true
			
					} else if (room.checkCollisionSelf(p)) {
						io.to(rn).emit('death', p.snake)
						
						p.snake.body = [{ x: Math.random() * room.rect.w, y: Math.random() * room.rect.h, r: 5, egg:false }]
					} 

					let goal = room.isGoal()

					if (goal.isGoal) {

						if (goal.side === 'left') {
							room.players[1].score++
						} else if (goal.side === 'right') {
							room.players[0].score++
						}

						let scores = room.getScoreboard() ?? undefined

						io.to(rn).emit('point', room.ball.shape)
						io.to(rn).emit('score', scores)
						
						room.ball = room.newBall(Math.random() > 0.5 ? 'left': 'right')

					}

					if (room.players.length == 2) {
						room.handleBall(p)
					}

					p.update()
				}
			})
		}
	})
}, 30)
