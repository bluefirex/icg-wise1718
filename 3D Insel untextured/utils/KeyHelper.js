/**
 * What is this for?
 *    When using the browser's built-in keydown event it only repeats
 *    keypressed every once in a while (something less than 60 FPS).
 *    
 *    We use this to remember which keys are currently pressed so
 *    that our rendering can pick up keys whenever it wants to.
 *    
 *    This also enables us to fire changes whenever two keys are
 *    pressed at once, something keydown can't do either.
 */
class KeyHelper {
	constructor() {
		this.pressed = {
			[KeyHelper.CODE_W]: false,
			[KeyHelper.CODE_A]: false,
			[KeyHelper.CODE_S]: false,
			[KeyHelper.CODE_D]: false
		}
	}

	/**
	 * Is a certain key pressed currently?
	 *
	 * @param  {int}  code keyCode
	 *
	 * @return {Boolean}
	 */
	isPressed(code) {
		return this.pressed[code]
	}

	/**
	 * Update state: keydown
	 *
	 * @param  {Event} e Browser Event
	 */
	onKeyDown(e) {
		this.pressed[e.keyCode] = true
	}

	/**
	 * Update state: keyup
	 *
	 * @param  {Event} e Browser Event
	 */
	onKeyUp(e) {
		this.pressed[e.keyCode] = false
	}

	static get CODE_W() {
		return 87
	}

	static get CODE_A() {
		return 65
	}

	static get CODE_S() {
		return 83
	}

	static get CODE_D() {
		return 68
	}
}