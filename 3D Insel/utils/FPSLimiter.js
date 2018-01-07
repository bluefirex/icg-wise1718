/**
 * This can be used to limit the framerate of an animation callback.
 * Modeled after https://stackoverflow.com/a/19773537/1486930
 */
class FPSLimiter {
	constructor(frames, callback) {
		this.delay = 1000 / frames
		this.callback = callback

		this.time = null
		this.frame = -1
		this.ref = null
		this.running = false

		this.loop = (ts) => {
			if (this.time === null) {
				this.time = ts
			}

			let seg = Math.floor((ts - this.time) / this.delay)

			if (seg > this.frame) {
				this.frame = seg

				this.callback('limited', {
					time: ts,
					frame: this.frame
				})
			}

			this.ref = requestAnimationFrame(this.loop)
		}
	}

	/**
	 * Set the current FPS
	 *
	 * @param  {Number} fps FPS to limit to
	 */
	set fps(fps) {
		this.delay = 1000 / fps
		this.frame = -1
		this.time = null
	}

	get fps() {
		return 1000 / this.delay
	}

	/**
	 * Start the loop
	 */
	start() {
		if (!this.running) {
			this.running = true
			this.ref = requestAnimationFrame(this.loop)
		}
	}

	/**
	 * Pause the loop
	 */
	pause() {
		if (this.running) {
			cancelAnimationFrame(this.loop)

			this.running = false
			this.time = null
			this.frame = -1
		}
	}
}