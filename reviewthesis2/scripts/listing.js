/* Script necessary to activate clipboard and tooltip functions*/
// Tooltip
function setTooltip(message,elem) {
    elem.tooltip('hide')
    .attr('data-original-title', message)
    .tooltip('show');
}
function hideTooltip(elem,time=1000) {
  setTimeout(function() {
    elem.tooltip('hide');
  }, time);
}

$('.clipboard').tooltip({
  trigger: 'click',
  placement: 'bottom'
});

function rudr_favorite(a) {
	pageTitle=document.title;
	pageURL=document.location;
	try {
		// Internet Explorer solution
		eval("window.external.AddFa-vorite(pageURL, pageTitle)".replace(/-/g,''));
	}
	catch (e) {
		try {
			// Mozilla Firefox solution
			window.sidebar.addPanel(pageTitle, pageURL, "");
		}
		catch (e) {
			// Opera solution
			if (typeof(opera)=="object") {
				a.rel="sidebar";
				a.title=pageTitle;
				a.url=pageURL;
				return true;
			} else {
				// The rest browsers (i.e Chrome, Safari)
				alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != -1 ? 'Cmd' : 'Ctrl') + '+D to bookmark this page.');
			}
		}
	}
	return false;
}

// Clipboard
var clipboard = new ClipboardJS('.clipboard');
clipboard.on('success', function(e) {
  setTooltip('Copied!',$('.clipboard'));
  hideTooltip($('.clipboard'));
});
clipboard.on('error', function(e) {
  setTooltip('Failed!',$('.clipboard'));
  hideTooltip($('.clipboard'));
});
