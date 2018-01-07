/**
 * Just a palm tree leaf
 */
class PalmTreeLeaf extends WebGLObject {

	constructor(x, y, z, width = 0.1, height = 0.2, rotation = 0) {
		super(x, y, z, width, height)

		this.setModelMatrix(this.makeModelMatrix({ x: 0, y: 0, z: 0 }, { x: 0, y: rotation, z: 0 }))
		this.updateBuffer()
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

		let colors = [].concat.apply([], mesh.map(c => [0.2, 0.55, 0.235, 1]))

		let normals = [
			0, 1, 0,
			0, 1, 0,
			0, 1, 0,
			0, 0.4, 0,
			0, 0.4, 0,
			0, 0.4, 0,
		];

		return {
			mesh,
			normals, // TODO
			colors
		}
	}
}