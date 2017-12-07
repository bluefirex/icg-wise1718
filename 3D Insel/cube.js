// Environment variables
let gl,
	canvas

// Scene variables
let objects = []

// Shader variables
let program

let pointLoc,
	colorLoc

let modelMatrixLoc

let viewMatrixLoc,
	viewMatrix

let projectionMatrixLoc,
	projectionMatrix

let config = {
	island: {
		size: 1.3
	},

	camera: {
		x: 0,
		y: 0.2,
		z: 1
	},

	target: {
		x: 0,
		y: 0,
		z: 0
	}
}

function degToRad(deg) {
	return deg * Math.PI / 180
}

/** Base **/
class WebGLObject {
	constructor(x, y, z, width, height) {
		this.x = x
		this.y = y
		this.z = z
		this.width = width
		this.height = height

		this.vbo = gl.createBuffer()
		this.model = this.makeModel()

		this.setModelMatrix(this.makeModelMatrix())
		this.initBuffer()
	}

	/**
	 * Initialisiere den VBO mit allen Vertices und Farben
	 */
	initBuffer() {
		gl.useProgram(program)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.model.mesh.concat(this.model.colors)), gl.STATIC_DRAW)
	}

	/**
	 * Aktualisiere den Buffer mit aktualisierten Transformationsmatrizen
	 */
	updateBuffer() {
		gl.uniformMatrix4fv(modelMatrixLoc, false, new Float32Array(this.modelMatrix))
	}

	/**
	 * Erstelle eine Transformationsmatrix
	 *
	 * @param  {Object} position Position: { x, y, z }
	 * @param  {Object} rotation Rotation: { x, y, z }
	 *
	 * @return {Array}           Matrix
	 */
	makeModelMatrix(position = { x: 0, y: 0, z: 0 }, rotation = { x: 0, y: 0, z: 0 }) {
		rotation = {
			x: degToRad(rotation.x),
			y: degToRad(rotation.y),
			z: degToRad(rotation.z)
		}

		let mat = mat4.create()

		mat4.translate(mat, mat, [ position.x, position.y, position.z ])
		mat4.rotate(mat, mat, rotation.x, [1, 0, 0])
		mat4.rotate(mat, mat, rotation.y, [0, 1, 0])
		mat4.rotate(mat, mat, rotation.z, [0, 0, 1])

		return mat
	}

	/**
	 * Setze eine Transformationsmatrix.
	 * Nicht vergessen, {@see updateBuffer} aufzurufen!
	 *
	 * @param {Array} matrix Transformationsmatrix – sollte durch {@see makeModelMatrix} erstellt worden sein
	 *
	 * @throws Error Wenn die Matrix keine Matrix ist
	 */
	setModelMatrix(matrix) {
		if (matrix === undefined) {
			throw Error('No model matrix specified.')
		}

		this.modelMatrix = matrix
	}

	makeModel() {
		throw new Error('makeModel must be overriden.')
	}

	/**
	 * Zeichne!
	 */
	render() {
		// Bind the program and the vertex buffer object
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo)

		// Set attribute pointers and enable them
		gl.vertexAttribPointer(pointLoc, 3, gl.FLOAT, false, 0, 0)
		gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, this.model.mesh.length * 4)
		gl.enableVertexAttribArray(pointLoc)
		gl.enableVertexAttribArray(colorLoc)

		// Set uniforms
		this.updateBuffer()

		// Draw the object
		gl.drawArrays(gl.TRIANGLES, 0, this.model.mesh.length / 3)
	}
}

class Island extends WebGLObject {

	constructor(x = 0, y = 0, z = 0, width = 1.0, height = 0.002, depth = 1.0) {
		super(x, y, z, width, height)
		this.depth = depth

		this.model = this.makeModel()
		this.initBuffer()
	}

