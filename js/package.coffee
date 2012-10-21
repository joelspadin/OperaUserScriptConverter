root = this

root.oex = opera.extension
root.bg = oex.bgProcess

root.blocksExtensionDownloads = parseFloat(opera.version()) >= 12.10
root.extension = null

root.incrementVersion = true
root.currentVersion = JSON.parse(sessionStorage['version'] or '0')

require.config
	baseUrl: '/js/lib/'

window.addEventListener 'DOMContentLoaded', () ->
	# update page info and version number

	info =
		'#widget-name': widget.name
		'#widget-version': widget.version
		'#widget-author': widget.author
	for selector, text of info
		document.querySelector(selector).textContent = text

	document.querySelector('#install').addEventListener 'click', installExtension

	await require ['uglify-js'], defer root.uglify

	# if a script is passed through the url hash, download the script
	if location.hash
		# trim off the leading hash sign
		url = location.hash.substr(1)

		document.querySelector('#external-script').style.display = 'block'
		document.querySelector('#url').textContent = url
		document.querySelector('#url').href = url

		# download the script
		await bg.get url, (defer success, script)
		
		root.script = script
		if not success
			console.log "UJS Packager: Failed to download #{url}"
			return

		# fix the script
		config = getConfig(script, url)
		await buildExtension(script, config, defer root.extension)

		document.querySelector('#done').style.display = 'inline'
		if extension?
			showInstallButton(config.name)
		else
			document.querySelector('#done').textContent = 'failed.'
	else
		# if no script was given, allow the user to upload scripts
		document.querySelector('#upload-script').style.display = 'block'

		# event handler for dropped and uploaded files
		handleFileSelect = (e) ->
			hideInstallButton()
			root.extension = null

			scripts = []
			configs = []
			# Filter out everything that isn't a JavaScript file

			files = (file for file in e.dataTransfer?.files ? e.target.files when file.type.match('application/x-javascript'))
			
			# read each file and get its config info
			for file in files
				await readFile file, defer s
				scripts.push(s)
				configs.push getConfig(s, 'file://localhost/' + file.name)

			root.scripts = scripts

			await buildExtension(scripts, configs, defer root.extension)
			if extension?
				showInstallButton(configs[0].name)
			
		# attach the event handler
		document.body.addEventListener 'dragover', (e) ->
			e.stopPropagation()
			e.preventDefault()
			e.dataTransfer.dropEffect = 'copy'

		document.querySelector('#script').addEventListener 'change', handleFileSelect
		document.body.addEventListener 'drop', handleFileSelect

, false

showInstallButton = (name) ->
	button = document.querySelector('#install-script')
	button.style.display = 'block'
	button.querySelector('.name').textContent = name

	if blocksExtensionDownloads
		document.querySelector('#install-instructions').style.display = 'block'


hideInstallButton = () ->
	document.querySelector('#install-script').style.display = 'none'
	document.querySelector('#install-instructions').style.display = 'none'


showError = (msg) ->
	p = document.createElement('p')
	p.textContent = msg
	p.className = 'error'
	document.querySelector('#generated-script').appendChild(p)

# reads an uploaded text file
readFile = (file, callback) ->
	reader = new FileReader
	reader.onload = (e) ->
		callback(e.target.result)

	reader.readAsText(file)


