import re
import subprocess

# Get the contents of the javascript and html files
html = open( "index.html", "r" ).read()

# Remove tabs and newlines from the html file
html = re.sub( '(\t|\n|\r)', '', html )

# Create a command to call google closure on all javascript files
closure = "java -jar compiler.jar --compilation_level ADVANCED_OPTIMIZATIONS --warning_level VERBOSE"

for result in re.finditer( r'<script.*?src="(.*?)"></script>', html ):
	closure += " --js %s" % result.group( 1 ) # Add js file to command
	html = html.replace( result.group( 0 ), "" ) # Remove reference to js file

js = "<script>" + subprocess.check_output( closure, shell=True ) + "</script>"

html = html.replace( "</body>", "</body>" + js ) # Insert js before head

# Also remove </body> and </html> tags (see google.com)
new = re.sub( r"(</html>|</body>)", "", html )

html = html.replace( ' type="text/css"', '' ) # Makes no difference to browser

# Write the resulting string to a new file
with open( "tron.html", "w" ) as output:
	output.write( html )
