/**
 * Just a palm tree leaf
 */
class PalmTreeLeaf extends WebGLObject {

	constructor(x, y, z, width = 0.1, height = 0.2, rotation = 0) {
		let colors = new WebGLColor(
			{ r: 0.2, g: 0.55, b: 0.235, a: 1.0 },				// ambient
			{ r: 0.2, g: 0.55, b: 0.235, a: 1.0 },				// diffuse
			{ r: 0.2, g: 0.55, b: 0.235, a: 1.0, n: 24 }		// specular
		)

		super(x, y, z, width, height, colors)

		this.setModelMatrix(this.makeModelMatrix({ x: 0, y: 0, z: 0 }, { x: 0, y: rotation, z: 0 }))
	}

	makeModel() {
		let mesh = [
			this.x, this.y, this.z,
			this.x - this.width / 2, this.y, this.z + this.height,
			this.x + this.width / 2, this.y, this.z + this.height,

			this.x - this.width / 2, this.y, this.z + this.height,
			this.x + this.width / 2, this.y, this.z + this.height,
			this.x, this.y - 0.04, this.z + this.height + 0.04
		]

		let normals = [
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 0.4, 0,
			0, 0.4, 0,
			0, 0.4, 0,
		];

		let texCoord = [
			0.0, 1.0,
			0.5, 1.0,
			1.0, 0.0,

			0.0, 1.0,
			0.5, 1.0,
			1.0, 0.0
		];

		return {
			mesh,
			normals, // TODO
			texCoord // TODO
		}
	}
}