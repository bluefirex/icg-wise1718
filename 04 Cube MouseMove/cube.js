let gl, positions, colors;

function init() {

	// 1. Get canvas and setup WebGL context
    const canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl');

	// 2. Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(1.0,1.0,1.0,1.0);

	// 3. Specify geometry
	positions = [ 
		-1, -1, 
		-1, 1,
		1, 1,
		1, -1
	];

	colors = [ 
		0, 1, 0, 1,
		0, 0, 1, 1,
		1, 0, 0, 1,
		1, 1, 0, 1,
	];

	// Events
	canvas.addEventListener('click', (e) => {
		if (!e.altKey) {
			let reds = [0.91, 0.68, 0.94]
			let greens = [0.117, 0.07, 0.38]
			let blues = [0.39, 0.34, 0.57]

			colors = [].concat.apply([], [...new Array(16)].map(c => [
				reds[Math.floor(Math.random() * reds.length)],
				greens[Math.floor(Math.random() * greens.length)],
				blues[Math.floor(Math.random() * blues.length)],
				1
			]))
		}
	})

	window.addEventListener('mousemove', (e) => {
		if (e.altKey) {
			colors = [].concat.apply([], [...new Array(16)].map(c => [
				Math.random(),
				Math.random(),
				Math.random(),
				1
			]))
		}
	})

	// 8. Render
	render();
};

function render()
{
	// 4. Init shader program via additional function and bind it
	const program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);
	
    // 5.1 Create VBO for positions and activate it
	const verticesVBO = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticesVBO);

    // 6.1 Fill VBO with positions
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions.concat(colors)), gl.STATIC_DRAW);

    // 7.1 Link data in VBO to shader variables
	const vPosition = gl.getAttribLocation(program, "vPosition");
	gl.enableVertexAttribArray(vPosition);
	gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);

    // 7.2 Link data in VBO to shader variables
	const vColor = gl.getAttribLocation(program, "vColor");
	gl.enableVertexAttribArray(vColor);
	gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, positions.length*4);

	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLE_FAN, 0, positions.length/2);

	requestAnimationFrame(render);
}

init();