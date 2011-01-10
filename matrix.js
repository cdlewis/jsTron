/**
	Create an X by Y matrix and return it
	@param {number} width
	@param {number} height
	@param {*} default_value
*/
function createMatrix( width, height, default_value )
{
	var matrix = Array( width );
	
	for( var i = 0; i < width; i++ )
	{
		matrix[ i ] = Array( height );
		
		// For each location, set value to 0
		for( var j = 0; j < height; j++ )
			matrix[ i ][ j ] = default_value;
	}
	
	return matrix;
}

/**
	Execute a function on each cell in a matrix
	@param {Array.<Array.<*>>} matrix
	@param {function(*)} lambda
*/
function mapMatrix( matrix, lambda )
{
	for( var i = 0, width = matrix.length; i < width; i++ )
	{
		for( var j = 0, height = matrix[ j ].length; j < height; j++ )
			matrix[ i ][ j ] = lambda( matrix[ i ][ j ] )
	}
}