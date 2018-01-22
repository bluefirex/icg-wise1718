/**
 * Water
 * Basically the same as an island, just different colors
 */
class Water extends Island {

	constructor(x = 0, y = 0, z = 0, width = 1.0, height = 0.002, depth = 1.0) {
		super(x, y, z, width, height, depth)

		this.colors = new WebGLColor(
			{ r: 0, g: 0.341, b: 0.6, a: 1.0 },				// ambient
			{ r: 0, g: 0.341, b: 0.6, a: 1.0 },				// diffuse
			{ r: 0, g: 0.341, b: 0.6, a: 1.0, n: 24 }		// specular
		)

		this.texture = null
	}
}