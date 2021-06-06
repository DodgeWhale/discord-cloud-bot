# discord-cloud-bot
	Node.js Discord bot designed for Google App Engine, but can be ran locally for testing

	## Base features
	- Express API accepts requests with a name of an audio file to play from the clips directory
	-- Clips folder can be specified setting CLIPS_FOLDER in the .env variables

### .env example
	TOKEN=YOUR DISCORD TOKEN
	CLIPS_FOLDER=/
	URL=http://localhost
	COMMAND_PREFIX=/