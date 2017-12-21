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