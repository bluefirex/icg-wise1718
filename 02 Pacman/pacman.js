/**
 * PACMAN.JS
 * ICG · Gruppe 2
 *
 * Benjamin, Lou, Kira, Julius
 */

let gl
let program

function init() {
	// 1. Get canvas and setup WebGL context
	const canvas = document.getElementById("gl-canvas")
	gl = canvas.getContext('webgl')

	// 2. Configure viewport
	gl.viewport(0, 0, canvas.width,canvas.height)
	gl.clearColor(1.0, 1.0, 1.0, 1.0)

	// 4. Init shader program via additional function and bind it
	program = initShaders(gl, "vertex-shader", "fragment-shader")
	gl.useProgram(program)

	let odd = false

	setInterval(() => {
		// Reset for drawing
		gl.clear(gl.COLOR_BUFFER_BIT)

		// Draw Pacman
		drawPacman(1.5, 60, odd ? 10 : 55)

		// Draw Border
		drawBorder(0.03, { r: 0, g: 0, b: 0 })

		odd = !odd
	}, 300)
}

/**
 * Draw a border around the canvas
 *
 * @param  {Number}        size  Size of the border
 * @param  {String|Object} color Color to use, either 'random' or an object containing r, g and b values
 */
function drawBorder(size = 0.1, color = 'random') {
	let positions = []
	let colors = []

	if (color !== 'random' && typeof(color) !== 'object') {
		color = {
			r: 0,
			g: 0,
			b: 0
		}
	}

	for (let x = -1 + size / 2; x < 1; x += size) {
		for (let y = -1 + size / 2; y < 1; y += size) {
			let startBorder = -1 + size / 2,
				endBorder = 1 - size / 2

			let isLeft = x == startBorder,
				isRight = x > endBorder - size / 4,
				isTop = y == startBorder,
				isBottom = y > endBorder - size / 4

			if (!isLeft && !isRight && !isTop && !isBottom) {
				continue;
			}

			const square = {
				x,
				y,
				r: color == 'random' ? Math.random() : color.r,
				g: color == 'random' ? Math.random() : color.g,
				b: color == 'random' ? Math.random() : color.b,
				halfSize: size / 2
			}

			positions = positions.concat([
				square.x - square.halfSize, square.y - square.halfSize, 
				square.x - square.halfSize, square.y + square.halfSize, 
				square.x + square.halfSize, square.y + square.halfSize,
				square.x + square.halfSize, square.y + square.halfSize,
				square.x + square.halfSize, square.y - square.halfSize,
				square.x - square.halfSize, square.y - square.halfSize
			])

			colors = colors.concat([
				square.r, square.g, square.b, 1,
				square.r, square.g, square.b, 1,
				square.r, square.g, square.b, 1,
				square.r, square.g, square.b, 1,
				square.r, square.g, square.b, 1,
				square.r, square.g, square.b, 1
			])
		}
	}

	// Create VBO
	const vbo = gl.createBuffer()

	gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions.concat(colors)), gl.STATIC_DRAW)

	// Link Data
	const vPosition = gl.getAttribLocation(program, 'vPosition')
	gl.enableVertexAttribArray(vPosition)
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0)

	const vColor = gl.getAttribLocation(program, 'vColor')
	gl.enableVertexAttribArray(vColor)
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, positions.length * 4)

	// Draw!
	gl.drawArrays(gl.TRIANGLES, 0, positions.length / 2)
}

/**
 * Draw a pacman! \o/
 *
 * @param  {Number} radius     Radius between 0 (none) and 1 (full-size)
 * @param  {Number} vertices   Number of vertices to use for the body, defaults to 8
 * @param  {Number} mouthAngle Size of the mouse as an angle, defaults to 45
 */
function drawPacman(radius, vertices = 8, mouthAngle = 45) {
	radius = 1 / radius

	// Nested function for drawing the body only
	const drawBody = () => {
		let positions = [0, 0] // Mittelpunkt
		let colors = [1, 0.92, 0, 1]

		// Winkel pro Vertex
		const anglePerVertex = (2 * Math.PI) / vertices

		// Vertices
		for (let v = 0; v <= vertices; v++) {
			const angle = anglePerVertex * (v + 0.5)
			const x = Math.cos(angle) * radius
			const y = Math.sin(angle) * radius

			positions = positions.concat([x, y])
			colors = colors.concat([1, 0.8, 0, 1])
		}

		// Create VBO
		const vbo = gl.createBuffer()

		gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions.concat(colors)), gl.STATIC_DRAW)

		// Link Data
		const vPosition = gl.getAttribLocation(program, 'vPosition')
		gl.enableVertexAttribArray(vPosition)
		gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0)

		const vColor = gl.getAttribLocation(program, 'vColor')
		gl.enableVertexAttribArray(vColor)
		gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, positions.length * 4)

		// Draw
		gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length / 2)
	}

	// Nested function for drawing the mouth only
	const drawMouth = () => {
		let positions = [0, 0] // Mittelpunkt
		let colors = []

		const anglePerVertex = (2 * Math.PI) / 360

		for (let m = 0; m <= mouthAngle; m++) {
			const angle = anglePerVertex * (m - mouthAngle / 2)

			positions = positions.concat([
				Math.cos(angle) * (radius),
				Math.sin(angle) * (radius)
			])
		}

		// Dynamically make all points white
		colors = [].concat.apply([], positions.map(p => [1, 1, 1, 1]))

		// Create VBO
		const vbo = gl.createBuffer()

		gl.bindBuffer(gl.ARRAY_BUFFER, vbo)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions.concat(colors)), gl.STATIC_DRAW)

		// Link Data
		const vPosition = gl.getAttribLocation(program, 'vPosition')
		gl.enableVertexAttribArray(vPosition)
		gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0)

		const vColor = gl.getAttribLocation(program, 'vColor')
		gl.enableVertexAttribArray(vColor)
		gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, positions.length * 4)

		// Draw
		gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length / 2)
	}

	drawBody()
	drawMouth()
}

// GO!
init()