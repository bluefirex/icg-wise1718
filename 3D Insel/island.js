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
		texCoord: null,
		hasTexture: null,

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
			ambientColor: null,
			diffuseColor: null,
			specularColor: null,
			ambientIntensity: null,
			diffuseIntensity: null,
			specularIntensity: null,
			specularExponent: null
		},

		maps: {
			diffuse: null,
			normal: null
		}
	},

	matrices: {
		view: null,
		projection: null
	},

	textures: {
		sandDiffuse: null,
		sandNormal: null,
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
	program = initShaders(gl, 'vertex-shader', 'fragment-shader')
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
	state.loc.texCoord = gl.getAttribLocation(program, 'vTexCoord')
	state.loc.hasTexture = gl.getUniformLocation(program, 'hasTexture')

	state.loc.matrices.model = gl.getUniformLocation(program, 'modelMatrix')
	state.loc.matrices.normal = gl.getUniformLocation(program, 'normalMatrix')

	state.loc.light.position = gl.getUniformLocation(program, 'lightPosition')
	state.loc.light.ambientColor = gl.getUniformLocation(program, 'ambientColor')
	state.loc.light.diffuseColor = gl.getUniformLocation(program, 'diffuseColor')
	state.loc.light.specularColor = gl.getUniformLocation(program, 'specularColor')
	state.loc.light.ambientIntensity = gl.getUniformLocation(program, 'ambientIntensity')
	state.loc.light.diffuseIntensity = gl.getUniformLocation(program, 'diffuseIntensity')
	state.loc.light.specularIntensity = gl.getUniformLocation(program, 'specularIntensity')
	state.loc.light.specularExponent = gl.getUniformLocation(program, 'specularExponent')

	state.loc.maps.diffuse = gl.getUniformLocation(program, 'diffuseMap')
	state.loc.maps.normal = gl.getUniformLocation(program, 'normalMap')

	// Lock Mouse
	canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock

	// Load Textures, then continue
	Promise.all([ loadTexture('./textures/sand_diffuse.jpg'), loadTexture('./textures/sand_normal.jpg') ]).then((results) => {
		state.textures.sandDiffuse = results[0].texture
		state.textures.sandNormal = results[1].texture
	
		bindTexture(results[0].image, results[0].texture)
		bindTexture(results[1].image, results[1].texture)

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
	})
}

function loadTexture(image) {
	return new Promise((resolve, reject) => {
		let img = new Image()
		
		img.onload = () => {
			resolve({
				image: img,
				texture: gl.createTexture()
			})
		}

		img.src = image
	})
}

function bindTexture(image, texture) {
	gl.bindTexture(gl.TEXTURE_2D, texture)
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST)
	gl.generateMipmap(gl.TEXTURE_2D)
	gl.bindTexture(gl.TEXTURE_2D, null)
}

function connectTexture(texture, loc, i) {
	gl.activeTexture(gl['TEXTURE' + i])
	gl.bindTexture(gl.TEXTURE_2D, texture)
	gl.uniform1i(loc, i)
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
	gl.uniform3fv(state.loc.light.position, [0.5, 0.5, 0.5]);

	gl.uniform4fv(state.loc.light.ambientIntensity, [0.3, 0.3, 0.3, 1.0]);
	gl.uniform4fv(state.loc.light.diffuseIntensity, [0.5, 0.5, 0.5, 1.0]);
	gl.uniform4fv(state.loc.light.specularIntensity, [0.7, 0.7, 0.7, 1.0]);

	gl.uniform1i(state.loc.light.mode, config.lightMode)
}

function render(e) {
	// Resize Canvas
	canvas.width = window.innerWidth
	canvas.height = window.innerHeight

	gl.viewport(0, 0, canvas.width, canvas.height)
	
	// Set Camera
	updateCamera()

	// Set Light
	updateLight()

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
	state.loc.matrices.projection = gl.getUniformLocation(program, 'projectionMatrix')
	gl.uniformMatrix4fv(state.loc.matrices.projection, false, state.matrices.projection)

	// Actually Render
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	// Connect Textures
	connectTexture(state.textures.sandDiffuse, state.loc.maps.diffuse, 0)
	connectTexture(state.textures.sandNormal, state.loc.maps.normal, 1)

	// Call every render function
	objects.forEach(function(object) {
		gl.uniform1i(state.loc.hasTexture, +object.hasTexture())
		object.render()
	})

	if (!e || e != 'limited') {
		requestAnimationFrame(render)
	}
}

init()