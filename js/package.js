(function() {
  var areArgsEqual, buildExtension, fixScript, getConfig, getConfigXml, getMetadata, hideInstallButton, iced, installExtension, parseURL, readFile, root, showInstallButton, __iced_k, __iced_k_noop,
    __slice = [].slice;

  iced = {
    Deferrals: (function() {

      function _Class(_arg) {
        this.continuation = _arg;
        this.count = 1;
        this.ret = null;
      }

      _Class.prototype._fulfill = function() {
        if (!--this.count) return this.continuation(this.ret);
      };

      _Class.prototype.defer = function(defer_params) {
        var _this = this;
        ++this.count;
        return function() {
          var inner_params, _ref;
          inner_params = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
          if (defer_params != null) {
            if ((_ref = defer_params.assign_fn) != null) {
              _ref.apply(null, inner_params);
            }
          }
          return _this._fulfill();
        };
      };

      return _Class;

    })(),
    findDeferral: function() {
      return null;
    }
  };
  __iced_k = __iced_k_noop = function() {};

  root = this;

  root.oex = opera.extension;

  root.bg = oex.bgProcess;

  root.blocksExtensionDownloads = parseFloat(opera.version()) >= 12.10;

  root.extension = null;

  require.config({
    baseUrl: '/js/lib/'
  });

  window.addEventListener('DOMContentLoaded', function() {
    var config, handleFileSelect, info, script, selector, success, text, url, ___iced_passed_deferral, __iced_deferrals, __iced_k,
      _this = this;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    info = {
      '#widget-name': widget.name,
      '#widget-version': widget.version,
      '#widget-author': widget.author
    };
    for (selector in info) {
      text = info[selector];
      document.querySelector(selector).textContent = text;
    }
    (function(__iced_k) {
      __iced_deferrals = new iced.Deferrals(__iced_k, {
        parent: ___iced_passed_deferral
      });
      require(['uglify-js'], __iced_deferrals.defer({
        assign_fn: (function(__slot_1) {
          return function() {
            return __slot_1.uglify = arguments[0];
          };
        })(root),
        lineno: 23
      }));
      __iced_deferrals._fulfill();
    })(function() {
      document.querySelector('#install').addEventListener('click', installExtension);
      if (location.hash) {
        url = location.hash.substr(1);
        document.querySelector('#external-script').style.display = 'block';
        document.querySelector('#url').textContent = url;
        document.querySelector('#url').href = url;
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral
          });
          bg.get(url, (__iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                success = arguments[0];
                return script = arguments[1];
              };
            })(),
            lineno: 34
          })));
          __iced_deferrals._fulfill();
        })(function() {
          if (!success) {
            console.log("UJS Packager: Failed to download " + url);
            return;
          }
          config = getConfig(script, url);
          buildExtension(script, config);
          document.querySelector('#done').style.display = 'inline';
          return __iced_k(showInstallButton(config.name));
        });
      } else {
        document.querySelector('#upload-script').style.display = 'block';
        handleFileSelect = function(e) {
          var configs, file, files, s, scripts, ___iced_passed_deferral1, __iced_deferrals, __iced_k,
            _this = this;
          __iced_k = __iced_k_noop;
          ___iced_passed_deferral1 = iced.findDeferral(arguments);
          hideInstallButton();
          root.extension = null;
          scripts = [];
          configs = [];
          files = (function() {
            var _i, _len, _ref, _ref1, _results;
            _ref1 = (_ref = e.target.files) != null ? _ref : e.dataTransfer.files;
            _results = [];
            for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
              file = _ref1[_i];
              if (file.type.match('application/x-javascript')) _results.push(file);
            }
            return _results;
          })();
          (function(__iced_k) {
            var _i, _len, _ref, _results, _while;
            _ref = files;
            _len = _ref.length;
            _i = 0;
            _results = [];
            _while = function(__iced_k) {
              var _break, _continue, _next;
              _break = function() {
                return __iced_k(_results);
              };
              _continue = function() {
                ++_i;
                return _while(__iced_k);
              };
              _next = function(__iced_next_arg) {
                _results.push(__iced_next_arg);
                return _continue();
              };
              if (!(_i < _len)) {
                return _break();
              } else {
                file = _ref[_i];
                (function(__iced_k) {
                  __iced_deferrals = new iced.Deferrals(__iced_k, {
                    parent: ___iced_passed_deferral1,
                    funcname: "handleFileSelect"
                  });
                  readFile(file, __iced_deferrals.defer({
                    assign_fn: (function() {
                      return function() {
                        return s = arguments[0];
                      };
                    })(),
                    lineno: 56
                  }));
                  __iced_deferrals._fulfill();
                })(function() {
                  scripts.push(s);
                  return _next(configs.push(getConfig(s, 'file://localhost/' + file.name)));
                });
              }
            };
            _while(__iced_k);
          })(function() {
            buildExtension(scripts, configs);
            if (root.extension != null) return showInstallButton(configs[0].name);
          });
        };
        document.body.addEventListener('dragover', function(e) {
          e.stopPropagation();
          e.preventDefault();
          return e.dataTransfer.dropEffect = 'copy';
        });
        document.querySelector('#script').addEventListener('change', handleFileSelect);
        return __iced_k(document.body.addEventListener('drop', handleFileSelect));
      }
    });
  }, false);

  showInstallButton = function(name) {
    var button;
    button = document.querySelector('#install-script');
    button.style.display = 'block';
    button.querySelector('.name').textContent = name;
    if (blocksExtensionDownloads) {
      return document.querySelector('#install-instructions').style.display = 'block';
    }
  };

  hideInstallButton = function() {
    document.querySelector('#install-script').style.display = 'none';
    return document.querySelector('#install-instructions').style.display = 'none';
  };

  readFile = function(file, callback) {
    var reader;
    reader = new FileReader;
    reader.onload = function(e) {
      return callback(e.target.result);
    };
    return reader.readAsText(file);
  };

  buildExtension = function(scripts, configs) {
    var i, includes, output, p, pre, s, zip, _i, _j, _len, _len1;
    output = document.querySelector('#generated-script');
    output.innerHTML = '';
    if (scripts.length === 0) {
      p = document.createElement('p');
      p.textContent = 'Error: None of the given files were scripts.';
      output.appendChild(p);
      return;
    }
    if (!Array.isArray(scripts)) scripts = [scripts];
    if (!Array.isArray(configs)) configs = [configs];
    for (i = _i = 0, _len = scripts.length; _i < _len; i = ++_i) {
      s = scripts[i];
      scripts[i] = fixScript(s, configs[i].greasemonkey);
      if (i > 0) output.appendChild(document.createElement('br'));
      pre = document.createElement('pre');
      pre.textContent = scripts[i];
      sh_highlightElement(pre, sh_languages.javascript);
      output.appendChild(pre);
    }
    zip = new JSZip;
    zip.file('config.xml', getConfigXml(configs[0]));
    zip.file('index.html', '<!doctype html>');
    includes = zip.folder('includes');
    for (i = _j = 0, _len1 = scripts.length; _j < _len1; i = ++_j) {
      s = scripts[i];
      includes.file("" + configs[i].name + ".js", s);
    }
    return root.extension = zip.generate();
  };

  installExtension = function() {
    var data, mimetype;
    if (!(root.extension != null)) return false;
    if (blocksExtensionDownloads) {
      mimetype = 'application/zip';
    } else {
      mimetype = 'application/x-opera-extension';
    }
    data = "data:" + mimetype + ";base64," + root.extension;
    return bg.oex.tabs.create({
      url: data,
      focused: true
    });
  };

  fixScript = function(script, isGreaseMonkey) {
    var ast, meta, pro;
    pro = uglify.uglify;
    meta = getMetadata(script)[0];
    ast = uglify.parser.parse(script);
    root.ast = ast;
    ast = fixGlobals(ast);
    ast = removeClosure(ast);
    root.ast = ast;
    if (isGreaseMonkey) ast = wrapWithLoadedEvent(ast);
    return meta + '\n\n' + uglify.uglify.gen_code(ast, {
      beautify: true
    });
  };

  root.fixGlobals = function(ast) {
    var MAP, ast_add_scope, is_global, scope, w, walk, windowDot, with_scope, _lambda, _vardefs;
    w = uglify.uglify.ast_walker();
    MAP = uglify.uglify.MAP;
    ast_add_scope = uglify.uglify.ast_add_scope;
    walk = w.walk;
    scope = null;
    windowDot = function(name) {
      return ['dot', ['name', 'window'], name];
    };
    is_global = function(name) {
      var currentScope;
      if (scope.uses_with || scope.uses_eval) return false;
      if (name === 'this' || name === 'arguments' || name === 'null' || name === 'true' || name === 'false' || name === 'undefined' || name === 'window' || name === 'document' || name === 'Function' || name === 'Object' || name === 'Array' || name === 'String' || name === 'Number' || name === 'Math') {
        return false;
      }
      currentScope = scope;
      while (currentScope.parent != null) {
        if (name in currentScope.names) return false;
        currentScope = currentScope.parent;
      }
      return true;
    };
    _lambda = function(name, args, body) {
      body = with_scope(body.scope, function() {
        return MAP(body, walk);
      });
      if (name && this[0] === 'defun' && !(scope.parent != null)) {
        return ['stat', ['assign', true, windowDot(name), ['function', null, args, body]]];
      } else {
        return [this[0], name, args, body];
      }
    };
    _vardefs = function(defs) {
      if (!(scope.parent != null)) {
        return [
          'splice', MAP(defs, function(d) {
            var value, _ref;
            value = (_ref = walk(d[1])) != null ? _ref : ['name', 'undefined'];
            return ['stat', ['assign', true, windowDot(d[0]), value]];
          })
        ];
      } else {
        return [
          this[0], MAP(defs, function(d) {
            return [d[0], walk(d[1])];
          })
        ];
      }
    };
    with_scope = function(s, cont) {
      var ret, _scope;
      _scope = scope;
      scope = s;
      ret = cont();
      ret.scope = s;
      scope = _scope;
      return ret;
    };
    return w.with_walkers({
      'function': _lambda,
      'defun': _lambda,
      'var': _vardefs,
      'name': function(name) {
        if (is_global(name)) {
          return windowDot(name);
        } else {
          return [this[0], name];
        }
      },
      'toplevel': function(body) {
        var self;
        self = this;
        return with_scope(self.scope, function() {
          return [self[0], MAP(body, walk)];
        });
      }
    }, function() {
      return walk(ast_add_scope(ast));
    });
  };

  root.removeClosure = function(ast) {
    var w, walk;
    w = uglify.uglify.ast_walker();
    walk = w.walk;
    return w.with_walkers({
      'toplevel': function(body) {
        var args, call, func, newstats, stat, _i, _len;
        newstats = [];
        for (_i = 0, _len = body.length; _i < _len; _i++) {
          stat = body[_i];
          if (stat[0] === 'stat' && stat[1][0] === 'call') {
            call = stat[1];
            if (call[1][0] === 'function') {
              func = call[1];
              args = call[2];
              if (func[1] === null && areArgsEqual(func[2], args)) {
                newstats = newstats.concat(func[3]);
                continue;
              }
            }
          }
          newstats.push(stat);
        }
        return [this[0], newstats];
      }
    }, function() {
      return walk(ast);
    });
  };

  root.wrapWithLoadedEvent = function(ast) {
    var body;
    body = ast[1];
    return ['toplevel', [['stat', ['call', ['dot', ['name', 'window'], 'addEventListener'], [['string', 'DOMContentLoaded'], ['function', null, [], body], ['name', 'false']]]]]];
  };

  getMetadata = function(script) {
    var metadata;
    metadata = script.match(/\/\/\s*==\s*userscript\s*==([\s\S]+?)\/\/\s*==\s*\/\s*userscript\s*==/i);
    if (metadata) {
      return metadata;
    } else {
      return ['', null];
    }
  };

  getConfig = function(script, url) {
    var author, data, description, line, metadata, metapart, name, namespace, tag, urlParts, version, _i, _len, _ref, _ref1;
    urlParts = parseURL(url);
    metadata = getMetadata(script)[1];
    if (metadata != null) {
      _ref = metadata.split(/\n/);
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        line = _ref[_i];
        metapart = line.match(/@(\w+)\s+(.+)/);
        if (metapart) {
          _ref1 = metapart.slice(1), tag = _ref1[0], data = _ref1[1];
          switch (tag) {
            case 'name':
              name = data;
              break;
            case 'namespace':
              namespace = data;
              break;
            case 'description':
              description = data;
              break;
            case 'author':
              author = data;
              break;
            case 'version':
              version = data;
          }
        }
      }
    }
    if (!(name != null)) name = url.split('/').pop().replace(/(\.user)?\.js/, '');
    if (!(version != null)) version = '1.0';
    if (!(description != null)) description = "User JavaScript: " + url;
    if (!(namespace != null)) {
      namespace = "" + urlParts.protocol + "://" + urlParts.domain;
    }
    if (!(author != null)) author = urlParts.domain;
    return {
      name: name,
      version: version,
      description: description,
      namespace: namespace,
      author: author,
      greasemonkey: url.indexOf('.user.js') >= 0
    };
  };

  getConfigXml = function(config) {
    var href;
    if (config.namespace.indexOf('://') >= 0) {
      href = " href=\"" + (config.namespace.encodeHTML()) + "\"";
    } else {
      href = '';
    }
    return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<widget xmlns=\"http://www.w3.org/ns/widgets\" version=\"" + (config.version.encodeHTML()) + "\" id=\"extensions:" + (config.name.encodeHTML()) + "\">\n	<name>" + (config.name.encodeHTML()) + "</name>\n	<description>" + (config.description.encodeHTML()) + "</description>\n	<author" + href + ">" + (config.author.encodeHTML()) + "</author>\n</widget>";
  };

  parseURL = function(url) {
    var domain, hash, path, protocol, query, sep, _ref, _ref1, _ref2, _ref3;
    _ref = url.partition('://'), protocol = _ref[0], sep = _ref[1], path = _ref[2];
    _ref1 = path.partition('/'), domain = _ref1[0], sep = _ref1[1], path = _ref1[2];
    _ref2 = path.partition('?'), path = _ref2[0], sep = _ref2[1], query = _ref2[2];
    _ref3 = query.partition('#'), query = _ref3[0], sep = _ref3[1], hash = _ref3[2];
    return {
      protocol: protocol,
      domain: domain,
      path: path,
      query: query,
      hash: hash
    };
  };

  String.prototype.partition = function(sep) {
    var index;
    index = this.indexOf(sep);
    if (index !== -1) {
      return [this.substr(0, index), sep, this.substr(index + sep.length)];
    } else {
      return [this, '', ''];
    }
  };

  String.prototype.encodeHTML = function() {
    return this.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  };

  areArgsEqual = function(a, b) {
    var elem, i, _i, _len;
    if (a.length !== b.length) return false;
    for (i = _i = 0, _len = a.length; _i < _len; i = ++_i) {
      elem = a[i];
      if (elem !== b[i]) return false;
    }
    return true;
  };

}).call(this);
