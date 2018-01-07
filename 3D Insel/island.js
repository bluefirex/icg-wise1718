let config = {
	island: {
		size: 1.5
	},

	/**
	 * Speed to move the player by, should be pretty small
	 *
	 * @type {Number}
	 */
	moveSpeed: 0.002,

	/**
	 * Speed to rotate the camera by, should be pretty small
	 *
	 * @type {Number}
	 */
	rotateSpeed: 0.002,

	/**
	 * Determine the mode which should be used for lighting
	 * 1 = Vertex Shader (Phong)
	 * 2 = Fragment Shader (Phong)
	 *
	 * @type {Number}
	 */
	lightMode: 1,

	/**
	 * Enable FPS limiting by pressing "L".
	 * Set null to disable this behavior, set to a valid number
	 * to cap the FPS at that number.
	 *
	 * @type {Number|null}
	 */
	limitFPS: 5
}

/***************************************************************************************
	=== Everything beyond here is internal rendering stuff and not configurable. ===
****************************************************************************************/

// Environment variables
let gl,			// WebGL Context
	canvas,		// Canvas Node
	program,	// WebGL Program
	objects		// WebGL Objects

let state = {
	/**
	 * KeyHelper instance
	 *
	 * @type {KeyHelper}
	 */
	keyHelper: null,

	angle: {
		x: 0,
		y: 0
	},

	camera: vec3.fromValues(0, 0.1, 1),
	target: vec3.fromValues(0, 0, 0.6),

	loc: {
		// Vertices
		point: null,
		normal: null,
		color: null,

		// Matrices
		matrices: {
			model: null,
			normal: null,
			projection: null,
			view: null
		},

		// Light
		light: {
			position: null,
			diffuseColor: null,
			specularColor: null,
			ambientIntensity: null,
			diffuseIntensity: null,
			specularIntensity: null,
			specularExponent: null
		}
	},

	matrices: {
		view: null,
		projection: null
	},

	fpsLimiter: null
}

/**
 * Convert degrees to radians
 *
 * @param  {Number} rad Degrees
 *
 * @return {Number}     Radians
 */
function degToRad(deg) {
	return deg * Math.PI / 180
}

/**
 * Convert radians to degrees
 *
 * @param  {Number} rad Radians
 *
 * @return {Number}     Degrees
 */
function radToDeg(rad) {
	return rad * (180 / Math.PI)
}

/**
 * Initializes the program, models and shaders
 */
function init() {
	// Get canvas and setup WebGL context
    canvas = document.getElementById("gl-canvas")
	gl = canvas.getContext('webgl')
	objects = []
	
	// Configure canvas
	gl.clearColor(0.00, 0.19, 0.39, 1)
	gl.enable(gl.DEPTH_TEST)

	// Init shader program via additional function and bind it
	program = initShaders(gl, 'vertex-shader-light-' + config.lightMode, 'fragment-shader-light-' + config.lightMode)
	gl.useProgram(program)

	// Specify vertices
	let palmTree = new PalmTree(x = 0, y = 0, z = 0, height = 0.32, leafs = 5)

	objects.push(new Water(x = 0, y = -0.041, z = 0, width = 2.0, height = 0.0019, depth = 2.0))
	objects.push(new Island(x = 0, y = -0.04, z = 0, width = config.island.size, height = 0.00191, depth = config.island.size))
	objects.push(palmTree.getTrunk())
	objects = objects.concat(palmTree.getLeafs())
	
	// Save attribute location to address them
	state.loc.point = gl.getAttribLocation(program, 'vPosition')
	state.loc.normal = gl.getAttribLocation(program, 'vNormal')
	state.loc.color = gl.getAttribLocation(program, 'vColor')

	state.loc.matrices.model = gl.getUniformLocation(program, 'modelMatrix')
	state.loc.matrices.normal = gl.getUniformLocation(program, 'normalMatrix')

	state.loc.light.position = gl.getUniformLocation(program, 'lightPos')
	state.loc.light.diffuseColor = gl.getUniformLocation(program, 'diffuseColor')
	state.loc.light.specularColor = gl.getUniformLocation(program, 'specularColor')
	state.loc.light.ambientIntensity = gl.getUniformLocation(program, 'ambientIntensity')
	state.loc.light.diffuseIntensity = gl.getUniformLocation(program, 'diffuseIntensity')
	state.loc.light.specularIntensity = gl.getUniformLocation(program, 'specularIntensity')

	// Lock Mouse
	canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock

	// Set Listeners
	setListeners()
	
	// 8. Render (and respect FPS limiting, if active)
	if (config.limitFPS) {
		console.info('Press L to limit the frame rate')

		state.fpsLimiter = new FPSLimiter(144, render)
		state.fpsLimiter.start()
	} else {
		render()
	}
}

