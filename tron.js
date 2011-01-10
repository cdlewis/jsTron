/**
	@constructor
	@param {number} width
	@param {number} height
*/
function Game( width, height )
{	
	// Keeping track of specific state changes (allows for more efficient drawing)
	this.changes = Array();
	
	// Calculate displacement
	var displacement = Math.floor( ( 0.02 * height ) / 2 );
	
	// Place a player on the grid (accounting for displacement)
	this.imprint = function( player )
	{
		if( player.xdir == 1 || player.xdir == -1 ) // Travelling horizontally
		{
			for( var i = player.y - displacement; i <= player.y + displacement; i++ )
			{		
				// Check if out of bounds
				if( player.x < 0 || player.x >= width || i < 0 || i >= height )
					return false;
				
				// Make sure it's unoccupied
				if( this.grid[ player.x ][ i ] != 0 )
					return false;
				
				// Place player
				this.grid[ player.x ][ i ] = player.signature;
				this.changes.push( { x : player.x, y : i, signature : player.signature } );
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
				if( this.grid[ i ][ player.y ] != 0 )
					return false;
				
				// Place player
				this.grid[ i ][ player.y ] = player.signature;
				this.changes.push( { x : i, y : player.y, signature : player.signature } );
			}

			return true;
		}
	}
	
	/*
	 * Update the game state
	 * @return {Array.<(boolean|string)>}
	 */
	this.update = function()
	{
		// Move player 1
		this.player1.move();
		var p1_result = this.imprint( this.player1 );
		
		// Move player 2
		this.player2.move();
		var p2_result = this.imprint( this.player2 );
		
		if( p1_result == true && p2_result == true ) // Neither player has made an illegal move
			return [ true, 0 ];
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
	this.reset = function()
	{
		// Reset all locations on the grid to 0
		mapMatrix( this.grid, function( element ) { return 0; } );
		
		// Move players to starting locations and directions
		this.player1.reset();
		this.player2.reset();
		
		// Upate the grid to reflect new player locations
		this.imprint( this.player1 );
		this.imprint( this.player2 );
	}
	
	/*
		The grid represents the state of the game with one entry existing
		for every point of the word. These entries can be one of 3 values:
			0 - Empty space
			1 - Occupied by player 1
			2 - Occupied by player 2
	 */
	 this.grid = createMatrix( width, height, 0 );
	
	/*
	 	Setup player co-ordinates and direction. Players do not start at the edge of the wall
	 	because this would lead to boring and predictable games, instead they start a small way
	 	into the level. Because we are indexing into an array the exact positions have been rounded.
	 */
	this.player1 = new Player( Math.floor( .2 * width ), Math.floor( height / 2 ), 1, 0, 1, displacement );
	this.player2 = new Player( Math.floor( .8 * width ), Math.floor( height / 2 ), -1, 0, 2, displacement )

	// Place player 1 on the grid
	this.imprint( this.player1 );
	
	// Place player 2 on the grid
	this.imprint( this.player2 );
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
 */
function Player( x, y, xdir, ydir, signature, displacement )
{
	// Store initialisation variables in the class
	this.x = x;
	this.y = y;
	this.xdir = xdir;
	this.ydir = ydir;
	this.signature = signature;
	
	var init_x = x;
	var init_y = y;
	var start_x = x;
	var start_y = y;
	var start_xdir = xdir;
	var start_ydir = ydir;

	this.reset = function()
	{
		this.x = start_x;
		this.y = start_y;
		
		this.xdir = start_xdir;
		this.ydir = start_ydir;
	}

	this.move = function()
	{
		this.x += this.xdir;
		this.y += this.ydir;
	}

	/**
	 * Due to the displacement factor, changing direction can be quite
	 * complicated. The actual player co-ordinates are in the center of
	 * the 'worm' so the player's position has to be translated into an
	 * appropriate location to avoid instant death upon turning.
	 * @param {number} newXdir The new x direction. -1 = Left, 0 = Center, 1 = Right
	 * @param {number} newYdir The new y direction. -1 = Up, 0 = Center, 1 = Down
	 */
	this.changeDir = function( newXdir, newYdir )
	{
		/*
			This protects against two separate cases:
				1. Player is already moving in the chosen direction.
				2. Player is trying to reverse direction which will result
				   in instant death if allowed.
		 */
		if( newXdir == this.xdir || newYdir == this.ydir )
			return;
		
		/*
			This restricts how often movement can occur by forcing the
			player to move at least 2 * Displacement before changing
			direction. Otherwise the effects of displacement by result
			in the player accidently running into themselves in a non
			obvious, counter intuitive way.
		 */
		if( Math.abs( init_x - this.x ) <= displacement * 2 && Math.abs( init_y - this.y ) <= displacement * 2 )
			return;
		
		if( newXdir != 0 ) // Moving left or right
		{
			this.x += newXdir * displacement;
			this.y += -1 * this.ydir * displacement;
		}
		else // Moving up or down
		{
			this.x += -1 * this.xdir * displacement;
			this.y += newYdir * displacement;
		}
		
		// Finally, update the direction faced by the player
		this.xdir = newXdir;
		this.ydir = newYdir;
		
		// Update init co-ordinates to new location
		init_x = this.x;
		init_y = this.y;
	}
}

/**
	@constructor
*/
function Controller()
{
	// Create a global reference to the controller
	window.tron = this;

	// Give colours meaningful names
	/** @const */ var RED   = "rgb(255,160,160)";
	/** @const */ var GREEN = "rgb(143,200,127)";
	/** @const */ var GRAY  = "rgb(51,51,51)";
	
	// Create the game
	this.game = new Game( window.innerWidth, window.innerHeight );
	
	// Setup the canvas
	var html_canvas = document.createElement( "canvas" );
	html_canvas.width = window.innerWidth;
	html_canvas.height = window.innerHeight;
	document.body.appendChild( html_canvas );
	
	// Clear any existing material off the canvas
	var context = html_canvas.getContext( "2d" );
	context.fillStyle = GRAY;  
	context.fillRect( 0, 0, html_canvas.width, html_canvas.height );
	
	// Maps keycodes to specific actions (contained in anonymous functions)
	this.keymap = Array();
	this.keymap[ 87 ] = function() { window.tron.game.player1.changeDir(  0, -1 ); }; // W
	this.keymap[ 65 ] = function() { window.tron.game.player1.changeDir( -1,  0 ); }; // A
	this.keymap[ 83 ] = function() { window.tron.game.player1.changeDir(  0,  1 ); }; // S
	this.keymap[ 68 ] = function() { window.tron.game.player1.changeDir(  1,  0 ); }; // D
	this.keymap[ 38 ] = function() { window.tron.game.player2.changeDir(  0, -1 ); }; // Up
	this.keymap[ 40 ] = function() { window.tron.game.player2.changeDir(  0,  1 ); }; // Down
	this.keymap[ 37 ] = function() { window.tron.game.player2.changeDir( -1,  0 ); }; // Left
	this.keymap[ 39 ] = function() { window.tron.game.player2.changeDir(  1,  0 ); }; // Right
	
	// Used for communication with the user
	var box = new Information_Box();
	box.set_message( "Start Game", function() { window.tron.start() } );
	
	// Setup handlers for keyboard input
	document.onkeydown = function( event )
	{
		var action = window.tron.keymap[ event.keyCode ];
		
		if( action != undefined ) action();
	};
	
	this.start = function()
	{
		// Start the main loop
		this.loop = setInterval( function() { window.tron.step(); }, 30 );
	}
	
	/*
		Each state change is pushed onto a stack located in Game. This
		means that for drawing all we have to do is pop off each state
		change and update the canvas with that information. As opposed
		to redrawing the entire grid for every frame.
	 */
	this.draw = function()
	{
		while( this.game.changes.length > 0 ) // While there are still items on the stack
		{
			var state = this.game.changes.pop();
			
			if( state.signature == 1 )
				context.fillStyle = RED;
			else
				context.fillStyle = GREEN;
			
			context.fillRect( state.x, state.y, 1, 1 );
		}
	}
	
	this.wipe_canvas = function()
	{
		context.fillStyle = GRAY;  
		context.fillRect( 0, 0, html_canvas.width, html_canvas.height );
	}
	
	/*
		Main loop for the game.
	 */
	this.step = function()
	{
		// Update the game state
		this.game.update();
		var info = this.game.update();
		
		// Draw the new state
		this.draw();
		
		// Check to see if a game ending move has occurred
		if( info[ 0 ] == false )
		{
			// Stop the loop
			clearInterval( this.loop );
			
			// Let them know who won
			
			// Give them the option to play again
			box.set_message( info[ 1 ], function()
			{
				window.tron.game.reset(); // Reset player locations
				window.tron.wipe_canvas(); // Clear the canvas
				window.tron.start()
			} );
		}
	}
}

new Controller();