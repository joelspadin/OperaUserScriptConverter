root = this

root.oex = opera.extension
root.bg = oex.bgProcess

root.blocksExtensionDownloads = parseFloat(opera.version()) >= 12.10
root.extension = null

require.config
	baseUrl: '/js/lib/'

window.addEventListener 'DOMContentLoaded', () ->

	info =
		'#widget-name': widget.name
		'#widget-version': widget.version
		'#widget-author': widget.author
	for selector, text of info
		document.querySelector(selector).textContent = text


	await require ['uglify-js'], defer root.uglify

	document.querySelector('#install').addEventListener 'click', installExtension

	if location.hash 
		url = location.hash.substr(1)

		document.querySelector('#external-script').style.display = 'block'
		document.querySelector('#url').textContent = url
		document.querySelector('#url').href = url

		await bg.get url, (defer success, script)

		if not success
			console.log "UJS Packager: Failed to download #{url}"
			return

		config = getConfig(script, url)
		buildExtension(script, config)

		document.querySelector('#done').style.display = 'inline'
		showInstallButton(config.name)
	else
		document.querySelector('#upload-script').style.display = 'block'

		handleFileSelect = (e) ->
			hideInstallButton()
			root.extension = null

			scripts = []
			configs = []
			files = (file for file in e.target.files ? e.dataTransfer.files when file.type.match('application/x-javascript'))
			
			for file in files
				await readFile file, defer s
				scripts.push(s)
				configs.push getConfig(s, 'file://localhost/' + file.name)

			buildExtension(scripts, configs)
			if root.extension?
				showInstallButton(configs[0].name)
			
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


readFile = (file, callback) ->
	reader = new FileReader
	reader.onload = (e) ->
		callback(e.target.result)

	reader.readAsText(file)


buildExtension = (scripts, configs) ->
	output = document.querySelector('#generated-script')
	output.innerHTML = ''

	if scripts.length == 0
		p = document.createElement('p')
		p.textContent = 'Error: None of the given files were scripts.'
		output.appendChild(p)
		return

	if not Array.isArray(scripts)
		scripts = [scripts]

	if not Array.isArray(configs)
		configs = [configs]

	for s, i in scripts
		scripts[i] = fixScript(s, configs[i].greasemonkey)

		if i > 0
			output.appendChild document.createElement('br')

		pre = document.createElement('pre')
		pre.textContent = scripts[i]
		sh_highlightElement(pre, sh_languages.javascript)

		output.appendChild(pre)

	zip = new JSZip
	zip.file 'config.xml', getConfigXml(configs[0])
	zip.file 'index.html', '<!doctype html>'

	includes = zip.folder 'includes'
	for s, i in scripts
		includes.file "#{configs[i].name}.js", s

	root.extension = zip.generate()
	

installExtension = () ->
	if not root.extension?
		return false

	if blocksExtensionDownloads
		mimetype = 'application/zip'
	else
		mimetype = 'application/x-opera-extension'
	
	data = "data:#{mimetype};base64,#{root.extension}"
	bg.oex.tabs.create { url: data, focused: true }



fixScript = (script, isGreaseMonkey) ->
	pro = uglify.uglify

	meta = getMetadata(script)[0]
	ast = uglify.parser.parse(script)
	root.ast = ast

	ast = fixGlobals(ast)
	ast = removeClosure(ast)
	root.ast = ast

	# Wrap GreaseMonkey scripts in a DOMContentLoaded event
	if isGreaseMonkey
		ast = wrapWithLoadedEvent(ast)

	return meta + '\n\n' + uglify.uglify.gen_code(ast, { beautify: true })


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
		# impossible to tell if variable is global if 'with' or 'eval' is used, so assume it isn't
		if scope.uses_with or scope.uses_eval
			return false
		
		# check that the name is not an exception
		if name in ['this', 'arguments', 'null', 'true', 'false', 'undefined', 'window', 'document', 'Function', 'Object', 'Array', 'String', 'Number', 'Math']
			return false

		# check that the name does not exist in the current or any higher scopes
		currentScope = scope
		while currentScope.parent?
			if name of currentScope.names
				return false
			currentScope = currentScope.parent

		return true

	_lambda = (name, args, body) ->
		# fix globals for function body
		body = with_scope body.scope, () ->
			return MAP(body, walk)

		# if function defined at top level, add it to window
		if name and this[0] == 'defun' and not scope.parent?
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
		if not scope.parent?
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
					['dot', ['name', 'window'], 'addEventListener']
					[
						['string', 'DOMContentLoaded'],
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

areArgsEqual = (a, b) ->
	if a.length != b.length
		return false

	for elem, i in a
		if elem != b[i] # and not b[i][0]? and (b[i][0] == 'dot' and b[i][1][1] == 'window' and elem != b[i][2])
			return false

	return true