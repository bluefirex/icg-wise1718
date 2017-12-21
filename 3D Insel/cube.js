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
			let diff = vec3.fromValues(-0.01, 0, 0)
			vec3.rotateY(diff, diff, vec3.fromValues(0, 0, 0), -state.angle.x)

			vec3.add(state.camera, state.camera, diff)
			vec3.add(state.target, state.target, diff)
		}
	}

	// D-key
	if (state.keyHelper.isPressed(KeyHelper.CODE_D)) {
		if (state.camera[0] + 0.04 < config.island.size / 2) {
			let diff = vec3.fromValues(0.01, 0, 0)
			vec3.rotateY(diff, diff, vec3.fromValues(0, 0, 0), -state.angle.x)

			vec3.add(state.camera, state.camera, diff)
			vec3.add(state.target, state.target, diff)
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