buildExtension = (scripts, configs, callback) ->
	output = document.querySelector('#generated-script')
	output.innerHTML = ''

	# make sure there is at least one script
	if not scripts? or scripts.length == 0
		showError('Error: None of the given files were scripts.')
		return

	# if only one script is given, put it into an array
	if not Array.isArray(scripts)
		scripts = [scripts]

	if not Array.isArray(configs)
		configs = [configs]

	root.prefs = []

	for s, i in scripts
		# fix each script and get its preferences
		[s, prefs[i]] = replacePreferences(s)
		scripts[i] = fixScript(s, configs[i].greasemonkey)

		# put a divider between scripts in the display
		if i > 0
			output.appendChild document.createElement('br')

		# display the generated scripts
		if prefs[i].length > 0
			ul = document.createElement('ul')
			ul.style.display = 'none'
			for [name, value, text, type] in prefs[i]
				li = document.createElement('li')
				li.textContent = "#{name} (#{type})"
				ul.appendChild(li)
			output.appendChild(ul)

		pre = document.createElement('pre')
		pre.textContent = scripts[i] ? ('// Failed to generate script. Original code:\n\n' + s)
		sh_highlightElement(pre, sh_languages.javascript)

		output.appendChild(pre)

	# remove all failed scripts. Don't continue if none are left
	scripts = scripts.filter (x) -> x?
	if scripts.length == 0
		callback?(null)

	# Package the extension as a zip file
	zip = new JSZip
	root.files =
		'config.xml': getConfigXml(configs[0])
		js: {}
		css: {}
		includes: {}

	for s, i in scripts
		files.includes["#{configs[i].name}.js"] = s

	# if any script has preferences, include options page and its dependencies
	if prefs.reduce ((prev, curr) -> !!prev or curr.length > 0), false
		await bg.file '/package/index-prefs.html', defer files['index.html']
		await bg.file '/package/options.html', defer files['options.html']
		await bg.file '/package/css/options.css', defer files.css['options.css']
		await bg.file '/package/js/options.js', defer files.js['options.js']
		await bg.file '/package/js/options_page.js', defer files.js['options_page.js']
		await bg.file '/package/js/storage.js', defer files.js['storage.js']

		# build default settings array
		prefDefs = ("['#{name}', #{JSON.stringify(value)}, '#{text}', '#{type}']" for [name, value, text, type] in scriptPrefs for scriptPrefs, i in prefs)
		prefDefs = prefDefs.join(',\n\t')
		files.js['default_settings.js'] = "var defaults = [ \n\t#{prefDefs} \n]; var storage = new SettingStorage(defaults);"
	else
		await bg.file '/package/index.html', defer files['index.html']
			
	addDirectoryToZip(zip, files)
	callback?(zip.generate())
	
# Fills a zip object with files from an object describing files and directories
# zip -- A JSZip object
# dir -- an object describing files and folders. Each key, value pair should one of:
#		 'filename': 'file data'
#		 'folder name': { dir object }
addDirectoryToZip = (zip, dir) ->
	for name, file of dir
		if typeof file == 'string'
			zip.file name, file
		else if not isEmpty(file)
			folder = zip.folder name
			addDirectoryToZip(folder, file)
			
# Builds the extension as a data URI and opens it in a new tab so that Opera will download it
installExtension = () ->
	if not root.extension?
		return false

	if blocksExtensionDownloads
		mimetype = 'application/zip'
	else
		mimetype = 'application/x-opera-extension'
	
	data = "data:#{mimetype};base64,#{root.extension}"
	bg.oex.tabs.create { url: data, focused: true }


# Applies all the relevant transformations to a script and returns the updated script
fixScript = (script, isGreaseMonkey) ->
	pro = uglify.uglify

	try
		# parse the script
		meta = getMetadata(script)[0]
		ast = uglify.parser.parse(script)
	
		# Wrap GreaseMonkey scripts in a DOMContentLoaded event
		if isGreaseMonkey
			ast = wrapWithLoadedEvent(ast)

		# fix the script
		ast = fixGlobals(ast)
		ast = removeClosure(ast)
		root.ast = ast
	catch error
		if error.col?
			msg = "#{error.message} at line #{error.line}, position #{error.pos}."
			# an unexpected < at the first character usually means the input is HTML instead of JavaScript
			if error.message == 'Unexpected token: operator (<)' and error.line == 1 and error.pos == 1
				msg += ' (This file doesn\'t look like JavaScript.)'
		else
			msg = error.message

		showError(msg)
		return null

	

	return meta + '\n\n' + uglify.uglify.gen_code(ast, { beautify: true })

