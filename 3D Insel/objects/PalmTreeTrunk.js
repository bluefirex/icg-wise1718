/**
 * Palmenbaumstamm
 */
class PalmTreeTrunk extends WebGLObject {
	constructor(x = 0, y = 0, z = 0, width = 0.1, height = 5) {
		super(x, y, z, width, height)
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

		let model = this.makeCubeModel(from, to)
		model.colors = [].concat.apply([], model.mesh.map(c => [0.364, 0.25, 0.216, 1]))

		return model
	}
}