	/**
	 * Erstelle alle Punkte und Farben
	 *
	 * @return {Object} { mesh, colors }
	 */
	makeModel() {
		let from = {
			x: this.x - this.width / 2,
			y: this.y,
			z: this.z - this.depth / 2
		}

		let to = {
			x: this.x + this.width / 2,
			y: this.y + this.height,
			z: this.z + this.depth / 2
		}

		let mesh = [
			// Front
			from.x, from.y, to.z,
			to.x, from.y, to.z,
			from.x, to.y, to.z,

			to.x, to.y, to.z,
			from.x, to.y, to.z,
			to.x, from.y, to.z,

			// Right
			to.x, to.y, to.z,
			to.x, from.y, to.z,
			to.x, from.y, from.z,

			to.x, to.y, from.z,
			to.x, to.y, to.z,
			to.x, from.y, from.z,

			// Back
			from.x, from.y, from.z,
			to.x, from.y, from.z,
			from.x, to.y, from.z,

			to.x, to.y, from.z,
			from.x, to.y, from.z,
			to.x, from.y, from.z,

			// Left
			from.x, to.y, to.z,
			from.x, from.y, to.z,
			from.x, from.y, from.z,

			from.x, to.y, from.z,
			from.x, to.y, to.z,
			from.x, from.y, from.z,

			// Bottom
			from.x, from.y, to.z,
			from.x, from.y, from.z,
			to.x, from.y, to.z,

			to.x, from.y, from.z,
			from.x, from.y, from.z,
			to.x, from.y, to.z,

			// Top
			from.x, to.y, to.z,
			from.x, to.y, from.z,
			to.x, to.y, to.z,

			to.x, to.y, from.z,
			from.x, to.y, from.z,
			to.x, to.y, to.z
		]

		let colors = [].concat.apply([], mesh.map(c => [0.99, 0.847, 0.2, 1]))

		return {
			mesh,
			colors
		}
	}
}

class Water extends Island {

	makeModel() {
		let model = super.makeModel()
		let colors = [].concat.apply([], model.mesh.map(c => [0, 0.341, 0.6, 1.0]))

		return {
			mesh: model.mesh,
			colors
		}
	}
}

/**
 * Palmenbaumstamm
 */
class PalmTreeTrunk extends WebGLObject {
	constructor(x = 0, y = 0, z = 0, width = 0.1, height = 5) {
		super(x, y, z, width, height)
	}

	/**
	 * Erstelle alle Punkte und Farben
	 *
	 * @return {Object} { mesh, colors }
	 */
	makeModel() {
		let from = {
			x: this.x - this.width / 2,
			y: this.y,
			z: this.z - (this.width / 2)
		}

		let to = {
			x: this.x + this.width / 2,
			y: this.y + this.height,
			z: this.z + (this.width / 2)
		}

		let mesh = [
			// Front
			from.x, from.y, to.z,
			to.x, from.y, to.z,
			from.x, to.y, to.z,

			to.x, to.y, to.z,
			from.x, to.y, to.z,
			to.x, from.y, to.z,

			// Right
			to.x, to.y, to.z,
			to.x, from.y, to.z,
			to.x, from.y, from.z,

			to.x, to.y, from.z,
			to.x, to.y, to.z,
			to.x, from.y, from.z,

			// Back
			from.x, from.y, from.z,
			to.x, from.y, from.z,
			from.x, to.y, from.z,

			to.x, to.y, from.z,
			from.x, to.y, from.z,
			to.x, from.y, from.z,

			// Left
			from.x, to.y, to.z,
			from.x, from.y, to.z,
			from.x, from.y, from.z,

			from.x, to.y, from.z,
			from.x, to.y, to.z,
			from.x, from.y, from.z,

			// Bottom
			from.x, from.y, to.z,
			from.x, from.y, from.z,
			to.x, from.y, to.z,

			to.x, from.y, from.z,
			from.x, from.y, from.z,
			to.x, from.y, to.z,

			// Top
			from.x, to.y, to.z,
			from.x, to.y, from.z,
			to.x, to.y, to.z,

			to.x, to.y, from.z,
			from.x, to.y, from.z,
			to.x, to.y, to.z
		]

		let colors = [].concat.apply([], mesh.map(c => [0.364, 0.25, 0.216, 1]))

		return {
			mesh,
			colors
		}
	}
}

class PalmTreeLeaf extends WebGLObject {

	constructor(x, y, z, width = 0.1, height = 0.2, rotation = 0) {
		super(x, y, z, width, height)

		this.setModelMatrix(this.makeModelMatrix({ x: 0, y: 0, z: 0 }, { x: 0, y: rotation, z: 0 }))
		this.updateBuffer()
	}