# Finds userscript preferences, replaces them with references to widget.preferences and returns 
# a tuple containing the updated script and the list of preferences
# returns:
#	script, [ pref1, pref2, ... ] (pref = [name, defaultValue, displayName, type])
replacePreferences = (script) ->
	pattern =  ///
		(var[\s\n]+|^\s*)(\w+[\w\d])					# variable name
		*\s*=\s*.*										# = sign
		/\*\s*@\s* (.+) \s*@\s* (\w+) \s*@\s*\*/		# start comment: /*@ display name @ type @*/
		(.+)											# default value
		/\*\s*@\s*\*/(.+)								# end comment: /*@*/
	///mg

	prefs = []

	script = script.replace pattern, (match, prefix, name, text, type, value, postfix) ->
		# if type is string and value doesn't start with quotes, wrap it in quotes
		if type in ['string', 'color'] and value[0] != '"'
			value = value.replace /^'|'$/g, ''
			value = "\"#{value}\""

		prefs.push [name, JSON.parse(value), text, type]
		return "#{prefix}#{name} = JSON.parse(widget.preferences['#{name}'])#{postfix}"

	return [script, prefs]


# Stick 'window' in front of implicitly global variables since a user script's global namespace is 'window'
root.fixGlobals = (ast) ->
	w = uglify.uglify.ast_walker()
	MAP = uglify.uglify.MAP
	ast_add_scope = uglify.uglify.ast_add_scope
	walk = w.walk
	scope = null
	
	windowDot = (name) ->
		return ['dot', ['name', 'window'], name]

	is_global = (name) ->
		
		# check that the name is not one of various objects which should not or do not need to be global
		if name in ['this', 'arguments', 'null', 'true', 'false', 'undefined', 'window', 'document', 'widget', 'opera', 'Function', 'Object', 'Array', 'String', 'Number', 'Math']
			return false

		# check that the name does not exist in the current or any higher scopes
		currentScope = scope
		while currentScope.parent?
			if name of currentScope.names
				return false
			currentScope = currentScope.parent

		# impossible to tell if variable is global if 'with' or 'eval' is used, so assume it isn't
		currentScope = scope
		while currentScope?
			if currentScope.uses_with
				return false
			currentScope = currentScope.parent

		return true

	_lambda = (name, args, body) ->
		# fix globals for function body
		body = with_scope body.scope, () ->
			return MAP(body, walk)

		# if function defined at top level, add it to window
		if name and this[0] == 'defun' and not scope.parent? and not (scope.uses_with)
			return ['stat',
				['assign', true,
					windowDot(name),
					['function', null, args, body],
				]
			]
		else
			return [this[0], name, args, body]

	_vardefs = (defs) ->
		# top level var defs should be attached to window
		if not scope.parent? and not (scope.uses_with)
			return ['splice', MAP defs, (d) ->
				value = walk(d[1]) ? ['name', 'undefined']
				return ['stat', 
					['assign', true, windowDot(d[0]), value]
				]
			]
		else
			return [this[0], MAP defs, (d) ->
				return [d[0], walk(d[1])]
			]

	with_scope = (s, cont) ->
		_scope = scope
		scope = s

		ret = cont()
		ret.scope = s
		scope = _scope
		return ret

	return w.with_walkers
		'function': _lambda
		'defun': _lambda
		'var': _vardefs
		'name': (name) ->
			if is_global(name)
				return windowDot(name)
			else
				return [this[0], name]
		'toplevel': (body) ->
			self = this
			return with_scope self.scope, () ->
				return [self[0], MAP(body, walk)]
	, () ->
		return walk(ast_add_scope(ast))


