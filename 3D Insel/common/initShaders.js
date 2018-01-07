//
//  initShaders.js
//

function initShaders(gl, vertexShaderId, fragmentShaderId) {
	const compileShader = (gl, gl_shaderType, shaderSource) => {
		// create vertex shader
		shader = gl.createShader(gl_shaderType)

		// set the shader source code
		gl.shaderSource(shader, shaderSource)

		// compile the shader to make it readable for the GPU
		gl.compileShader(shader)

		const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS)
		
		if (!success) {
			// Something went wrong during compilation; get the error
			const shaderError = gl.getShaderInfoLog(shader)

			console.warn('Could not compile shader #' + vertexShaderId)

			for (let error of shaderError.split("\n").filter(x => x.length > 1)) {
				const [dontcare, errorColumn, errorLine] = error.match(/ERROR: ([0-9]+):([0-9]+)/)
				const line = shaderSource.split("\n")[errorLine - 1]

				console.warn('Error in Line ' + errorLine + ': ', line)
			}

			throw gl.getShaderInfoLog(shader)
		} else {
			return shader
		}
	}
	
	/** 
	 * Setup shader program
	 */
	vShaderSource = document.querySelector('#' + vertexShaderId).text
	fShaderSource = document.querySelector('#' + fragmentShaderId).text

	vertexShader = compileShader(gl, gl.VERTEX_SHADER, vShaderSource)
	fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fShaderSource)

	// Build the program
	const program = gl.createProgram()

	// Attach shaders to it
	gl.attachShader(program, vertexShader)
	gl.attachShader(program, fragmentShader)

	gl.linkProgram(program)

	return program
}