	makeModel() {
		let mesh = [
			this.x, this.y, this.z,
			this.x - this.width / 2, this.y, this.z + this.height,
			this.x + this.width / 2, this.y, this.z + this.height,

			this.x - this.width / 2, this.y, this.z + this.height,
			this.x + this.width / 2, this.y, this.z + this.height,
			this.x, this.y - 0.04, this.z + this.height + 0.04
		]

		let colors = [].concat.apply([], mesh.map(c => [0.2, 0.55, 0.235, 1]))

		return {
			mesh,
			colors
		}
	}
}

class PalmTree {

	constructor(x, y, z, height, leafs) {
		this.height = height
		this.trunk = new PalmTreeTrunk(x, y, z, 0.03, this.height)
		this.leafs = []

		let anglePerLeaf = 360 / leafs

		for (let i = 0; i < leafs; i++) {
			this.leafs.push(new PalmTreeLeaf(x, y + this.height + 0.0001, z, 0.1, 0.1, anglePerLeaf * i))
		}
	}

	getLeafs() {
		return this.leafs
	}

	getTrunk() {
		return this.trunk
	}
}

/**
 * Initializes the program, models and shaders
 */
function init() {

	// 1. Get canvas and setup WebGL context
    canvas = document.getElementById("gl-canvas")
	gl = canvas.getContext('webgl')
	
	// 2. Configure viewport
	gl.viewport(0, 0, canvas.width, canvas.height)
	gl.clearColor(0.01, 0.6, 0.9, 1)
	gl.enable(gl.DEPTH_TEST)

	// 3. Specify vertices
	let palmTree = new PalmTree(0, 0, 0, 0.32, 5)

	objects.push(new Water(0, -0.14, 0, 2.0, 0.0019, 2.0))
	objects.push(new Island(0, -0.04, 0, config.island.size, 0.002, config.island.size))
	objects.push(palmTree.getTrunk())
	objects = objects.concat(palmTree.getLeafs())

	// 4. Init shader program via additional function and bind it
	program = initShaders(gl, "vertex-shader", "fragment-shader")
	gl.useProgram(program)

	// 7 Save attribute location to address them
	pointLoc = gl.getAttribLocation(program, "vPosition")
	colorLoc = gl.getAttribLocation(program, "vColor")
	modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix")

	setListeners()
	
	// 8. Render
	render()
}

function setListeners() {
	canvas.addEventListener('mousemove', (e) => {
		let x = (e.offsetX / (canvas.width / 2)) - 1
		let y = (e.offsetY / (canvas.height / 2)) - 1

		config.target.x = x
//		config.target.y = y
	})

	window.addEventListener('keydown', (e) => {
		switch (e.keyCode) {
			case 87: // W
				if (config.camera.z - 0.04 > -config.island.size / 2) {
					// TODO
				}

				break

			case 65: // A
				if (config.camera.x - 0.04 > -config.island.size / 2) {
					config.target.x -= 0.02
					config.camera.x -= 0.02
				}

				break

			case 83: // S
				if (config.camera.z + 0.04 < config.island.size / 2) {
					// TODO
				}

				break

			case 68: // D
				if (config.camera.x + 0.04 < config.island.size / 2) {
					config.target.x += 0.02
					config.camera.x += 0.02
				}

				break
		}
	})
}

function render() {
	// Set view matrix
	let eyeVec = vec3.fromValues(config.camera.x, config.camera.y, config.camera.z)	// Kameraursprung
	//	eyeVec = vec3.fromValues(2, 2, 2)		// Kameraursprung
	let target = vec3.fromValues(config.target.x, config.target.y, config.target.z) // Ziel
	let up = vec3.fromValues(0.0, 1.0, 0.0)		// Wo ist oben?

	viewMatrix = mat4.create()
	mat4.lookAt(viewMatrix, eyeVec, target, up)

	// 7 Save uniform location and save the view matrix into it
	viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix")
	gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix)

	// Set projection matrix
	projectionMatrix = mat4.create()
	mat4.perspective(
		projectionMatrix,
		Math.PI * 0.2,					// Field of View
		canvas.width / canvas.height,	// Aspect Ratio
		0.1,							// Near
		50								// Far
	)

	// 7 Save uniform location and save the projection matrix into it
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix")
	gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix)

	// Actually Render
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	// Call every render function
    objects.forEach(function(object) {
		object.render()
	})

	requestAnimationFrame(render)
}

init()