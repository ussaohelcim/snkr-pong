import { jwCL } from "./jwCL"
import { ICircle, ILine, IRect, IVec2 } from "./jwf"
import { jwML } from "./jwML"

export class SnkrServer{
	roomNames:string[] = []
	rooms: { [index: string]: Room | undefined } = {}
	
	createRoom(name:string) {
		this.rooms[name] = new Room(name)
		this.roomNames.push(name)
		console.log((new Date().toISOString()))
		console.log(name,"created")
	}

	joinRoom(player: Player, room:Room) {
		room.addPlayer(player)
		console.log((new Date().toISOString()))
		console.log(player.snake.name,"joined",room.name)
	}

	deleteRoom(name: string) {
		this.rooms[name] = undefined
		console.log((new Date().toISOString()))
		console.log(name,"deleted")
	}
}

class Player{
	snake:ISnake
	ateEgg:boolean
	id: string
	side: 'left'|'right'
	score = 0
	constructor(id:string,rect:IRect,side:'left'|'right') {

		this.snake = {
			body: [{ x: Math.random() * rect.w, y: Math.random() * rect.h, r: 5,egg:false }],
			angle: 0,
			speed: 10,
			name : "anon"
		}
		this.side = side
		this.ateEgg = false
		this.id = id
	}
	update() {
		let d = jwML.AngleToNormalizedVector2(this.snake.angle)

		let lastHead = {
			x:this.snake.body[0].x,
			y:this.snake.body[0].y,
			r: this.snake.body[0].r,
			egg: false
		} 

		lastHead.x += d.x * this.snake.speed
		lastHead.y += d.y * this.snake.speed

		if(!this.ateEgg){

			this.snake.body.pop()
		} else {
			lastHead.egg = true
			this.ateEgg = false
		}

		let newHead = lastHead

		this.snake.body.unshift( newHead )
	}	
}

export interface ISnake{
	body: { x: number, y: number, r: 5,egg:boolean }[]
	angle: number
	speed: 10
	name:string
}

export class Room{

	players: Player[] = []
	rect: IRect
	egg: IRect
	name: string
	ball: Ball
	top: IRect
	bot: IRect
	constructor(name:string,w?: number, h?: number) {
		this.name = name
		this.rect = jwML.rect(0, 0, w || 640, h || 480)
		this.egg = this.newEgg()
		this.ball = this.newBall('left')
		this.top = jwML.rect(0,-10,this.rect.w,10)
		this.bot = jwML.rect(0, this.rect.h + 10, this.rect.w, 10)
	}
	addPlayer(player:Player) {
		this.players.push(player)
	}
	refreshRoom() {
		this.players.forEach((p) => {
			p.snake.body = [{ x: Math.random() * this.rect.w, y: Math.random() * this.rect.h, r: 5, egg: false }]
		})
	}
	newEgg():IRect {
		return {
			h:30,
			w:30,
			x: Math.random() * (this.rect.w-30)   ,
			y: Math.random() * (this.rect.h-30) 
		}
	}
	invertSide(side:'left'|'right') {
		return side === 'left' ? 'right' : 'left' 
	}
	newBall(side:'left'|'right') {
		return new Ball({x: this.rect.w / 2,y:this.rect.h /2,r:5},this.rect, side === 'left' ? jwML.DEG2RAD(180) : 0 )
	}
	createPlayer(id:string,side:'left'|'right') {
		let p = new Player(id,this.rect,side)
		return p
	}
	getPlayer(id:string) {
		return this.players.find((p) => {
			return p.id === id
		})
	}
	getSnakes() {
		let players = this.players.map((p) => {
			return p.snake
		})

		return players
	}
	removePlayer(id: string) {
		let p = this.getPlayer(id)
		if (p) {
			this.players.splice(
				this.players.indexOf(p), 1
			)
			console.log((new Date().toISOString()))
			console.log(p.snake.name,"removed from",this.name,)
		}
	}
	checkCollisionBall(player: Player) {
		let collided = false
		
		player.snake.body.forEach((b, i, a) => {
			if (jwCL.checkCollisionCircles(b, this.ball.shape)) {
				collided = true
				return
			}
		})

		return collided
	}
	handleBall(player: Player) {
		player.snake.body.forEach((b, i, a) => {
			if (jwCL.checkCollisionCircles(b, this.ball.shape)) {

				let a = jwML.vector2Angle(this.ball.shape , b)

				this.ball.a = a + jwML.DEG2RAD(180)
			}
		})
		
		let y = jwCL.checkCollisionCircleRec(this.ball.shape, this.bot) ? -1 : jwCL.checkCollisionCircleRec(this.ball.shape, this.top) ? 1 : 0 

		if (y !== 0) {
			let v = jwML.AngleToNormalizedVector2(this.ball.a) 
			v.y = y

			this.ball.a = jwML.normalizedVector2ToAngle(
				jwML.vector2Normalize(v)
			)
		}

		this.ball.update()
	}
	isGoal() {
		return this.ball.isOnGoal()
	}
	getScoreboard() {
		if (this.players.length == 2)
		{
			return {
				left: {
					name: this.players[0].snake.name , 
					score: this.players[0].score
				} ,
				right:{
					name: this.players[1].snake.name ,
					score: this.players[1].score
				} 
			}
		}
		return undefined
	}

	checkCollisionSelf(player: Player) {
		let collided = false
		player.snake.body.forEach((b, i, a) => {
			if (i > 3) {
				
				if (jwCL.checkCollisionCircles(player.snake.body[0], b)) {
					collided = true
					return 
				}
			}
		})
		return collided
	}
	checkCollisionWalls(player:Player) {
		return (!jwCL.checkCollisionCircleRec(player.snake.body[0],this.rect))
	}
	checkCollisionEgg(player: Player) {
		return jwCL.checkCollisionCircleRec(player.snake.body[0],this.egg)
	}
	checkCollisionPlayers(player: Player) {
		let collided = false

		this.players.forEach((p) => {
			if (p.id !== player.id) {
				p.snake.body.forEach((b) => {
					let c = jwCL.checkCollisionCircles(player.snake.body[0], b)
					if (c) {
						collided = true
						return
					}
				})
			} else if (collided) {
				return
			}
		})

		return collided
	}
}
class Ball {
	a: number
	shape: ICircle
	speed = 2
	rect: IRect
	constructor(c:ICircle,rect:IRect,angle:number) {
		this.shape = c
		this.a = angle
		this.rect = rect
	}
	update() {
		let d = jwML.AngleToNormalizedVector2(this.a)
		this.shape.x += d.x * this.speed 
		this.shape.y += d.y * this.speed 
	}
	isOnGoal() {
		let r = this.shape.x >= this.rect.w 
		let l = this.shape.x <= 0 
		let goal = l || r
		let res = {
			isGoal: goal,
			side: l ? 'left' : r ? 'right' : undefined
		}
		return res
	}
}