# removes anonymous functions used to hide variables from the global namespace
# these are unecessary in extensions
root.removeClosure = (ast) ->
	w = uglify.uglify.ast_walker()
	walk = w.walk

	return w.with_walkers
		'toplevel': (body) ->
			# unwrap all top level blocks wrapped in anonymous function closures
			newstats = []
			for stat in body
				# if the statement is a call...
				if stat[0] == 'stat' and stat[1][0] == 'call'
					call = stat[1]
					# to a function...
					if call[1][0] == 'function'
						func = call[1]
						args = call[2]
						# which is anonymous and whose arguments are the same as the parameters it is called with
						if func[1] == null and areArgsEqual(func[2], args)
							# unwrap it
							newstats = newstats.concat func[3]
							continue

				newstats.push stat

			return [this[0], newstats]
	, () ->
		return walk(ast)


root.wrapWithLoadedEvent = (ast) ->
	body = ast[1]
	return ['toplevel',
		[
			['stat', 
				['call', 
					['dot', ['dot', ['name', 'window'], 'opera'], 'addEventListener']
					[
						['string', 'BeforeEvent.DOMContentLoaded'],
						['function', null, [], body],
						['name', 'false'],
					]
				]
			]
		]
	]
	


getMetadata = (script) ->
	metadata = script.match /\/\/\s*==\s*userscript\s*==([\s\S]+?)\/\/\s*==\s*\/\s*userscript\s*==/i
	if metadata
		return metadata
	else
		return ['', null]


getConfig = (script, url) ->
	urlParts = parseURL(url)

	# find //UserScript block
	metadata = getMetadata(script)[1]
	if metadata?
		# Check each line in metadata block for "@tag data" pairs
		for line in metadata.split /\n/
			metapart = line.match /@(\w+)\s+(.+)/
			if metapart
				[tag, data] = metapart[1..]
				switch tag
					when 'name' then name = data
					when 'namespace' then namespace = data
					when 'description' then description = data
					when 'author' then author = data
					when 'version' then version = data
				
	if not name?
		name = url.split('/').pop().replace /(\.user)?\.js/, ''

	if not version?
		version = '1.0'

	if root.incrementVersion
		version = version + '.' + root.currentVersion
		root.currentVersion += 1
		sessionStorage['version'] = root.currentVersion

	if not description?
		description = "User JavaScript: #{url}"

	if not namespace?
		namespace = "#{urlParts.protocol}://#{urlParts.domain}"

	if not author?
		author = urlParts.domain

	return {
		name: name
		version: version
		description: description
		namespace: namespace
		author: author
		greasemonkey: url.indexOf('.user.js') >= 0
	}

getConfigXml = (config) ->
	if config.namespace.indexOf('://') >= 0
		href = " href=\"#{config.namespace.encodeHTML()}\""
	else
		href = ''

	return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n
<widget xmlns=\"http://www.w3.org/ns/widgets\" version=\"#{config.version.encodeHTML()}\" id=\"extensions:#{config.name.encodeHTML()}\">\n
	<name>#{config.name.encodeHTML()}</name>\n
	<description>#{config.description.encodeHTML()}</description>\n
	<author#{href}>#{config.author.encodeHTML()}</author>\n
</widget>"


parseURL = (url) ->
	[protocol, sep, path] = url.partition '://'
	[domain, sep, path] = path.partition '/'
	[path, sep, query] = path.partition '?'
	[query, sep, hash] = query.partition '#'

	return {
		protocol: protocol
		domain: domain
		path: path
		query: query
		hash: hash
	}

String.prototype.partition = (sep) ->
	index = this.indexOf(sep)
	if index != -1
		return [this.substr(0, index), sep, this.substr(index + sep.length)]
	else
		return [this, '', '']

String.prototype.encodeHTML = ->
	return this.replace(/&/g, '&amp;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#39;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')

isEmpty = (o) ->
	if o.length?
		if o.length > 0
			return false
		if o.length == 0
			return true

	for key of o
		return false

	return true

areArgsEqual = (a, b) ->
	if a.length != b.length
		return false

	for elem, i in a
		if elem != b[i] # and not b[i][0]? and (b[i][0] == 'dot' and b[i][1][1] == 'window' and elem != b[i][2])
			return false

	return true