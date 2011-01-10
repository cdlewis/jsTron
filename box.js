/**
	@constructor
*/
function Information_Box()
{
	/**
	 * DIV element used to center text on the screen 
	 * @private
	 */
	var container = document.createElement( "div" );
	container.setAttribute( "class", "box" );
	
	/**
	 * Message to be displayed
	 * @private
	 */
	var message = document.createElement( "p" );
	
	container.appendChild( message );
	document.body.appendChild( container );

	/**
	 * Set the box's message and attach a callback function to be called
	 * when the box is clicked.
	 * @param {string} text
	 * @param {function(*)} lambda
	 */
	this.set_message = function( text, lambda )
	{
		message.innerHTML = text;
		message.style.display = "block";
		
		/* Calculate the nessessary y offset required to place this object in the exact
		 * center of the screen
		 */
		container.style.top = ( window.innerHeight / 2 ) - parseInt( window.getComputedStyle( container, null ).height, 10 ) / 2;
		
		message.onclick = function( event )
		{
			this.style.display = "none";
			lambda( event );
		}
	}
}