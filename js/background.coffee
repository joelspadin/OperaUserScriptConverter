root = this
root.oex = opera.extension

oex.onmessage = (e) ->
	if e.data.action of messageHandlers
		messageHandlers[e.data.action](e)
	else
		console.log "UJS Packager: Unknown action \"#{e.data.action}\""

messageHandlers = 
	'package': (e) ->
		oex.tabs.create { url: "options.html##{e.data.script}", focused: true }



root.get = (url, callback) ->
	xhr = new XMLHttpRequest
	xhr.open 'get', url, true
	xhr.responseType = 'text'
	
	xhr.onload = (e) ->
		if this.status == 200 or this.status == 0
			callback true, this.responseText
		else
			callback false, this

	xhr.send()

root.file = (path, callback) ->
	root.get path, (success, file) ->
		if success
			callback?(file)
		else
			console.log "UJS Packager: Could not load file \"#{path}\""
			callback?('')