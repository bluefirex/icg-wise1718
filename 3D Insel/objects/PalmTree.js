/**
 * The whole Palm tree as a composition of WebGL objects
 */
class PalmTree {

	constructor(x, y, z, height, leafs) {
		this.height = height
		this.trunk = new PalmTreeTrunk(x, y, z, 0.03, this.height)
		this.leafs = []

		let anglePerLeaf = 360 / leafs

		for (let i = 0; i < leafs; i++) {
			this.leafs.push(new PalmTreeLeaf(x, y + this.height + 0.0001, z, 0.1, 0.1, anglePerLeaf * i))
		}
	}

	getLeafs() {
		return this.leafs
	}

	getTrunk() {
		return this.trunk
	}
}