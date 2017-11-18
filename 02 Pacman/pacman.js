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

	// Reset for drawing
	gl.clear(gl.COLOR_BUFFER_BIT)

	let x = 0,
		y = 0,
		angle = 0,
		radius = 10

	window.addEventListener('keydown', (e) => {
		switch (e.keyCode) {
			case 37: // Left
				angle -= 0.1
				break;

			case 38: // Up
				x = Math.max(
					Math.min(
						1 - (1 / radius),
						x + (Math.cos(angle) * (1 / radius)) / 2
					),
					-1 + (1 / radius)
				)

				y = Math.max(
					Math.min(
						1 - (1 / radius),
						y - (Math.sin(angle) * (1 / radius)) / 2
					),
					-1 + (1 / radius)
				)
				
				break;

			case 39: // Right
				angle += 0.1
				break;

			case 40: // Down
				break;
		}
	})

	// Gimmick: Mouth Animation
	let odd = false

	setInterval(() => {
		odd = !odd
	}, 300)

	// Render
	let render = () => {
		// Draw Pacman
		drawPacman(radius, 60, odd ? 15 : 55, x, y, angle)
		requestAnimationFrame(render)
	}

	requestAnimationFrame(render)
}

/**
 * Draw a pacman! \o/
 *
 * @param  {Number} radius     Radius between 0 (none) and 1 (full-size)
 * @param  {Number} vertices   Number of vertices to use for the body, defaults to 8
 * @param  {Number} mouthAngle Size of the mouse as an angle, defaults to 45
 */
function drawPacman(radius, vertices = 8, mouthAngle = 45, x = 0, y = 0, rotation = 0) {
	radius = 1 / radius

	// Tell Shader what to do
	const locRotation = gl.getUniformLocation(program, 'rotation')
	const locTranslation = gl.getUniformLocation(program, 'translation')

	gl.uniform2fv(locTranslation, new Float32Array([ x, y ]))
	gl.uniform1f(locRotation, rotation)

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