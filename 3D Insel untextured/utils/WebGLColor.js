/**
 * Helper for Colors for WebGL
 */
class WebGLColor {
	constructor(ambient = { r: 0, g: 0, b: 0, a: 1 }, diffuse = { r: 0, g: 0, b: 0, a: 1 }, specular = { r: 0, g: 0, b: 0, a: 1, n: 1 }) {
		this.ambient = ambient
		this.diffuse = diffuse
		this.specular = specular
	}

	/**
	 * Get the specular exponent
	 *
	 * @return {Number}
	 */
	get specularExponent() {
		return this.specular.n
	}

	/**
	 * Get the ambient color formatted for use with the VBO
	 *
	 * @return {Array}
	 */
	get ambientColor() {
		return Object.values(this.ambient)
	}

	/**
	 * Get the diffuse color formatted for use with the VBO
	 *
	 * @return {Array}
	 */
	get diffuseColor() {
		return Object.values(this.diffuse)
	}

	/**
	 * Get the specular color formatted for use with the VBO
	 *
	 * @return {Array}
	 */
	get specularColor() {
		return [
			this.specular.r,
			this.specular.g,
			this.specular.b,
			this.specular.a
		]
	}
}