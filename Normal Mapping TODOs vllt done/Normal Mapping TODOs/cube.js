// Environment variables
let gl,
	canvas;

// Scene variables
let objects = [];

// Shader variables
let program;

let pointLoc,
	normalLoc,
	texCoordLoc;

let modelMatrixLoc,
	normalMatrixLoc;

let lightPositionLoc,
	IaLoc,
	IdLoc,
	IsLoc,
	kaLoc,
	kdLoc,
	ksLoc,
	specularExponentLoc;

let viewMatrixLoc,
	viewMatrix;

let projectionMatrixLoc,
	projectionMatrix;

let eye,
	target,
	up;

let keyPressed = {
	KeyW: false,
	KeyA: false,
	KeyS: false,
	KeyD: false
};

let sandTexture,
		sandImage,
	sandNormalTexture;
let diffuseMapLoc,
	normalMapLoc;

const speed = 0.02;

function degToRad (deg) {
	return deg * Math.PI / 180;
}

class Cube {
	constructor (from = {x: -0.5, y: -0.5, z: -0.5}, to = {x: 0.5, y: 0.5, z: 0.5}, ka = {r: 0.3, g: 0.3, b: 0.3, a: 1.0}, kd = {r: 0.45, g: 0.23, b: 0.8, a: 1.0}, ks = {r: 0.9, g: 0.67, b: 0.2, a: 1.0}) {
		this.from = from;
		this.to = to;
		this.mesh;
		this.normals;
		this.textureCoordinates;
		this.ka = ka;
		this.kd = kd;
		this.ks = ks;
		this.specularExponent = 20.0;
		this.orientation = {x: 0, y: 0, z: 0};
		this.position = {x: 0, y: 0, z: 0};
		this.verticesVBO = gl.createBuffer();
		this.modelMatrix;
		this.normalMatrix;


		this.SetTransform(this.position, this.orientation);
		this.MakeModel();
		this.InitBuffer();
	}

	/**
	 * Makes the model, namely the mesh and the colors arrays
	 */
	MakeModel () {
		this.mesh = [
			// Front
			this.from.x, this.from.y, this.to.z,
			this.to.x, this.from.y, this.to.z,
			this.from.x, this.to.y, this.to.z,

			this.to.x, this.to.y, this.to.z,
			this.from.x, this.to.y, this.to.z,
			this.to.x, this.from.y, this.to.z,

			// Right
			this.to.x, this.to.y, this.to.z,
			this.to.x, this.from.y, this.to.z,
			this.to.x, this.from.y, this.from.z,

			this.to.x, this.to.y, this.from.z,
			this.to.x, this.to.y, this.to.z,
			this.to.x, this.from.y, this.from.z,

			// Back
			this.from.x, this.from.y, this.from.z,
			this.to.x, this.from.y, this.from.z,
			this.from.x, this.to.y, this.from.z,

			this.to.x, this.to.y, this.from.z,
			this.from.x, this.to.y, this.from.z,
			this.to.x, this.from.y, this.from.z,

			// Left
			this.from.x, this.to.y, this.to.z,
			this.from.x, this.from.y, this.to.z,
			this.from.x, this.from.y, this.from.z,

			this.from.x, this.to.y, this.from.z,
			this.from.x, this.to.y, this.to.z,
			this.from.x, this.from.y, this.from.z,

			// Bottom
			this.from.x, this.from.y, this.to.z,
			this.from.x, this.from.y, this.from.z,
			this.to.x, this.from.y, this.to.z,

			this.to.x, this.from.y, this.from.z,
			this.from.x, this.from.y, this.from.z,
			this.to.x, this.from.y, this.to.z,

			// Top
			this.from.x, this.to.y, this.to.z,
			this.from.x, this.to.y, this.from.z,
			this.to.x, this.to.y, this.to.z,

			this.to.x, this.to.y, this.from.z,
			this.from.x, this.to.y, this.from.z,
			this.to.x, this.to.y, this.to.z
		]

		this.normals = [
			// Front
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,

			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,
			0.0, 0.0, 1.0,

			// Right
			1.0, 0.0, 0.0,
			1.0, 0.0, 0.0,
			1.0, 0.0, 0.0,

			1.0, 0.0, 0.0,
			1.0, 0.0, 0.0,
			1.0, 0.0, 0.0,

			// Back
			0.0, 0.0, -1.0,
			0.0, 0.0, -1.0,
			0.0, 0.0, -1.0,

			0.0, 0.0, -1.0,
			0.0, 0.0, -1.0,
			0.0, 0.0, -1.0,

			// Left
			-1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0,

			-1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0,
			-1.0, 0.0, 0.0,

			// Bottom
			0.0, -1.0, 0.0,
			0.0, -1.0, 0.0,
			0.0, -1.0, 0.0,

			0.0, -1.0, 0.0,
			0.0, -1.0, 0.0,
			0.0, -1.0, 0.0,

			// Top
			0.0, 1.0, 0.0,
			0.0, 1.0, 0.0,
			0.0, 1.0, 0.0,

			0.0, 1.0, 0.0,
			0.0, 1.0, 0.0,
			0.0, 1.0, 0.0
		];

		this.textureCoordinates = [
			// Front
			1.0, 0.0,
			0.0, 0.0,
			1.0, 1.0,

			0.0, 1.0,
			1.0, 1.0,
			0.0, 0.0,

			// Right
			1.0, 1.0,
			1.0, 0.0,
			0.0, 0.0,

			0.0, 1.0,
			1.0, 1.0,
			0.0, 0.0,

			// Back
			0.0, 0.0,
			1.0, 0.0,
			0.0, 1.0,

			1.0, 1.0,
			0.0, 1.0,
			1.0, 0.0,

			// Left
			0.0, 1.0,
			0.0, 0.0,
			1.0, 0.0,

			1.0, 1.0,
			0.0, 1.0,
			1.0, 0.0,

			// Bottom
			0.0, 1.0,
			0.0, 0.0,
			1.0, 1.0,

			1.0, 0.0,
			0.0, 0.0,
			1.0, 1.0,

			// Top
			0.0, 1.0,
			0.0, 0.0,
			1.0, 1.0,

			1.0, 0.0,
			0.0, 0.0,
			1.0, 1.0
		];
	}

