class Island extends WebGLObject {

	constructor(x = 0, y = 0, z = 0, width = 1.0, height = 0.002, depth = 1.0) {
		let colors = new WebGLColor(
			{ r: 0.99, g: 0.857, b: 0.2, a: 1.0 },				// ambient
			{ r: 0.99, g: 0.857, b: 0.2, a: 1.0 },				// diffuse
			{ r: 0.99, g: 0.857, b: 0.2, a: 1.0, n: 24 }		// specular
		)

		super(x, y, z, width, height, colors, { diffuse: state.textures.sandDiffuse, normal: state.textures.sandNormal })
		this.depth = depth

		this.model = this.makeModel()
		this.initBuffer()
	}

	/**
	 * Erstelle alle Punkte
	 *
	 * @return {Object} { mesh, normals }
	 */
	makeModel() {
		let from = {
			x: this.x - this.width / 2,
			y: this.y,
			z: this.z - this.depth / 2
		}

		let to = {
			x: this.x + this.width / 2,
			y: this.y,
			z: this.z + this.depth / 2
		}

		return this.makeTesselatedPlaneModel(from, to, 0.1)
	}
}