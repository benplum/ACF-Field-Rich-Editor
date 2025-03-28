
(function($) {

  var Field = acf.Field.extend({

		type: 'rich_editor',

    $input: function() {
      return this.$('textarea');
    },

    initialize: function() {
      let $textarea = this.$input();

      let options = $.extend(true, {
        btnsDef: {
          formats: {
            dropdown: ['p', 'h2', 'h3', 'h4', 'h5', 'h6'],
            title: 'Formatting',
            ico: 'p',
            hasIcon: true,
          },
        },
        // btns: [
        //   ['formats'],
        //   ['strong', 'em', 'wplink', 'unorderedList', 'orderedList'],
        //   ['viewHTML'],
        // ],
        // tagClasses: {
        //   h1: 'headline-1',
        //   h2: 'headline-2',
        //   h3: 'headline-3',
        //   h4: 'headline-4',
        //   h5: 'headline-5',
        //   h6: 'headline-6',
        // },
        autogrow: true,
        removeformatPasted: true,
        // resetCss: true,
        tagsToRemove: ['script', 'link'],
      }, $textarea.data('rich-editor-options'));

      this.$editor = $textarea.trumbowyg(options);
    },

  });

  acf.registerFieldType( Field );

})(jQuery);



(function ($) {
  'use strict';

  let defaultOptions = {};

  let activeTrumbowyg;
  let activeValue;

  function getLinkValue() {
    return {
      text:	$('#wp-link-text').val(),
      url:	$('#wp-link-url').val(),
      target:	$('#wp-link-target').prop('checked') ? '_blank' : ''
    };
  }

  function onOpen() {
    if (!activeValue) {
      return;
    }

    $('#wp-link-text').val( activeValue.text );
    $('#wp-link-url').val( activeValue.url );
    $('#wp-link-target').prop('checked', activeValue.target === '_blank' );
  }

  function onClose() {
    console.log(arguments);
    if (!activeTrumbowyg) {
      return;
    }

    let val = getLinkValue();

    let url = activeTrumbowyg.prependUrlPrefix(val.url);

    if (!url.length) {
      return false;
    }

    let link = $(['<a href="', url, '">', val.text || val.url, '</a>'].join(''));
    let linkDefaultTarget = activeTrumbowyg.o.linkTargets[0];

    if (val.target || linkDefaultTarget) {
      link.attr('target', val.target || linkDefaultTarget);
    }

    activeTrumbowyg.range.deleteContents();
    activeTrumbowyg.range.insertNode(link[0]);
    activeTrumbowyg.syncCode();
    activeTrumbowyg.$c.trigger('tbwchange');

    activeTrumbowyg = null;
    activeValue = null;

    $(document).off('wplink-open', onOpen);
    $(document).off('wplink-close', onClose);
  }

  function onCreateLink() {
    activeTrumbowyg = this;

    $(document).on('wplink-open', onOpen);
    $(document).on('wplink-close', onClose);

    let $textarea = $('<textarea id="acf-wplink-textarea" style="display:none;"></textarea>');
    $('body').append($textarea);

    let documentSelection = activeTrumbowyg.doc.getSelection();
    let selectedRange = documentSelection.getRangeAt(0);
    let node = documentSelection.focusNode;
    let text = new XMLSerializer().serializeToString(selectedRange.cloneContents()) || selectedRange + '';
    let url;
    let target;
    let linkDefaultTarget = activeTrumbowyg.o.linkTargets[0];

    while (['A', 'DIV'].indexOf(node.nodeName) < 0) {
      node = node.parentNode;
    }

    if (node && node.nodeName === 'A') {
      let $a = $(node);

      text = $a.text();
      url = $a.attr('href');

      if (!activeTrumbowyg.o.minimalLinks) {
        target = $a.attr('target') || linkDefaultTarget;
      }

      let range = activeTrumbowyg.doc.createRange();
      range.selectNode(node);
      documentSelection.removeAllRanges();
      documentSelection.addRange(range);
    }

    activeTrumbowyg.saveRange();

    activeValue = {
      text: text || '',
      url: url || '',
      target: target || '',
    };

    wpLink.open( 'acf-wplink-textarea', activeValue.url, activeValue.text, null);
  }

  function onRemoveLink() {
    activeTrumbowyg = this;

    let documentSelection = activeTrumbowyg.doc.getSelection();
    let node = documentSelection.focusNode;

    while (['A', 'DIV'].indexOf(node.nodeName) < 0) {
      node = node.parentNode;
    }

    if (node && node.nodeName === 'A') {
      let $a = $(node);
      let text = $a.text();

      $a.replaceWith(text);
    }
  }

  $.extend(true, $.trumbowyg, {
    langs: {
        en: {
            myplugin: 'WP Link'
        }
    },
    plugins: {
      wplink: {
        init: function (trumbowyg) {
          trumbowyg.o.plugins.wplink = $.extend(true, {},
            defaultOptions,
            trumbowyg.o.plugins.wplink || {}
          );

          trumbowyg.addBtnDef('wpcreatelink', {
            title: 'Link',
            ico: 'create-link',
            hasIcon: true,
            fn: function() {
              onCreateLink.call(trumbowyg, arguments);
            }
          });

          trumbowyg.addBtnDef('wpremovelink', {
            title: 'Unlink',
            ico: 'unlink',
            hasIcon: true,
            fn: function() {
              onRemoveLink.call(trumbowyg, arguments);
            }
          });

          trumbowyg.addBtnDef('wplink', {
            title: 'WP Link',
            ico: 'link',
            hasIcon: true,
            dropdown: ['wpcreatelink', 'wpremovelink']
          });
        },
        tagHandler: function (el, trumbowyg) {
          return (el.tagName == 'A') ? ['wplink'] : [];
        },
        destroy: function (trumbowyg) {
        },
      }
    }
  });
})(jQuery);