	/**
	 * Sets the model matrix
	 * @param {Object} position x,y,z
	 * @param {Object} orientation x,y,z - angles in degree
	 */
	SetTransform (position = this.position, orientation = this.orientation) {

		this.position = position;
		this.orientation = orientation;

		// Convert the orientation to RAD
		orientation = {x: degToRad(orientation.x), y: degToRad(orientation.y), z: degToRad(orientation.z)};

		// Set the transformation matrix
		this.modelMatrix = mat4.create();
		mat4.translate(this.modelMatrix, this.modelMatrix, [position.x, position.y, position.z]);
		mat4.rotate(this.modelMatrix, this.modelMatrix, orientation.x, [1, 0, 0]);
		mat4.rotate(this.modelMatrix, this.modelMatrix, orientation.y, [0, 1, 0]);
		mat4.rotate(this.modelMatrix, this.modelMatrix, orientation.z, [0, 0, 1]);

		// Set the normal transformation matrix
		let modelViewMatrix = mat4.create();
		mat4.multiply(modelViewMatrix, viewMatrix, this.modelMatrix);
		this.normalMatrix = mat4.create();
		mat4.transpose(this.normalMatrix, modelViewMatrix);
		mat4.invert(this.normalMatrix, this.normalMatrix);

	}

	/**
	 * Sets the buffer data
	 */
	InitBuffer () {
		gl.useProgram(program);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesVBO);

		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.mesh.concat(this.normals.concat(this.textureCoordinates))), gl.STATIC_DRAW);
	}

	/**
	 * Updates the model matrix to the buffer
	 */
	UpdateBuffer () {
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesVBO);

		this.SetTransform();

		// Push the matrix to the buffer
		gl.uniformMatrix4fv(modelMatrixLoc, false, new Float32Array(this.modelMatrix));
		gl.uniformMatrix4fv(normalMatrixLoc, false, new Float32Array(this.normalMatrix));

		gl.uniform4fv(kaLoc, Object.values(this.ka));
		gl.uniform4fv(kdLoc, Object.values(this.kd));
		gl.uniform4fv(ksLoc, Object.values(this.ks));
		gl.uniform1f(specularExponentLoc, this.specularExponent);
	}

	Render () {

		// Bind the program and the vertex buffer object
		gl.bindBuffer(gl.ARRAY_BUFFER, this.verticesVBO);

		// Set attribute pointers and enable them
		gl.vertexAttribPointer(pointLoc, 3, gl.FLOAT, false, 0, 0);
		gl.vertexAttribPointer(normalLoc, 3, gl.FLOAT, false, 0, this.mesh.length*4);
		gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, (this.mesh.length + this.normals.length)*4);
		gl.enableVertexAttribArray(pointLoc);
		gl.enableVertexAttribArray(normalLoc);
		gl.enableVertexAttribArray(texCoordLoc);

		// Set uniforms
		this.UpdateBuffer();

		// Draw the object
		gl.drawArrays(gl.TRIANGLES, 0, this.mesh.length/3);
	}
}

