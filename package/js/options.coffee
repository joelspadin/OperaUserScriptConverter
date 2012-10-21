
OptionsPage.init(storage);

inputTypes =
	'int': 
		type: 'number'
		step: 1
	'float': 
		type: 'number'
		step: 0.01
	'bool':
		type: 'checkbox'
		check: true
	'string':
		type: 'text'
	'color':
		type: 'color'

makeOption = (name, value, text, type) ->
	typedef = inputTypes[type]
	
	p = document.createElement('p')
	label = document.createElement('label')
	input = document.createElement('input')

	label.textContent = text.replace(/^_+/, '')
	label.setAttribute('for', name)

	input.id = name
	input.name = name
	input.type = typedef?.type ? 'text'
	
	if typedef?.step?
		input.step = typedef.step

	if typedef?.check
		input.checked = value
	else
		input.value = value

	indent = text.match /^_+/
	if indent
		p.style.marginLeft = "#{40 * indent.length}px"

	p.appendChild(input)
	p.appendChild(label)
	return [p, input]


window.addEventListener 'DOMContentLoaded', () ->
	info =
		'#widget-name': widget.name
		'#widget-version': widget.version
		'#widget-author': widget.author
	for selector, text of info
		document.querySelector(selector).textContent = text

	prefs = document.querySelector('#preferences')
	div = document.createElement('div')
	inputs = []

	for option in defaults
		[p, input] = makeOption option...
		div.appendChild(p)
		inputs.push(input)

	prefs.appendChild(div)
	for input in inputs
		OptionsPage.addInput(input)