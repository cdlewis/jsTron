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
	@param {number} width
	@param {number} height
*/
function Game( width, height )
{
	// alias some functions and variables to make (compiled) code shorter
	/** @const */ var t = this;
	/** @const */ var floor = Math.floor;
	
	// Keeping track of specific state changes (allows for more efficient drawing)
	t.changes = Array();
	
	// Calculate displacement
	var displacement = floor( ( 0.02 * height ) / 2 );
	
	// Place a player on the grid (accounting for displacement)
	t.imprint = function( player )
	{
		if( player.xdir == 1 || player.xdir == -1 ) // Travelling horizontally
		{
			for( var i = player.y - displacement; i <= player.y + displacement; i++ )
			{		
				// Check if out of bounds
				if( player.x < 0 || player.x >= width || i < 0 || i >= height )
					return false;
				
				// Make sure it's unoccupied
				if( t.grid[ player.x ][ i ] != 0 )
					return false;
				
				// Place player
				t.grid[ player.x ][ i ] = player.signature;
				t.changes.push( { x : player.x, y : i, signature : player.signature } );
			}

			return true;
		}
		else // Travelling vertically
		{
			for( var i = player.x - displacement; i <= player.x + displacement; i++ )
			{		
				// Check if out of bounds
				if( i < 0 || i >= width || player.y < 0 || player.y >= height )
					return false;
				
				// Make sure it's unoccupied
				if( t.grid[ i ][ player.y ] != 0 )
					return false;
				
				// Place player
				t.grid[ i ][ player.y ] = player.signature;
				t.changes.push( { x : i, y : player.y, signature : player.signature } );
			}

			return true;
		}
	}
	
	/*
	 * Update the game state
	 * @return {{0: boolean, 1: string}}
	 */
	t.update = function()
	{
		// Move player 1
		t.player1.move();
		var p1_result = t.imprint( t.player1 );
		
		// Move player 2
		t.player2.move();
		var p2_result = t.imprint( t.player2 );
		
		if( p1_result == true && p2_result == true ) // Neither player has made an illegal move
			return [ true, "" ];
		else if( p1_result == false && p2_result == false ) // Both players have made an illegal move
			return [ false, "Draw!" ];
		else if( p1_result == false ) // Player 1 has made an illegal move but Player 2 hasn't
			return [ false, "Green Wins!" ];
		else if( p2_result == false ) // Player 2 has made an illegal move but Player 1 hasn't
			return [ false, "Red Wins!" ];
	}
	
	/*
	 * Revert the game back to its original state
	 */
	t.reset = function()
	{
		// Reset all locations on the grid to 0
		mapMatrix( t.grid, function( element ) { return 0; } );
		
		// Move players to starting locations and directions
		t.player1.reset();
		t.player2.reset();
		
		// Upate the grid to reflect new player locations
		t.imprint( t.player1 );
		t.imprint( t.player2 );
	}
	
	/*
		The grid represents the state of the game with one entry existing
		for every point of the word. These entries can be one of 3 values:
			0 - Empty space
			1 - Occupied by player 1
			2 - Occupied by player 2
	 */
	 t.grid = createMatrix( width, height, 0 );
	
	/*
	 	Setup player co-ordinates and direction. Players do not start at the edge of the wall
	 	because this would lead to boring and predictable games, instead they start a small way
	 	into the level. Because we are indexing into an array the exact positions have been rounded.
	 */
	t.player1 = new Player( floor( .2 * width ), floor( height / 2 ), 1, 0, 1, displacement );
	t.player2 = new Player( floor( .8 * width ), floor( height / 2 ), -1, 0, 2, displacement );

	// Place player 1 on the grid
	t.imprint( t.player1 );
	
	// Place player 2 on the grid
	t.imprint( t.player2 );
}

/**
 * Represents a player in the Game.
 *	@constructor
 *	@param {number} x The player's horizontal location on the grid (see Game)
 *	@param {number} y The player's vertical location on the grid
 *	@param {number} xdir Direction faced by player. -1 = Left, 0 = None, 1 = Right
 *	@param {number} ydir (see xdir)
 *	@param {number} displacement The amount of pixals displaced by the player
 *	@param {number} signature: A unique value associated with the player
 *	@param {number} init_x - suicide protection
 *	@param {number} init_y - suicide protection
 *	@param {number} speed of the player
 */