function initTextures() {
    sandTexture = gl.createTexture();
    sandImage = new Image();
    sandImage.onload = function () { handleTextureLoaded(sandImage, sandTexture); }
    sandImage.src = "sand_diffuse.jpg";

    // TODO: Erstelle analog zu diffuser Textur eine Normal Map für den Sand.
		sandNormals = gl.createTexture();
	  sandImageNormals = new Image();
	  sandImageNormals.onload = function () { handleTextureLoaded(sandImageNormals, sandNormals); }
	  sandImageNormals.src = "sand_normal.jpg";
}

function handleTextureLoaded(image, texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

/**
 * Initializes the program, models and shaders
 */
function init() {

	// 1. Get canvas and setup WebGL context
    canvas = document.getElementById("gl-canvas");
	gl = canvas.getContext('webgl');

	// 2. Configure viewport
	gl.viewport(0,0,canvas.width,canvas.height);
	gl.clearColor(0.95,0.95,0.95,1.0);
	gl.enable(gl.DEPTH_TEST);

	// 4. Init shader program via additional function and bind it
	program = initShaders(gl, "vertex-shader", "fragment-shader");
	gl.useProgram(program);

	// 7 Save attribute location to address them
	pointLoc = gl.getAttribLocation(program, "vPosition");
	normalLoc = gl.getAttribLocation(program, "vNormal");
	texCoordLoc = gl.getAttribLocation(program, "vTexCoord");
	modelMatrixLoc = gl.getUniformLocation(program, "modelMatrix");
	normalMatrixLoc = gl.getUniformLocation(program, "normalMatrix");

	viewMatrixLoc = gl.getUniformLocation(program, "viewMatrix");
	projectionMatrixLoc = gl.getUniformLocation(program, "projectionMatrix");

	lightPositionLoc = gl.getUniformLocation(program, "lightPosition");
	IaLoc = gl.getUniformLocation(program, "Ia");
	IdLoc = gl.getUniformLocation(program, "Id");
	IsLoc = gl.getUniformLocation(program, "Is");
	kaLoc = gl.getUniformLocation(program, "ka");
	kdLoc = gl.getUniformLocation(program, "kd");
	ksLoc = gl.getUniformLocation(program, "ks");
	specularExponentLoc = gl.getUniformLocation(program, "specExp");

	diffuseMapLoc = gl.getUniformLocation(program, "diffuseMap");
	normalMapLoc = gl.getUniformLocation(program, "normalMap");

    // Set view matrix
	eye = vec3.fromValues(0.0, 0.0, 1.0);
	target = vec3.fromValues(0.0, 0.0, 0.0);
	up = vec3.fromValues(0.0, 1.0, 0.0);

	viewMatrix = mat4.create();
	mat4.lookAt(viewMatrix, eye, target, up);

    // Set projection matrix
	projectionMatrix = mat4.create();
	mat4.perspective(projectionMatrix, Math.PI * 0.25, canvas.width / canvas.height, 0.5, 100);

	// Initialize textures
	initTextures();

	// 7 Save uniform location and save the projection matrix into it
	gl.uniformMatrix4fv(projectionMatrixLoc, false, projectionMatrix);

	gl.uniform3fv(lightPositionLoc, [1.0, 1.0, 1.0]);
	gl.uniform4fv(IaLoc, [0.7, 0.7, 0.7, 1.0]);
	gl.uniform4fv(IdLoc, [0.5, 0.5, 0.5, 1.0]);
	gl.uniform4fv(IsLoc, [0.7, 0.7, 0.7, 1.0]);

	document.addEventListener("keydown", keydown);
	document.addEventListener("keyup", keyup);
	document.addEventListener("mousemove", changeView);
	canvas.onmousedown = function() {
        canvas.requestPointerLock();
	}

	// 3. Specify vertices
	let cube1 = new Cube({x: -2, y: -1, z: -2}, {x: 2, y: -0.5, z: 2}, {r: 0.3, g: 0.0, b: 0.0, a: 1.0}, {r: 0.5, g: 0.0, b: 0.0, a: 1.0}, {r: 1.0, g: 1.0, b: 1.0, a: 1.0});
	objects.push(cube1);

	let cube2 = new Cube({x: -0.5, y: -0.5, z: -0.5}, {x: 0.5, y: 0.5, z: 0.5}, {r: 0.0, g: 0.3, b: 0.0, a: 1.0}, {r: 0.0, g: 0.5, b: 0.0, a: 1.0}, {r: 1.0, g: 1.0, b: 1.0, a: 1.0});
	cube2.SetTransform({x: -0.5, y: 0, z: -1}, {x: 180, y: 45, z: 90});
	objects.push(cube2);

	let cube3 = new Cube({x: -0.5, y: -0.5, z: -0.5}, {x: 0.5, y: 0.5, z: 0.5}, {r: 0.0, g: 0.0, b: 0.3, a: 1.0}, {r: 0.0, g: 0.0, b: 0.5, a: 1.0}, {r: 1.0, g: 1.0, b: 1.0, a: 1.0});
	cube3.SetTransform({x: 0.5, y: 1, z: 0}, {x: 0, y: 0, z: 45});
	objects.push(cube3);

	// 8. Render
	gameLoop();
};

function render()
{
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// Connect diffuse map to the shader
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, sandTexture);
	gl.uniform1i(diffuseMapLoc, 0);

	// TODO: Verknüpfe Normal Map analog zu diffuser Map mit Shader.
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, sandNormals);
	gl.uniform1i(normalMapLoc, 1);

	// Call every render function
    objects.forEach(function(object) {
		object.Render();
	});
}

