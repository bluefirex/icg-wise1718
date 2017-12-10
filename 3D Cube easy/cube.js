// Environment variables
let gl,
canvas;

// Model variables
let	mesh,
	colors;

// Shader variables
let meshBuffer,
	colorBuffer;

let modelMatrixLoc,
	modelMatrix;

let viewMatrixLoc,
	viewMatrix;

let projectionMatrixLoc,
	projectionMatrix;

/**
 * Initializes the program, models and shaders
 */
function init() {

	// 1. Get canvas and setup WebGL context
    canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl');
	
	// 2. Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(0.99,0.99,0.99,1.0);
	gl.enable(gl.DEPTH_TEST);

	// 3. Specify vertices
	positions = [  
		// Front
		-0.5, -0.5,  0.5,
		0.5, -0.5,  0.5,
		0.5,  0.5,  0.5,
		
		0.5,  0.5,  0.5,
		-0.5,  0.5,  0.5,
		-0.5, -0.5,  0.5,
		
		// Right
		0.5,  0.5,  0.5,
		0.5, -0.5,  0.5,
		0.5, -0.5, -0.5,
		
		0.5, -0.5, -0.5,
		0.5,  0.5, -0.5,
		0.5,  0.5,  0.5,
		
		// Back
		-0.5, -0.5, -0.5,
		0.5, -0.5, -0.5,
		0.5,  0.5, -0.5,
		
		0.5,  0.5, -0.5,
		-0.5,  0.5, -0.5,
		-0.5, -0.5, -0.5,
		
		// Left
		-0.5,  0.5,  0.5,
		-0.5, -0.5,  0.5,
		-0.5, -0.5, -0.5,
			
		-0.5, -0.5, -0.5,
		-0.5,  0.5, -0.5,
		-0.5,  0.5,  0.5,
		
		// Bottom
		-0.5, -0.5,  0.5,
		0.5, -0.5,  0.5,
		0.5, -0.5, -0.5,
		
		0.5, -0.5, -0.5,
		-0.5, -0.5, -0.5,
		-0.5, -0.5,  0.5,
		
		// Top
		-0.5,  0.5,  0.5,
		0.5,  0.5,  0.5,
		0.5,  0.5, -0.5,
		
		0.5,  0.5, -0.5,
		-0.5,  0.5, -0.5,
		-0.5,  0.5,  0.5
	];						

	colors = [
		// Front
		0, 0, 1, 1,
		0, 0, 1, 1,
		0, 0, 1, 1,
		0, 0, 1, 1,
		0, 0, 1, 1,
		0, 0, 1, 1,
		
		// Right
		0, 1, 0, 1, 
		0, 1, 0, 1,
		0, 1, 0, 1,
		0, 1, 0, 1,
		0, 1, 0, 1,
		0, 1, 0, 1,
		
		// Back
		1, 0, 0, 1,
		1, 0, 0, 1,
		1, 0, 0, 1,
		1, 0, 0, 1,
		1, 0, 0, 1,
		1, 0, 0, 1,
		
		// Left
		1, 1, 0, 1, 
		1, 1, 0, 1,
		1, 1, 0, 1,
		1, 1, 0, 1,
		1, 1, 0, 1,
		1, 1, 0, 1,
		
		// Bottom
		1, 0, 1, 1, 
		1, 0, 1, 1,
		1, 0, 1, 1,
		1, 0, 1, 1,
		1, 0, 1, 1,
		1, 0, 1, 1,
		
		// Top
		0, 1, 1, 1, 
		0, 1, 1, 1,
		0, 1, 1, 1,
		0, 1, 1, 1,
		0, 1, 1, 1,
		0, 1, 1, 1
	];

	// 4. Init shader program via additional function and bind it
	const program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

    // 5.1 Create VBO for vertices and activate it
	const meshBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, meshBuffer);

	// 6.1 Fill VBO with vertices
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

	// 7.1 Save attribute location to address them
	let pointLoc = gl.getAttribLocation(program, "vPosition");
	gl.vertexAttribPointer(pointLoc, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(pointLoc);

	// 5.2 Create VBO for vertices and activate it
	colorBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);

	// 6.2 Fill VBO with vertices
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
	
	// 7.2 Save attribute location to address them
	let colorLoc = gl.getAttribLocation(program, "vColor");
	gl.vertexAttribPointer(colorLoc, 4, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(colorLoc);
	
	// Set model matrix
	modelMatrix = [
		1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 1
	];
	
	// 7.3 Save uniform location and save the model matrix into it
	modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
	gl.uniformMatrix4fv(modelMatrixLoc, false, new Float32Array(modelMatrix));

    // Set view matrix
	let eye = vec3.fromValues(0.0, 0.0, 2.0);
	let target = vec3.fromValues(0.0, 0.0, 0.0);
	let up = vec3.fromValues(0.0, 1.0, 0.0);

	viewMatrix = mat4.create();
	mat4.lookAt(viewMatrix, eye, target, up);

	// 7.4 Save uniform location and save the view matrix into it
	viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
	gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);

    // Set projection matrix

	projectionMatrix = mat4.create();
	mat4.perspective(projectionMatrix, Math.PI * 0.25, canvas.width / canvas.height, 0.5, 100);

	// 7.5 Save uniform location and save the projection matrix into it
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");
	gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);
	
	// 8. Render
	render();
};

function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, positions.length/3);
	requestAnimationFrame(render);
}

init ();