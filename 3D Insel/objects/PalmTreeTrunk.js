/**
 * Palmenbaumstamm
 */
class PalmTreeTrunk extends WebGLObject {
	constructor(x = 0, y = 0, z = 0, width = 0.1, height = 5) {
		let colors = new WebGLColor(
			{ r: 0.364, g: 0.25, b: 0.216, a: 1.0 },				// ambient
			{ r: 0.364, g: 0.25, b: 0.216, a: 1.0 },				// diffuse
			{ r: 0.364, g: 0.25, b: 0.216, a: 1.0, n: 12 }		// specular
		)

		super(x, y, z, width, height, colors)
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