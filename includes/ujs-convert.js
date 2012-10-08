// ==UserScript==
// @include			*.js
// ==/UserScript==

window.addEventListener('DOMContentLoaded', function() {

	if (!document.querySelector('body > pre'))
		return;

	var animTime = 0.6;

	var bar = document.createElement('div');
	var spacer = document.createElement('div');
	var install = document.createElement('button');
	var cancel = document.createElement('button');

	(function() {
		var icon = document.createElement('img');
		var text = document.createElement('span');
		var buttons = document.createElement('div');

		bar.style.position = 'fixed';
		bar.style.top = '0';
		bar.style.left = '0';
		bar.style.right = '0';
		bar.style.height = '29px';
		bar.style.padding = '0 8px';
		bar.style.overflow = 'hidden';

		bar.style.color = '#555';
		bar.style.backgroundImage = "-o-skin('Infobar Toolbar Skin')";
		bar.style.font = '14px/20px "Segoe UI", "Helvetica", "helvetica neue", arial, sans-serif';

		spacer.style.margin = '-8px -8px 0';
		spacer.style.height = '29px';

		bar.style.OTransition = spacer.style.OTransition = 'height ' + animTime + 's';
		bar.style.transition = spacer.style.transition = 'height ' + animTime + 's';

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

		document.body.insertBefore(spacer, document.body.firstChild);
		document.body.insertBefore(bar, document.body.firstChild);
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

		bar.style.height = '0px';
		spacer.style.height = '0px';
		setTimeout(function() {
			document.body.removeChild(bar);
			document.body.removeChild(spacer);
		}, animTime * 1000);
	}

}, false);