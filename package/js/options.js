(function() {
  var inputTypes, makeOption;

  OptionsPage.init(storage);

  inputTypes = {
    'int': {
      type: 'number',
      step: 1
    },
    'float': {
      type: 'number',
      step: 0.01
    },
    'bool': {
      type: 'checkbox',
      check: true
    },
    'string': {
      type: 'text'
    },
    'color': {
      type: 'color'
    }
  };

  makeOption = function(name, value, text, type) {
    var indent, input, label, p, typedef, _ref;
    typedef = inputTypes[type];
    p = document.createElement('p');
    label = document.createElement('label');
    input = document.createElement('input');
    label.textContent = text.replace(/^_+/, '');
    label.setAttribute('for', name);
    input.id = name;
    input.name = name;
    input.type = (_ref = typedef != null ? typedef.type : void 0) != null ? _ref : 'text';
    if ((typedef != null ? typedef.step : void 0) != null) {
      input.step = typedef.step;
    }
    if (typedef != null ? typedef.check : void 0) {
      input.checked = value;
    } else {
      input.value = value;
    }
    indent = text.match(/^_+/);
    if (indent) p.style.marginLeft = "" + (40 * indent.length) + "px";
    p.appendChild(input);
    p.appendChild(label);
    return [p, input];
  };

  window.addEventListener('DOMContentLoaded', function() {
    var div, info, input, inputs, option, p, prefs, selector, text, _i, _j, _len, _len1, _ref, _results;
    info = {
      '#widget-name': widget.name,
      '#widget-version': widget.version,
      '#widget-author': widget.author
    };
    for (selector in info) {
      text = info[selector];
      document.querySelector(selector).textContent = text;
    }
    prefs = document.querySelector('#preferences');
    div = document.createElement('div');
    inputs = [];
    for (_i = 0, _len = defaults.length; _i < _len; _i++) {
      option = defaults[_i];
      _ref = makeOption.apply(null, option), p = _ref[0], input = _ref[1];
      div.appendChild(p);
      inputs.push(input);
    }
    prefs.appendChild(div);
    _results = [];
    for (_j = 0, _len1 = inputs.length; _j < _len1; _j++) {
      input = inputs[_j];
      _results.push(OptionsPage.addInput(input));
    }
    return _results;
  });

}).call(this);
