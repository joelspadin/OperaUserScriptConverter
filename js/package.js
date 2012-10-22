(function() {
  var addDirectoryToZip, areArgsEqual, base64ArrayBuffer, buildExtension, fixScript, getConfig, getConfigXml, getMetadata, hideInstallButton, iced, installExtension, isEmpty, parseURL, readFile, replacePreferences, root, showError, showInstallButton, __iced_k, __iced_k_noop,
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

  root.incrementVersion = false;

  root.currentVersion = JSON.parse(sessionStorage['version'] || '0');

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
    document.querySelector('#install').addEventListener('click', installExtension);
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
        lineno: 29
      }));
      __iced_deferrals._fulfill();
    })(function() {
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
            lineno: 40
          })));
          __iced_deferrals._fulfill();
        })(function() {
          root.script = script;
          if (!success) {
            console.log("UJS Packager: Failed to download " + url);
            return;
          }
          config = getConfig(script, url);
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral
            });
            buildExtension(script, config, __iced_deferrals.defer({
              assign_fn: (function(__slot_1) {
                return function() {
                  return __slot_1.extension = arguments[0];
                };
              })(root),
              lineno: 49
            }));
            __iced_deferrals._fulfill();
          })(function() {
            document.querySelector('#done').style.display = 'inline';
            return __iced_k(typeof extension !== "undefined" && extension !== null ? showInstallButton(config.name) : document.querySelector('#done').textContent = 'failed.');
          });
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
            var _i, _len, _ref, _ref1, _ref2, _results;
            _ref2 = (_ref = (_ref1 = e.dataTransfer) != null ? _ref1.files : void 0) != null ? _ref : e.target.files;
            _results = [];
            for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
              file = _ref2[_i];
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
                    lineno: 72
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
            root.scripts = scripts;
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral1,
                funcname: "handleFileSelect"
              });
              buildExtension(scripts, configs, __iced_deferrals.defer({
                assign_fn: (function(__slot_1) {
                  return function() {
                    return __slot_1.extension = arguments[0];
                  };
                })(root),
                lineno: 78
              }));
              __iced_deferrals._fulfill();
            })(function() {
              if (typeof extension !== "undefined" && extension !== null) {
                return showInstallButton(configs[0].name);
              }
            });
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

  showError = function(msg) {
    var p;
    p = document.createElement('p');
    p.textContent = msg;
    p.className = 'error';
    return document.querySelector('#generated-script').appendChild(p);
  };

  readFile = function(file, callback) {
    var reader;
    reader = new FileReader;
    reader.onload = function(e) {
      return callback(e.target.result);
    };
    return reader.readAsText(file);
  };

  buildExtension = function(scripts, configs, callback) {
    var i, icon, li, name, output, pre, prefDefs, s, scriptPrefs, text, type, ul, value, zip, ___iced_passed_deferral, __iced_deferrals, __iced_k, _i, _j, _k, _len, _len1, _len2, _ref, _ref1, _ref2, _ref3,
      _this = this;
    __iced_k = __iced_k_noop;
    ___iced_passed_deferral = iced.findDeferral(arguments);
    output = document.querySelector('#generated-script');
    output.innerHTML = '';
    if (!(scripts != null) || scripts.length === 0) {
      showError('Error: None of the given files were scripts.');
      return;
    }
    if (!Array.isArray(scripts)) scripts = [scripts];
    if (!Array.isArray(configs)) configs = [configs];
    root.prefs = [];
    for (i = _i = 0, _len = scripts.length; _i < _len; i = ++_i) {
      s = scripts[i];
      _ref = replacePreferences(s), s = _ref[0], prefs[i] = _ref[1];
      scripts[i] = fixScript(s, configs[i].greasemonkey);
      if (i > 0) output.appendChild(document.createElement('br'));
      if (prefs[i].length > 0) {
        ul = document.createElement('ul');
        ul.style.display = 'none';
        _ref1 = prefs[i];
        for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
          _ref2 = _ref1[_j], name = _ref2[0], value = _ref2[1], text = _ref2[2], type = _ref2[3];
          li = document.createElement('li');
          li.textContent = "" + name + " (" + type + ")";
          ul.appendChild(li);
        }
        output.appendChild(ul);
      }
      pre = document.createElement('pre');
      pre.textContent = (_ref3 = scripts[i]) != null ? _ref3 : '// Failed to generate script. Original code:\n\n' + s;
      sh_highlightElement(pre, sh_languages.javascript);
      output.appendChild(pre);
    }
    scripts = scripts.filter(function(x) {
      return x != null;
    });
    if (scripts.length === 0) if (typeof callback === "function") callback(null);
    zip = new JSZip;
    root.files = {
      'config.xml': getConfigXml(configs[0]),
      css: {},
      js: {},
      img: {},
      includes: {}
    };
    for (i = _k = 0, _len2 = scripts.length; _k < _len2; i = ++_k) {
      s = scripts[i];
      files.includes["" + configs[i].name + ".js"] = s;
    }
    (function(__iced_k) {
      if (configs[0].icon != null) {
        (function(__iced_k) {
          __iced_deferrals = new iced.Deferrals(__iced_k, {
            parent: ___iced_passed_deferral,
            funcname: "buildExtension"
          });
          bg.getImage(configs[0].icon, __iced_deferrals.defer({
            assign_fn: (function() {
              return function() {
                return icon = arguments[0];
              };
            })(),
            lineno: 183
          }));
          __iced_deferrals._fulfill();
        })(function() {
          return __iced_k(typeof icon !== "undefined" && icon !== null ? files.img['icon.png'] = 'data:image/png,base64;' + base64ArrayBuffer(icon) : (showError("Failed to download image \"" + configs[0].icon + "\""), console.log("UJS Packager: Failed to download image \"" + configs[0].icon + "\"")));
        });
      } else {
        return __iced_k();
      }
    })(function() {
      (function(__iced_k) {
        if (prefs.reduce((function(prev, curr) {
          return !!prev || curr.length > 0;
        }), false)) {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              funcname: "buildExtension"
            });
            bg.file('/package/index-prefs.html', __iced_deferrals.defer({
              assign_fn: (function(__slot_1, __slot_2) {
                return function() {
                  return __slot_1[__slot_2] = arguments[0];
                };
              })(files, 'index.html'),
              lineno: 192
            }));
            __iced_deferrals._fulfill();
          })(function() {
            (function(__iced_k) {
              __iced_deferrals = new iced.Deferrals(__iced_k, {
                parent: ___iced_passed_deferral,
                funcname: "buildExtension"
              });
              bg.file('/package/options.html', __iced_deferrals.defer({
                assign_fn: (function(__slot_1, __slot_2) {
                  return function() {
                    return __slot_1[__slot_2] = arguments[0];
                  };
                })(files, 'options.html'),
                lineno: 193
              }));
              __iced_deferrals._fulfill();
            })(function() {
              (function(__iced_k) {
                __iced_deferrals = new iced.Deferrals(__iced_k, {
                  parent: ___iced_passed_deferral,
                  funcname: "buildExtension"
                });
                bg.file('/package/css/options.css', __iced_deferrals.defer({
                  assign_fn: (function(__slot_1, __slot_2) {
                    return function() {
                      return __slot_1[__slot_2] = arguments[0];
                    };
                  })(files.css, 'options.css'),
                  lineno: 194
                }));
                __iced_deferrals._fulfill();
              })(function() {
                (function(__iced_k) {
                  __iced_deferrals = new iced.Deferrals(__iced_k, {
                    parent: ___iced_passed_deferral,
                    funcname: "buildExtension"
                  });
                  bg.file('/package/js/options.js', __iced_deferrals.defer({
                    assign_fn: (function(__slot_1, __slot_2) {
                      return function() {
                        return __slot_1[__slot_2] = arguments[0];
                      };
                    })(files.js, 'options.js'),
                    lineno: 195
                  }));
                  __iced_deferrals._fulfill();
                })(function() {
                  (function(__iced_k) {
                    __iced_deferrals = new iced.Deferrals(__iced_k, {
                      parent: ___iced_passed_deferral,
                      funcname: "buildExtension"
                    });
                    bg.file('/package/js/options_page.js', __iced_deferrals.defer({
                      assign_fn: (function(__slot_1, __slot_2) {
                        return function() {
                          return __slot_1[__slot_2] = arguments[0];
                        };
                      })(files.js, 'options_page.js'),
                      lineno: 196
                    }));
                    __iced_deferrals._fulfill();
                  })(function() {
                    (function(__iced_k) {
                      __iced_deferrals = new iced.Deferrals(__iced_k, {
                        parent: ___iced_passed_deferral,
                        funcname: "buildExtension"
                      });
                      bg.file('/package/js/storage.js', __iced_deferrals.defer({
                        assign_fn: (function(__slot_1, __slot_2) {
                          return function() {
                            return __slot_1[__slot_2] = arguments[0];
                          };
                        })(files.js, 'storage.js'),
                        lineno: 199
                      }));
                      __iced_deferrals._fulfill();
                    })(function() {
                      prefDefs = (function() {
                        var _l, _len3, _results;
                        _results = [];
                        for (i = _l = 0, _len3 = prefs.length; _l < _len3; i = ++_l) {
                          scriptPrefs = prefs[i];
                          _results.push((function() {
                            var _len4, _m, _ref4, _results1;
                            _results1 = [];
                            for (_m = 0, _len4 = scriptPrefs.length; _m < _len4; _m++) {
                              _ref4 = scriptPrefs[_m], name = _ref4[0], value = _ref4[1], text = _ref4[2], type = _ref4[3];
                              _results1.push("['" + name + "', " + (JSON.stringify(value)) + ", '" + text + "', '" + type + "']");
                            }
                            return _results1;
                          })());
                        }
                        return _results;
                      })();
                      prefDefs = prefDefs.join(',\n\t');
                      return __iced_k(files.js['default_settings.js'] = "var defaults = [ \n\t" + prefDefs + " \n]; var storage = new SettingStorage(defaults);");
                    });
                  });
                });
              });
            });
          });
        } else {
          (function(__iced_k) {
            __iced_deferrals = new iced.Deferrals(__iced_k, {
              parent: ___iced_passed_deferral,
              funcname: "buildExtension"
            });
            bg.file('/package/index.html', __iced_deferrals.defer({
              assign_fn: (function(__slot_1, __slot_2) {
                return function() {
                  return __slot_1[__slot_2] = arguments[0];
                };
              })(files, 'index.html'),
              lineno: 205
            }));
            __iced_deferrals._fulfill();
          })(__iced_k);
        }
      })(function() {
        addDirectoryToZip(zip, files);
        return typeof callback === "function" ? callback(zip.generate()) : void 0;
      });
    });
  };

  addDirectoryToZip = function(zip, dir) {
    var data, file, folder, name, sep, type, _ref, _results;
    _results = [];
    for (name in dir) {
      file = dir[name];
      if (file != null) {
        if (typeof file === 'string') {
          if (file.indexOf('data:') === 0) {
            _ref = file.partition(';'), type = _ref[0], sep = _ref[1], data = _ref[2];
            _results.push(zip.file(name, data, {
              base64: type.indexOf('base64') > 0
            }));
          } else {
            _results.push(zip.file(name, file));
          }
        } else if (!isEmpty(file)) {
          folder = zip.folder(name);
          _results.push(addDirectoryToZip(folder, file));
        } else {
          _results.push(void 0);
        }
      } else {
        _results.push(void 0);
      }
    }
    return _results;
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
    var ast, meta, msg, pro;
    pro = uglify.uglify;
    try {
      meta = getMetadata(script)[0];
      ast = uglify.parser.parse(script);
      if (isGreaseMonkey) ast = wrapWithLoadedEvent(ast);
      ast = fixGlobals(ast);
      ast = removeClosure(ast);
      root.ast = ast;
    } catch (error) {
      if (error.col != null) {
        msg = "" + error.message + " at line " + error.line + ", position " + error.pos + ".";
        if (error.message === 'Unexpected token: operator (<)' && error.line === 1 && error.pos === 1) {
          msg += ' (This file doesn\'t look like JavaScript.)';
        }
      } else {
        msg = error.message;
      }
      showError(msg);
      return null;
    }
    return meta + '\n\n' + uglify.uglify.gen_code(ast, {
      beautify: true
    });
  };

  replacePreferences = function(script) {
    var pattern, prefs;
    pattern = /(var[\s\n]+|^\s*)(\w+[\w\d])*\s*=\s*.*\/\*\s*@\s*(.+)\s*@\s*(\w+)\s*@\s*\*\/(.+)\/\*\s*@\s*\*\/(.+)/mg;
    prefs = [];
    script = script.replace(pattern, function(match, prefix, name, text, type, value, postfix) {
      if ((type === 'string' || type === 'color') && value[0] !== '"') {
        value = value.replace(/^'|'$/g, '');
        value = "\"" + value + "\"";
      }
      prefs.push([name, JSON.parse(value), text, type]);
      return "" + prefix + name + " = JSON.parse(widget.preferences['" + name + "'])" + postfix;
    });
    return [script, prefs];
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
      if (name === 'this' || name === 'arguments' || name === 'null' || name === 'true' || name === 'false' || name === 'undefined' || name === 'window' || name === 'document' || name === 'widget' || name === 'opera' || name === 'Function' || name === 'Object' || name === 'Array' || name === 'String' || name === 'Number' || name === 'Math') {
        return false;
      }
      currentScope = scope;
      while (currentScope.parent != null) {
        if (name in currentScope.names) return false;
        currentScope = currentScope.parent;
      }
      currentScope = scope;
      while (currentScope != null) {
        if (currentScope.uses_with) return false;
        currentScope = currentScope.parent;
      }
      return true;
    };
    _lambda = function(name, args, body) {
      body = with_scope(body.scope, function() {
        return MAP(body, walk);
      });
      if (name && this[0] === 'defun' && !(scope.parent != null) && !scope.uses_with) {
        return ['stat', ['assign', true, windowDot(name), ['function', null, args, body]]];
      } else {
        return [this[0], name, args, body];
      }
    };
    _vardefs = function(defs) {
      if (!(scope.parent != null) && !scope.uses_with) {
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
    return ['toplevel', [['stat', ['call', ['dot', ['dot', ['name', 'window'], 'opera'], 'addEventListener'], [['string', 'BeforeEvent.DOMContentLoaded'], ['function', null, [], body], ['name', 'false']]]]]];
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
    var author, data, description, icon, line, metadata, metapart, name, namespace, tag, urlParts, version, _i, _len, _ref, _ref1;
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
              break;
            case 'icon':
              icon = data;
          }
        }
      }
    }
    if (!(name != null)) name = url.split('/').pop().replace(/(\.user)?\.js/, '');
    if (!(version != null)) version = '1.0';
    if (root.incrementVersion) {
      version = version + '.' + root.currentVersion;
      root.currentVersion += 1;
      sessionStorage['version'] = root.currentVersion;
    }
    if (!(description != null)) description = "User JavaScript: " + url;
    if (!(namespace != null)) {
      namespace = "" + urlParts.protocol + "://" + urlParts.domain;
    }
    if (!(author != null)) author = urlParts.domain;
    if (!(icon != null)) icon = null;
    return {
      name: name,
      version: version,
      description: description,
      namespace: namespace,
      author: author,
      icon: icon,
      greasemonkey: url.indexOf('.user.js') >= 0
    };
  };

  getConfigXml = function(config) {
    var href, icon;
    if (config.namespace.indexOf('://') >= 0) {
      href = " href=\"" + (config.namespace.encodeHTML()) + "\"";
    } else {
      href = '';
    }
    if (config.icon != null) {
      icon = '<icon src="img/icon.png" />';
    } else {
      icon = '';
    }
    return "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<widget xmlns=\"http://www.w3.org/ns/widgets\" version=\"" + (config.version.encodeHTML()) + "\" id=\"extensions:" + (config.name.encodeHTML()) + "\">\n	<name>" + (config.name.encodeHTML()) + "</name>\n	<description>" + (config.description.encodeHTML()) + "</description>\n	<author" + href + ">" + (config.author.encodeHTML()) + "</author>\n	" + icon + "\n</widget>";
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

  base64ArrayBuffer = function(arrayBuffer) {
    var a, b, base64, byteLength, byteRemainder, bytes, c, chunk, d, encodings, i, mainLength, _i, _ref;
    base64 = '';
    encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    bytes = new Uint8Array(arrayBuffer);
    byteLength = bytes.byteLength;
    byteRemainder = byteLength % 3;
    mainLength = byteLength - byteRemainder;
    for (i = _i = 0, _ref = mainLength; _i <= _ref; i = _i += 3) {
      chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
      a = (chunk & 16515072) >> 18;
      b = (chunk & 258048) >> 12;
      c = (chunk & 4032) >> 6;
      d = chunk & 63;
      base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
    }
    if (byteRemainder === 1) {
      chunk = bytes[mainLength];
      a = (chunk & 252) >> 2;
      b = (chunk & 3) << 4;
      base64 += encodings[a] + encodings[b] + '==';
    } else if (byteRemainder === 2) {
      chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
      a = (chunk & 64512) >> 10;
      b = (chunk & 1008) >> 4;
      c = (chunk & 15) << 2;
      base64 += encodings[a] + encodings[b] + encodings[c] + '=';
    }
    return base64;
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

  isEmpty = function(o) {
    var key;
    if (o.length != null) {
      if (o.length > 0) return false;
      if (o.length === 0) return true;
    }
    for (key in o) {
      return false;
    }
    return true;
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