function setListeners() {
	state.keyHelper = new KeyHelper()

	/**
	 * Move mouse, update camera
	 */
	let mouseMove = (e) => {
		let x = e.movementX * 0.01
		let y = e.movementY * 0.01
		let fixedY = degToRad(-radToDeg(state.angle.x) + y) // TODO

		vec3.rotateY(state.target, state.target, state.camera, -x)
		vec3.rotateX(state.target, state.target, state.camera, -y)

		state.angle.x += x
		state.angle.y += y
	}

	/**
	 * Press a key, do stuff
	 */
	let keyUp = (e) => {
		/*
			Limit FPS when someone presses L
		 */
		if (config.limitFPS && e.keyCode == 76) { // L
			let fps

			if (state.fpsLimiter.fps > config.limitFPS) {
				fps = config.limitFPS
			} else {
				fps = 144
			}

			console.log('FPS set to', fps)
			state.fpsLimiter.fps = fps
		}
	}

	/**
	 * When the pointer is locked, add events to react to changes
	 */
	document.addEventListener('pointerlockchange', (e) => {
		if (document.pointerLockElement === canvas) {
			canvas.addEventListener('mousemove', mouseMove)
			window.addEventListener('keydown', state.keyHelper.onKeyDown.bind(state.keyHelper))
			window.addEventListener('keyup', state.keyHelper.onKeyUp.bind(state.keyHelper))
			window.addEventListener('keyup', keyUp)

			console.log('Mouse locked to canvas')
		} else {
			canvas.removeEventListener('mousemove', mouseMove)
			window.removeEventListener('keydown', state.keyHelper.onKeyDown.bind(state.keyHelper))
			window.removeEventListener('keyup', state.keyHelper.onKeyUp.bind(state.keyHelper))
			window.removeEventListener('keyup', keyUp)

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

/**
 * Update the camera's position
 * includes movement made by the player
 */
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
	state.matrices.view = mat4.create()
	mat4.lookAt(state.matrices.view, state.camera, state.target, vec3.fromValues(0, 1, 0))

	state.loc.matrices.view = gl.getUniformLocation(program, "viewMatrix")
	gl.uniformMatrix4fv(state.loc.matrices.view, false, state.matrices.view)
}

/**
 * Update all light constants and positions
 */
function updateLight() {
	gl.uniform3f(state.loc.light.position, 0.1, 1.0, 0.7)
	gl.uniform4f(state.loc.light.diffuseColor, 0.3, 0.3, 0.2, 1.0)
	gl.uniform4f(state.loc.light.specularColor, 1.0, 1.0, 1.0, 1.0)

	gl.uniform1f(state.loc.light.ambientIntensity, 0.6)
	gl.uniform1f(state.loc.light.diffuseIntensity, 0.8)
	gl.uniform1f(state.loc.light.specularIntensity, 1.0)
	gl.uniform1f(state.loc.light.specularExponent, 24)
	gl.uniform1i(state.loc.light.mode, 1)
}

function render(e) {
	// Resize Canvas
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight

	gl.viewport(0, 0, canvas.width, canvas.height)
	updateCamera()

	// Set projection matrix
	state.matrices.projection = mat4.create()
	mat4.perspective(
		state.matrices.projection,
		Math.PI * 0.25,					// Field of View
		canvas.width / canvas.height,	// Aspect Ratio
		0.01,							// Near
		1000							// Far
	)

	// Save uniform location and save the projection matrix into it
	state.loc.projectionMatrix = gl.getUniformLocation(program, "projectionMatrix")
	gl.uniformMatrix4fv(state.loc.projectionMatrix, false, state.matrices.projection)

	// Set Light
	updateLight()

	// Actually Render
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	// Call every render function
    objects.forEach(function(object) {
		object.render()
	})

    if (!e || e != 'limited') {
		requestAnimationFrame(render)
	}
}

init()