function Player( x, y, xdir, ydir, signature, displacement )
{
	// alias to make (compiled) code shorter
	/** @const */ var t = this;
	
	// Store initialisation variables in the class
	t.x = x;
	t.y = y;
	t.xdir = xdir;
	t.ydir = ydir;
	t.signature = signature;
	t.init_x = x;
	t.init_y = y;
	t.speed = 1;
	
	t.delayed_move = -1; // If move fails due to displacement, store
	
	var start_x = x;
	var start_y = y;
	var start_xdir = xdir;
	var start_ydir = ydir;

	t.reset = function()
	{
		t.x = start_x;
		t.y = start_y;
		
		t.xdir = start_xdir;
		t.ydir = start_ydir;
	}

	t.move = function()
	{
		if( t.delayed_move != -1 && t.changeDir( t.delayed_move[ 0 ], t.delayed_move[ 1 ] ) )
			t.delayed_move = -1;
		
		t.x += ( t.speed * t.xdir );
		t.y += ( t.speed * t.ydir );
	}

	/**
	 * Due to the displacement factor, changing direction can be quite
	 * complicated. The actual player co-ordinates are in the center of
	 * the 'worm' so the player's position has to be translated into an
	 * appropriate location to avoid instant death upon turning.
	 * @param {number} newXdir The new x direction. -1 = Left, 0 = Center, 1 = Right
	 * @param {number} newYdir The new y direction. -1 = Up, 0 = Center, 1 = Down
	 */
	t.changeDir = function( newXdir, newYdir )
	{
		/*
			This protects against two separate cases:
				1. Player is already moving in the chosen direction.
				2. Player is trying to reverse direction which will result
				   in instant death if allowed.
		 */
		if( newXdir == t.xdir || newYdir == t.ydir )
			return false;
		
		/*
			This restricts how often movement can occur by forcing the
			player to move at least 2 * Displacement before changing
			direction. Otherwise the effects of displacement by result
			in the player accidently running into themselves in a non
			obvious, counter intuitive way.
		 */
		if( Math.abs( t.init_x - t.x ) <= displacement * 2 && Math.abs( t.init_y - t.y ) <= displacement * 2 )
		{
			t.delayed_move = [ newXdir, newYdir ];
			return false;
		}
	
		if( newXdir != 0 ) // Moving left or right
		{
			t.x += newXdir * displacement;
			t.y += -1 * t.ydir * displacement;
		}
		else // Moving up or down
		{
			t.x += -1 * t.xdir * displacement;
			t.y += newYdir * displacement;
		}
		
		// Finally, update the direction faced by the player
		t.xdir = newXdir;
		t.ydir = newYdir;
		
		// Update init co-ordinates to new location
		t.init_x = t.x;
		t.init_y = t.y;
		
		return true;
	}
}

/**
	@constructor
*/
function Controller()
{
	// alias some functions and variables to make (compiled) code shorter
	/** @const */ var w = window;
	/** @const */ var screen_width = w.innerWidth;
	/** @const */ var screen_height = w.innerHeight;
	/** @const */ var t = this;
	/** @const */ var doc = document;
	/** @const */ var doc_body = doc.body
	
	// Create a global reference to the controller
	w.tron = t;
	
	// Only 3 colours are used, they might as well be given meaningful names
	/** @const */ var RED   = "rgb(255,160,160)";
	/** @const */ var GREEN = "rgb(143,200,127)";
	/** @const */ var GRAY  = "rgb(51,51,51)";
	
	// Create the game
	t.game = new Game( screen_width, screen_height );
	
	// Setup the canvas
	var html_canvas = doc.createElement( "canvas" );
	html_canvas.width = screen_width;
	html_canvas.height = screen_height;
	doc_body.appendChild( html_canvas );
	
	// Clear any existing material off the canvas
	var context = html_canvas.getContext( "2d" );
	context.fillStyle = GRAY;
	context.fillRect( 0, 0, screen_width, screen_height );
	
	// Maps keycodes to specific actions (contained in anonymous functions)
	t.keymap = Array();
	t.keymap[ 87 ] = function() { t.game.player1.changeDir(  0, -1 ); }; // W
	t.keymap[ 65 ] = function() { t.game.player1.changeDir( -1,  0 ); }; // A
	t.keymap[ 83 ] = function() { t.game.player1.changeDir(  0,  1 ); }; // S
	t.keymap[ 68 ] = function() { t.game.player1.changeDir(  1,  0 ); }; // D
	t.keymap[ 38 ] = function() { t.game.player2.changeDir(  0, -1 ); }; // Up
	t.keymap[ 40 ] = function() { t.game.player2.changeDir(  0,  1 ); }; // Down
	t.keymap[ 37 ] = function() { t.game.player2.changeDir( -1,  0 ); }; // Left
	t.keymap[ 39 ] = function() { t.game.player2.changeDir(  1,  0 ); }; // Right
	t.keymap[ 13 ] = function() { t.box.click();                      }; // ENTER
	
	// Used for communication with the user
	t.box = new Information_Box();
	t.box.set_message( "Start Game", function() { w.tron.start() } );
	
	// Setup handlers for keyboard input
	w.onkeydown = function( event )
	{
	// 32 = space
	// 16 = shift
		var action = w.tron.keymap[ event.keyCode ];
		
		if( action != undefined ) action();
	};
	
	t.start = function()
	{
		// Start the main loop
		t.loop = setInterval( function() { w.tron.step(); }, 30 );
	}
	
	/*
		Each state change is pushed onto a stack located in Game. This
		means that for drawing all we have to do is pop off each state
		change and update the canvas with that information. As opposed
		to redrawing the entire grid for every frame.
	 */
	t.draw = function()
	{
		while( t.game.changes.length > 0 ) // While there are still items on the stack
		{
			var state = t.game.changes.pop();
			
			if( state.signature == 1 )
				context.fillStyle = RED;
			else
				context.fillStyle = GREEN;
			
			context.fillRect( state.x, state.y, 1, 1 );
		}
	}
	
	t.wipe_canvas = function()
	{
		context.fillStyle = GRAY;  
		context.fillRect( 0, 0, screen_width, screen_height );
	}
	
	/*
		Main loop for the game.
	 */
	t.step = function()
	{
		// Update the game state
		t.game.update();
		var info = t.game.update();
		
		// Draw the new state
		t.draw();
		
		// Check to see if a game ending move has occurred
		if( info[ 0 ] == false )
		{
			// Stop the loop
			clearInterval( t.loop );
			
			// Let them know who won and give them the option to play again
			t.box.set_message( info[ 1 ], function()
			{
				t.game.reset(); // Reset player locations
				t.wipe_canvas(); // Clear the canvas
				t.start()
			} );
		}
	}
}

new Controller();