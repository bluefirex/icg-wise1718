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
		size: 1.5
	},

	moveSpeed: 0.01,
	rotateSpeed: 0.01,

	keyHelper: null
}

let state = {
	keyHelper: null,

	angle: {
		x: 0,
		y: 0
	},

	camera: vec3.fromValues(0, 0.1, 1),
	target: vec3.fromValues(0, 0, 0.6)
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

/**
 * Water
 * Basically the same as an island, just different colors
 */
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

/**
 * Just a palm tree leaf
 */
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

/**
 * The whole Palm tree as a composition of WebGL objects
 */
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
 * What is this for?
 *    When using the browser's built-in keydown event it only repeats
 *    keypressed every once in a while (something less than 60 FPS).
 *    
 *    We use this to remember which keys are currently pressed so
 *    that our rendering can pick up keys whenever it wants to.
 *    
 *    This also enables us to fire changes whenever two keys are
 *    pressed at once, something keydown can't do either.
 */
class KeyHelper {
	constructor() {
		this.pressed = {
			[KeyHelper.CODE_W]: false,
			[KeyHelper.CODE_A]: false,
			[KeyHelper.CODE_S]: false,
			[KeyHelper.CODE_D]: false
		}
	}

	/**
	 * Is a certain key pressed currently?
	 *
	 * @param  {int}  code keyCode
	 *
	 * @return {Boolean}
	 */
	isPressed(code) {
		return this.pressed[code]
	}

	/**
	 * Update state: keydown
	 *
	 * @param  {Event} e Browser Event
	 */
	onKeyDown(e) {
		this.pressed[e.keyCode] = true
	}

	/**
	 * Update state: keyup
	 *
	 * @param  {Event} e Browser Event
	 */
	onKeyUp(e) {
		this.pressed[e.keyCode] = false
	}

	static get CODE_W() {
		return 87
	}

	static get CODE_A() {
		return 65
	}

	static get CODE_S() {
		return 83
	}

	static get CODE_D() {
		return 68
	}
}

/**
 * Initializes the program, models and shaders
 */
function init() {
	// 1. Get canvas and setup WebGL context
    canvas = document.getElementById("gl-canvas")
	gl = canvas.getContext('webgl')
	
	// 2. Configure canvas
	gl.clearColor(0.01, 0.6, 0.9, 1)
	gl.enable(gl.DEPTH_TEST)

	// 3. Specify vertices
	let palmTree = new PalmTree(x = 0, y = 0, z = 0, height = 0.32, leafs = 5)

	objects.push(new Water(x = 0, y = -0.14, z = 0, width = 2.0, height = 0.0019, depth = 2.0))
	objects.push(new Island(x = 0, y = -0.04, z = 0, width = config.island.size, height = 0.00191, depth = config.island.size))
	objects.push(palmTree.getTrunk())
	objects = objects.concat(palmTree.getLeafs())

	// 4. Init shader program via additional function and bind it
	program = initShaders(gl, "vertex-shader", "fragment-shader")
	gl.useProgram(program)

	// 7 Save attribute location to address them
	pointLoc = gl.getAttribLocation(program, "vPosition")
	colorLoc = gl.getAttribLocation(program, "vColor")
	modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix")

	// Lock Mouse
	canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock

	// Set Listeners
	setListeners()
	
	// 8. Render
	render()
}

function setListeners() {
	state.keyHelper = new KeyHelper()

	/**
	 * Move mouse, update camera
	 */
	let mouseMove = (e) => {
		let x = e.movementX * 0.01
		let y = e.movementY * 0.01

		vec3.rotateY(state.target, state.target, state.camera, -x)

		console.log(state.target[0], state.target[1])

		vec3.rotateX(state.target, state.target, state.camera, -y)

		state.angle.x += x
		state.angle.y += y
	}

	/**
	 * When the pointer is locked, add events to react to changes
	 */
	document.addEventListener('pointerlockchange', (e) => {
		if (document.pointerLockElement === canvas) {
			canvas.addEventListener('mousemove', mouseMove)
			window.addEventListener('keydown', state.keyHelper.onKeyDown.bind(state.keyHelper))
			window.addEventListener('keyup', state.keyHelper.onKeyUp.bind(state.keyHelper))

			console.log('Mouse locked to canvas')
		} else {
			canvas.removeEventListener('mousemove', mouseMove)
			window.removeEventListener('keydown', state.keyHelper.onKeyDown.bind(state.keyHelper))
			window.removeEventListener('keyup', state.keyHelper.onKeyUp.bind(state.keyHelper))

			console.log('Mouse released from canvas')
		}
	})

	/**
	 * When someone clicks on the canvas, lock the pointer
	 */
	canvas.addEventListener('click', (e) => {
		canvas.requestPointerLock()
	})
}

function updateCamera() {
	// W-key
	if (state.keyHelper.isPressed(KeyHelper.CODE_W)) {
		if (state.camera[2] - 0.04 > -config.island.size / 2) {
			let diff = vec3.fromValues(0, 0, -0.01)
			vec3.rotateY(diff, diff, vec3.fromValues(0, 0, 0), -state.angle.x)

			vec3.add(state.camera, state.camera, diff)
			vec3.add(state.target, state.target, diff)
		}
	}

	// S-key
	if (state.keyHelper.isPressed(KeyHelper.CODE_S)) {
		if (state.camera[2] + 0.04 < config.island.size / 2) {
			let diff = vec3.fromValues(0, 0, 0.01)
			vec3.rotateY(diff, diff, vec3.fromValues(0, 0, 0), -state.angle.x)

			vec3.add(state.camera, state.camera, diff)
			vec3.add(state.target, state.target, diff)
		}
	}

	// A-key
	if (state.keyHelper.isPressed(KeyHelper.CODE_A)) {
		if (state.camera[0] - 0.04 > -config.island.size / 2) {
			vec3.add(state.camera, state.camera, vec3.fromValues(-0.01, 0, 0))
			vec3.add(state.target, state.target, vec3.fromValues(-0.01, 0, 0))
		}
	}

	// D-key
	if (state.keyHelper.isPressed(KeyHelper.CODE_D)) {
		if (state.camera[0] + 0.04 < config.island.size / 2) {
			vec3.add(state.camera, state.camera, vec3.fromValues(0.01, 0, 0))
			vec3.add(state.target, state.target, vec3.fromValues(0.01, 0, 0))
		}
	}

	// Update Matrices
	viewMatrix = mat4.create()
	mat4.lookAt(viewMatrix, state.camera, state.target, vec3.fromValues(0, 1, 0))

	viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix")
	gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix)
}

function render() {
	// Resize Canvas
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight

	gl.viewport(0, 0, canvas.width, canvas.height)
	updateCamera()

	// Set projection matrix
	projectionMatrix = mat4.create()
	mat4.perspective(
		projectionMatrix,
		Math.PI * 0.25,					// Field of View
		canvas.width / canvas.height,	// Aspect Ratio
		0.01,							// Near
		1000							// Far
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