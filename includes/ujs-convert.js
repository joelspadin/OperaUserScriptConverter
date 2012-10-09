// ==UserScript==
// @include			*.js
// ==/UserScript==

window.opera.addEventListener('AfterEvent.DOMContentLoaded', function() {

	if (!document.querySelector('body pre'))
		return;

	var animTime = 0.6;

	var bar = document.createElement('div');
	var install = document.createElement('button');
	var cancel = document.createElement('button');
	var code = document.querySelector('body pre');

	(function() {
		var icon = document.createElement('img');
		var text = document.createElement('span');
		var buttons = document.createElement('div');

		bar.style.position = 'absolute';
		bar.style.top = '0';
		bar.style.left = '0';
		bar.style.right = '0';
		bar.style.height = '29px';
		bar.style.padding = '0 8px';
		bar.style.overflow = 'hidden';

		bar.style.color = '#555';
		bar.style.backgroundImage = "-o-skin('Infobar Toolbar Skin')";
		bar.style.font = '14px/20px "Segoe UI", "Helvetica", "Helvetica Neue", arial, sans-serif';

		bar.style.OTransition = bar.style.transition = 'top ' + animTime + 's';

		code.style.position = 'absolute';
		code.style.top = '30px';
		code.style.left = '0';
		code.style.right = '0';
		code.style.bottom = '0';
		code.style.padding = '8px';
		code.style.overflow = 'auto';

		code.style.OTransition = code.style.transition = 'top ' + animTime + 's';

		icon.style.height = '18px';
		icon.style.width = '18px';
		icon.style.margin = '5px 6px 0 0';
		icon.style.backgroundImage = "-o-skin('Extension icon')";

		text.textContent = 'Would you like to install this script as an extension?';
		text.style.position = 'absolute';
		text.style.top = '4px';

		buttons.style.position = 'absolute';
		buttons.style.top = '3px';
		buttons.style.right = '8px';

		install.textContent = 'Install';
		install.addEventListener('click', pack, false);

		cancel.textContent = 'Cancel';
		cancel.style.marginLeft = '8px';
		cancel.addEventListener('click', removeBar, false);

		install.style.border = cancel.style.border = 'none';
		install.style.padding = cancel.style.padding = '1px 10px';
		install.style.background = cancel.style.background = "-o-skin('Infobar Button Skin')";

		buttons.appendChild(install);
		buttons.appendChild(cancel);
		bar.appendChild(icon);
		bar.appendChild(text);
		bar.appendChild(buttons);

		document.body.insertBefore(bar, code);
	})();

	function pack() {
		opera.extension.postMessage({
			action: "package",
			script: window.location.href,
		});

		removeBar();
	}

	function removeBar() {
		install.removeEventListener('click', pack, false);
		cancel.removeEventListener('click', removeBar, false);

		bar.style.top = '-30px';
		code.style.top = '0px';
		setTimeout(function() {
			document.body.removeChild(bar);
		}, animTime * 1000);
	}

}, false);