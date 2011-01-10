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