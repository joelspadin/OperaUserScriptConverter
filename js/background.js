(function() {
  var messageHandlers, root;

  root = this;

  root.oex = opera.extension;

  oex.onmessage = function(e) {
    if (e.data.action in messageHandlers) {
      return messageHandlers[e.data.action](e);
    } else {
      return console.log("UJS Packager: Unknown action \"" + e.data.action + "\"");
    }
  };

  messageHandlers = {
    'package': function(e) {
      return oex.tabs.create({
        url: "options.html#" + e.data.script,
        focused: true
      });
    }
  };

  root.get = function(url, callback) {
    var xhr;
    xhr = new XMLHttpRequest;
    xhr.open('get', url, true);
    xhr.responseType = 'text';
    xhr.onload = function(e) {
      if (this.status === 200 || this.status === 0) {
        return callback(true, this.responseText);
      } else {
        return callback(false, this);
      }
    };
    return xhr.send();
  };

  root.file = function(path, callback) {
    return root.get(path, function(success, file) {
      if (success) {
        return typeof callback === "function" ? callback(file) : void 0;
      } else {
        console.log("UJS Packager: Could not load file \"" + path + "\"");
        return typeof callback === "function" ? callback('') : void 0;
      }
    });
  };

}).call(this);
