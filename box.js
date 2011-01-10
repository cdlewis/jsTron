/*
 * This file is part of jsTron.
 *
 * jsTron is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * jsTron is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with jsTron.  If not, see <http://www.gnu.org/licenses/>.
 */

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