class Island extends WebGLObject {

	constructor(x = 0, y = 0, z = 0, width = 1.0, height = 0.002, depth = 1.0) {
		super(x, y, z, width, height)
		this.depth = depth

		this.model = this.makeModel()
		this.initBuffer()
	}

	/**
	 * Erstelle alle Punkte und Farben
	 *
	 * @return {Object} { mesh, colors }
	 */
	makeModel() {
		let from = {
			x: this.x - this.width / 2,
			y: this.y,
			z: this.z - this.depth / 2
		}

		let to = {
			x: this.x + this.width / 2,
			y: this.y + this.height,
			z: this.z + this.depth / 2
		}

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

		let colors = [].concat.apply([], mesh.map(c => [0.99, 0.847, 0.2, 1]))

		return {
			mesh,
			colors
		}
	}
}