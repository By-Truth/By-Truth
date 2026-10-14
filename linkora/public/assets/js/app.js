// Linkora — small progressive enhancements. Everything works without JS.
(function () {
    'use strict';

    function toast(message) {
        var el = document.querySelector('.toast');
        if (!el) {
            el = document.createElement('div');
            el.className = 'toast';
            el.setAttribute('role', 'status');
            document.body.appendChild(el);
        }
        el.textContent = message;
        el.classList.add('show');
        clearTimeout(el._t);
        el._t = setTimeout(function () { el.classList.remove('show'); }, 1800);
    }

    function copyText(text) {
        if (navigator.clipboard && window.isSecureContext) {
            return navigator.clipboard.writeText(text);
        }
        var t = document.createElement('textarea');
        t.value = text;
        t.style.position = 'fixed';
        t.style.opacity = '0';
        document.body.appendChild(t);
        t.select();
        try { document.execCommand('copy'); } finally { document.body.removeChild(t); }
        return Promise.resolve();
    }

    // Copy-link buttons
    document.querySelectorAll('[data-copy]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            copyText(btn.getAttribute('data-copy')).then(function () {
                var label = btn.querySelector('span');
                var original = label ? label.textContent : '';
                if (label) label.textContent = 'Copied!';
                toast('Link copied to clipboard');
                setTimeout(function () { if (label) label.textContent = original; }, 1600);
            });
        });
    });

    // Confirm destructive actions
    document.querySelectorAll('form[data-confirm]').forEach(function (form) {
        form.addEventListener('submit', function (e) {
            if (!window.confirm(form.getAttribute('data-confirm'))) e.preventDefault();
        });
    });

    // Show "Save" only after a link has been edited
    document.querySelectorAll('.link-edit').forEach(function (form) {
        form.addEventListener('input', function () { form.classList.add('is-dirty'); });
    });

    // Upload avatar as soon as a file is picked
    document.querySelectorAll('[data-autosubmit]').forEach(function (input) {
        input.addEventListener('change', function () { if (input.files.length) input.form.submit(); });
    });

    // Bio character counter
    document.querySelectorAll('[data-counter]').forEach(function (area) {
        var out = area.parentNode.querySelector('[data-count]');
        area.addEventListener('input', function () { if (out) out.textContent = area.value.length; });
    });
})();
