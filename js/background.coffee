root = this
root.oex = opera.extension

oex.onmessage = (e) ->
	if e.data.action of messageHandlers
		messageHandlers[e.data.action](e)
	else
		console.log "UJS Packager: Unknown action \"#{e.data.action}\""

messageHandlers = 
	'package': (e) ->
		oex.tabs.create { url: "package.html##{e.data.script}", focused: true }



root.get = (url, callback) ->
	xhr = new XMLHttpRequest
	xhr.open 'get', url, true
	xhr.responseType = 'text'
	
	xhr.onload = (e) ->
		if this.status == 200
			callback true, this.responseText
		else
			callback false, this

	xhr.send()