class WebGLObject {
	constructor(x, y, z, width, height, colors) {
		this.x = x
		this.y = y
		this.z = z
		this.width = width
		this.height = height
		this.colors = colors

		this.vbo = gl.createBuffer()
		this.model = this.makeModel()

		this.setModelMatrix(this.makeModelMatrix())
		this.initBuffer()
	}

	/**
	 * Initialisiere den VBO mit allen Vertices und Farben
	 */
	initBuffer() {
		let data = this.model.mesh.concat(this.model.normals)

		gl.useProgram(program)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
	}

	/**
	 * Aktualisiere den Buffer mit aktualisierten Transformationsmatrizen
	 */
	updateBuffer() {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo)

		this.setNormalMatrix(this.makeNormalMatrix())

		gl.uniformMatrix4fv(state.loc.matrices.model, false, new Float32Array(this.modelMatrix))
		gl.uniformMatrix4fv(state.loc.matrices.normal, false, new Float32Array(this.normalMatrix))

		gl.uniform4fv(state.loc.light.ambientColor, this.colors.ambientColor)
		gl.uniform4fv(state.loc.light.diffuseColor, this.colors.diffuseColor)
		gl.uniform4fv(state.loc.light.specularColor, this.colors.specularColor)
		gl.uniform1f(state.loc.light.specularExponent, this.colors.specularExponent)
	}

	/**
	 * Erstelle eine Modellmatrix
	 *
	 * @param  {Object} position Position: { x, y, z }
	 * @param  {Object} rotation Rotation: { x, y, z }
	 *
	 * @return {Array}
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
	 * Erstelle eine Normalenmatrix
	 *
	 * @return {Array}
	 */
	makeNormalMatrix() {
		let modelViewMatrix = mat4.create()
		mat4.multiply(modelViewMatrix, state.matrices.view, this.modelMatrix)

		let normalMatrix = mat4.create()
		mat4.transpose(normalMatrix, modelViewMatrix)
		mat4.invert(normalMatrix, normalMatrix)

		return normalMatrix
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

	/**
	 * Setze eine Normalenmatrix.
	 * Nicht vergessen, {@see updateBuffer} aufzurufen!
	 *
	 * @param {Array} matrix Normalenmatrix – sollte durch {@see makeNormalMatrix} erstellt worden sein
	 *
	 * @throws Error Wenn die Matrix keine Matrix ist
	 */
	setNormalMatrix(matrix) {
		if (matrix === undefined) {
			throw Error('No normal matrix specified.')
		}

		this.normalMatrix = matrix
	}

	makeModel() {
		throw new Error('makeModel must be overriden.')
	}

	makeCubeModel(from, to) {
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

		let normals = [
			// Front
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,
			0, 0, 1,

			// Right
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,
			1, 0, 0,

			// Back
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,
			0, 0, -1,

			// Left
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,
			-1, 0, 0,

			// Bottom
			0, -1, 0,
			0, -1, 0,
			0, -1, 0,
			0, -1, 0,
			0, -1, 0,
			0, -1, 0,

			// Top
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
		]

		return {
			mesh,
			normals
		}
	}

	/**
	 * Zeichne!
	 */
	render() {
		// Bind the program and the vertex buffer object
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo)

		// Set uniforms
		this.updateBuffer()

		// Set attribute pointers and enable them
		gl.vertexAttribPointer(state.loc.point, 3, gl.FLOAT, false, 0, 0)
		gl.enableVertexAttribArray(state.loc.point)

		gl.vertexAttribPointer(state.loc.normal, 3, gl.FLOAT, false, 0, this.model.mesh.length * 4) // 4 bytes
		gl.enableVertexAttribArray(state.loc.normal)

		// Draw the object
		gl.drawArrays(gl.TRIANGLES, 0, this.model.mesh.length / 3)
	}
}