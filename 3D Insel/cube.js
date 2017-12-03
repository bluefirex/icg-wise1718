// Environment variables
let gl,
	canvas

// Scene variables
const objects = []

// Shader variables
let program

let pointLoc,
	colorLoc

let modelMatrixLoc

let viewMatrixLoc,
	viewMatrix

let projectionMatrixLoc,
	projectionMatrix

function degToRad(deg) {
	return deg * Math.PI / 180
}

/**
 * Palmenbaumstamm
 */
class PalmTreeTrunk {
	constructor(x = 0, y = 0, height = 0.67) {
		this.x = x
		this.y = y
		this.height = height

		this.colors = []
		this.vbo = gl.createBuffer()
		this.model = this.makeModel()
		this.modelMatrix = this.makeModelMatrix()
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

		// TODO: Insert rotation into matrix

		return [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			position.x, position.y, position.z, 1
		];
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
		if (matrix === undefined || !Array.isArray(matrix)) {
			throw Error('No model matrix specified.')
		}

		this.modelMatrix = matrix
	}

	/**
	 * Erstelle alle Punkte und Farben
	 *
	 * @return {Object} { mesh, colors }
	 */
	makeModel() {
		return {
			mesh: [], // TODO
			colors: [] // TODO
		}
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

/**
 * Initializes the program, models and shaders
 */
function init() {

	// 1. Get canvas and setup WebGL context
    canvas = document.getElementById("gl-canvas")
	gl = canvas.getContext('webgl')
	
	// 2. Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height)
	gl.clearColor(0.95,0.95,0.95,1.0)
	gl.enable(gl.DEPTH_TEST)

	// 3. Specify vertices
	// TODO

	// 4. Init shader program via additional function and bind it
	program = initShaders(gl, "vertex-shader", "fragment-shader")
	gl.useProgram(program)

	// 7 Save attribute location to address them
	pointLoc = gl.getAttribLocation(program, "vPosition")
	colorLoc = gl.getAttribLocation(program, "vColor")
	modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix")

    // Set view matrix
	let eyeVec = vec3.fromValues(0.4, 0.4, 1.0)
	let target = vec3.fromValues(0.0, 0.0, 0.0)
	let up = vec3.fromValues(0.0, 1.0, 0.0)

	viewMatrix = mat4.create()
	mat4.lookAt(viewMatrix, eyeVec, target, up)

	// 7 Save uniform location and save the view matrix into it
	viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix")
	gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix)

    // Set projection matrix
	projectionMatrix = mat4.create()
	mat4.perspective(projectionMatrix, Math.PI * 0.25, canvas.width / canvas.height, 0.5, 100)

	// 7 Save uniform location and save the projection matrix into it
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix")
	gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix)
	
	// 8. Render
	render()
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

	// Call every render function
    objects.forEach(function(object) {
		object.render()
	})

	requestAnimationFrame(render)
}

init()