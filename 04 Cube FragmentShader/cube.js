let canvas

let gl, positions, colors;

let mouseX = 0.5,
	mouseY = 0.5

function init() {

	// 1. Get canvas and setup WebGL context
    canvas = document.getElementById("gl-canvas");
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
	canvas.addEventListener('mousemove', (e) => {
		let x = e.offsetX,
			y = e.offsetY

		mouseX = x / canvas.width
		mouseY = (canvas.height - y) / canvas.height

		console.log(e)
		console.log(canvas.height, y, mouseY)
	})

	// 8. Render
	render();
};

function render()
{
	// 4. Init shader program via additional function and bind it
	const program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// Uniform stuff
	let widthLoc = gl.getUniformLocation(program, 'width')
	let heightLoc = gl.getUniformLocation(program, 'height')

	let mouseXLoc = gl.getUniformLocation(program, 'mouseX')
	let mouseYLoc = gl.getUniformLocation(program, 'mouseY')

	gl.uniform1f(widthLoc, 512.0)
	gl.uniform1f(heightLoc, 512.0)

	gl.uniform1f(mouseXLoc, mouseX)
	gl.uniform1f(mouseYLoc, mouseY)
	
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