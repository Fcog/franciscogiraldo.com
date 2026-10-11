$(document).ready(function() {
	function escapeHtml(text) {
		return $('<div>').text(text).html();
	}

	function getLanguage($code) {
		var match = ($code.attr('class') || '').match(/(?:language|lang)-(\w+)/);
		return match ? match[1] : null;
	}

	function highlightLine(line, lang) {
		if (!line) {
			return '';
		}
		if (!lang || !hljs.getLanguage || !hljs.getLanguage(lang)) {
			return escapeHtml(line);
		}
		try {
			// highlight.js v10+
			var modern = hljs.highlight(line, { language: lang, ignoreIllegals: true });
			if (modern && modern.value) {
				return modern.value;
			}
		} catch (e) {}
		try {
			// highlight.js v9
			var legacy = hljs.highlight(lang, line, true);
			if (legacy && legacy.value) {
				return legacy.value;
			}
		} catch (e) {}
		return escapeHtml(line);
	}

	function copyText(text, $btn) {
		function showCopied() {
			$btn.text('Copied!');
			$btn.addClass('copied');
			setTimeout(function() {
				$btn.text('Copy');
				$btn.removeClass('copied');
			}, 1500);
		}

		if (navigator.clipboard && navigator.clipboard.writeText) {
			navigator.clipboard.writeText(text).then(showCopied);
		} else {
			var $temp = $('<textarea>');
			$('body').append($temp);
			$temp.val(text).select();
			document.execCommand('copy');
			$temp.remove();
			showCopied();
		}
	}

	/* ======= Per-line copy buttons on command blocks ======= */
	$('.blog-post-body pre code').each(function() {
		var $code = $(this);
		var lang = getLanguage($code);
		var raw = $code.text().replace(/\n$/, '');
		var lines = raw.split('\n');

		var html = lines.map(function(line) {
			var trimmed = line.trim();

			if (!trimmed) {
				return '<div class="code-line code-line-empty" aria-hidden="true"></div>';
			}

			var highlighted = highlightLine(line, lang);
			var isCommentOnly = trimmed.charAt(0) === '#';
			var button = isCommentOnly
				? ''
				: '<button type="button" class="code-copy-btn" aria-label="Copy command">Copy</button>';

			return (
				'<div class="code-line">' +
					button +
					'<span class="code-line-text">' + highlighted + '</span>' +
				'</div>'
			);
		}).join('');

		$code.addClass('hljs');
		if (lang) {
			$code.addClass(lang);
		}
		$code.html(html);
	});

	$('.blog-post-body').on('click', '.code-copy-btn', function(e) {
		e.preventDefault();
		var $btn = $(this);
		var text = $btn.closest('.code-line').find('.code-line-text').text();
		copyText(text, $btn);
	});
});