function update()
{
	let look = [(target[0] - eye[0]) * speed,
				(target[1] - eye[1]) * speed,
				(target[2] - eye[2]) * speed];

	/*
	 *	Using gl-matrix:
		let look = vec3.create();
		vec3.sub(look, target, eye);
		vec3.scale(look, look, speed);
	*/

	if(keyPressed.KeyW) {
		eye[0] += look[0];
		eye[2] += look[2];
		target[0] += look[0];
		target[2] += look[2];
	}
	if(keyPressed.KeyS) {
		eye[0] -= look[0];
		eye[2] -= look[2];
		target[0] -= look[0];
		target[2] -= look[2];
	}
	if(keyPressed.KeyA) {
		eye[0] += look[2];
		eye[2] -= look[0];
		target[0] += look[2];
		target[2] -= look[0];
	}
	if(keyPressed.KeyD) {
		eye[0] -= look[2];
		eye[2] += look[0];
		target[0] -= look[2];
		target[2] += look[0];
	}
	mat4.lookAt(viewMatrix, eye, target, up);

	// Set view matrix
	gl.uniformMatrix4fv(viewMatrixLoc, false, viewMatrix);
}

function gameLoop()
{
	update();
	render();
	requestAnimationFrame(gameLoop);
}

function keydown(e)
{
	keyPressed[e.code] = true;
}

function keyup(e)
{
	keyPressed[e.code] = false;
}

function changeView(e)
{
	vec3.rotateY(target, target, eye, -e.movementX * speed);
	mat4.lookAt(viewMatrix, eye, target, up);
}

init ();
