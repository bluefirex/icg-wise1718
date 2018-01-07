/**
 * Water
 * Basically the same as an island, just different colors
 */
class Water extends Island {

	makeModel() {
		let model = super.makeModel()
		let colors = [].concat.apply([], model.mesh.map(c => [0, 0.341, 0.6, 1.0]))

		return {
			mesh: model.mesh,
			normals: model.normals,
			colors
		}
	}
}