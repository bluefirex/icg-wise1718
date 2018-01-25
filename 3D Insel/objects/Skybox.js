/**
 * Skybox
 */
class Skybox extends WebGLObject {
	constructor() {
		let colors = new WebGLColor(
			{ r: 0, g: 0.29, b: 0.49, a: 1.0 },				// ambient
			{ r: 0, g: 0.29, b: 0.49, a: 1.0 },				// diffuse
			{ r: 0, g: 0.29, b: 0.49, a: 1.0, n: 0 }		// specular
		)

		super(0, -4, 0, 8.0, 8.0, colors, { diffuse: state.textures.skybox })
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
			z: this.z - (this.width / 2)
		}

		let to = {
			x: this.x + this.width / 2,
			y: this.y + this.height,
			z: this.z + (this.width / 2)
		}

		return this.makeCubeModel(from, to)
	}
}