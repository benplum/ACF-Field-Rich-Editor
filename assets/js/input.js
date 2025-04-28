(function($) {

  var Field = acf.Field.extend({

    type: 'rich_editor',

    actions: {
      'show_field/type=rich_editor': 'onShowField',
    },

    events: {
      'duplicateField': 'onDuplicate',
    },

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

    onShowField: function() {
      this.$editor.trumbowyg('enable');
    },

    onDuplicate: function(e, $el, $dupe) {
      let $textarea = $dupe.find('textarea');
      let $trumbowyg = $dupe.find('.trumbowyg');

      $trumbowyg.before($textarea);
      $trumbowyg.remove();

      // $dupe.find('textarea').trumbowyg('destroy');
    }

  });

  acf.registerFieldType( Field );

})(jQuery);

// WP Link

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
          return (el.tagName == 'A') ? ['wplink', 'wpcreatelink', 'wpremovelink'] : [];
        },
        destroy: function (trumbowyg) {
        },
      }
    }
  });
})(jQuery);

// Style Select

(function ($) {
  'use strict';

  let defaultOptions = {};
  let styleOptions = {};
  let activeTrumbowyg;

  function onSelectStyle(style) {
    activeTrumbowyg = this;

    let documentSelection = activeTrumbowyg.doc.getSelection();
    let node = documentSelection.focusNode;

    let activeStyle = styleOptions[style];

    if (!activeStyle) {
      return;
    }

    while (['H1', 'H2', 'H3', 'H4', 'H5', 'H7', 'P', 'A', 'DIV'].indexOf(node.nodeName) < 0) {
      node = node.parentNode;
    }

    if (activeStyle.targets.indexOf(node.nodeName) < 0) {
      return;
    }

    if (node) {
      let $el = $(node);

      if ($el.hasClass(style)) {
        $el.removeClass(style);
      } else {
        $el.addClass(style);
      }
    }

    activeTrumbowyg.saveRange();
  }

  function buildButtonIcon() {
    if ($('#trumbowyg-styleselect').length > 0) {
      return;
    }

    let iconWrap = $(document.createElementNS('http://www.w3.org/2000/svg', 'svg'));
    iconWrap.addClass('trumbowyg-icons');

    iconWrap.html(`
      <symbol id="trumbowyg-styleselect" viewBox="0 0 24 24">
        <path d="M19.5559395,0.768797513 L19.497568,0.710426032 C19.0361219,0.247618598 18.4082967,-0.0107209301 17.7547624,-0.00679673342 C17.1033774,-0.012257733 16.477567,0.246490788 16.0202955,0.710426032 L7.64648962,9.08256416 C7.47038706,9.25982039 7.32145842,9.46213854 7.20453412,9.68295653 C5.95854752,9.79504725 4.77139888,10.2644053 3.78563309,11.0346733 C3.62636234,11.1547517 3.4854369,11.2981788 3.36869394,11.4599512 C2.9994637,11.9510124 2.72256326,12.5050958 2.55149321,13.0951865 C2.34302363,13.6705626 2.05950501,14.455242 1.53416168,15.5968214 C1.1839328,16.3556507 0.908752957,16.8818279 0.716960948,17.2487343 C0.441395271,17.6504448 0.285269426,18.1220027 0.266666667,18.6087899 C0.278340963,18.7805688 0.333376931,18.9473444 0.425103544,19.0924393 C0.858666564,19.6797887 1.5552023,20.0140009 2.28465215,19.984689 C4.85673188,20.0977486 7.34741288,19.0689426 9.08993295,17.1736853 C9.40513895,16.8067788 9.66697674,16.3965107 9.86543977,15.9553891 C10.2607088,15.0747526 10.4571547,14.1178622 10.4408158,13.1527241 C10.4445783,13.1407947 10.4502073,13.1295367 10.4574934,13.119369 C10.7285038,12.9992905 10.9744979,12.8300132 11.1829675,12.619042 L19.5559395,4.24607002 C20.0195045,3.78889178 20.2782059,3.16349628 20.2731497,2.51243704 C20.2772166,1.85863234 20.0188743,1.23049995 19.5559395,0.768797513 Z M8.34861514,15.2674395 C8.20685583,15.5743067 8.02507036,15.860327 7.80659425,16.1179954 C6.32750583,17.6874044 4.20749043,18.4872941 2.06033889,18.2860789 C2.1020328,18.2026911 2.1520655,18.1109645 2.2020982,18.0192379 C2.40222899,17.6356539 2.68574761,17.093633 3.05265407,16.3006147 C3.44642472,15.4406779 3.80255033,14.5639968 4.12001829,13.6730642 C4.23676125,13.26363 4.41604508,12.8750427 4.6537004,12.5214783 C4.70540085,12.454768 4.76460621,12.393061 4.82881484,12.338025 C5.44749272,11.8283759 6.19486112,11.4994183 6.98855964,11.3874038 C7.08945891,11.8351964 7.31877544,12.2437968 7.64732349,12.5640061 L7.70569498,12.6223775 C7.99755238,12.9200721 8.36279108,13.1360466 8.76472042,13.2477863 C8.77785607,13.9435635 8.63570622,14.6335174 8.34861514,15.2674395 L8.34861514,15.2674395 Z M18.3801711,3.0711355 L9.99802642,11.4466091 C9.85021658,11.5955836 9.64918716,11.6795959 9.43932796,11.6800951 C9.23012083,11.6764264 9.03023643,11.5928926 8.8806295,11.4466091 L8.82225802,11.3882377 C8.51391683,11.0795862 8.51391683,10.5794922 8.82225802,10.2708407 L17.19523,1.88702831 C17.3453281,1.74276737 17.5454589,1.66188117 17.7547624,1.66098487 C17.9636015,1.65840905 18.1648042,1.73949072 18.3134608,1.88619443 L18.3801711,1.9529047 C18.6803673,2.26477518 18.6803673,2.75926501 18.3801711,3.0711355 Z" fill="#222222"/>
      </symbol>
    `).appendTo(document.body);
  }

  $.extend(true, $.trumbowyg, {
    langs: {
      en: {
        myplugin: 'Style Select'
      }
    },
    plugins: {
      styleselect: {
        init: function (trumbowyg) {
          trumbowyg.o.plugins.styleselect = $.extend(true, {},
            defaultOptions,
            trumbowyg.o.plugins.styleselect || {}
          );

          buildButtonIcon();

          styleOptions = $.extend(true, styleOptions, trumbowyg.o.styleOptions);

          let styleOptionItems = Object.entries(styleOptions);

          if (styleOptionItems.length > 0) {
            let styleButtons = [];

            for (let [key, value] of styleOptionItems) {
              trumbowyg.addBtnDef(key, {
                title: value.label,
                // ico: '',
                hasIcon: false,
                fn: function(k) {
                  onSelectStyle.call(trumbowyg, k);
                }
              });

              styleButtons.push(key);
            }

            // Dropdown handle
            trumbowyg.addBtnDef('styleselect', {
              title: 'Style',
              ico: 'styleselect',
              hasIcon: true,
              dropdown: styleButtons
            });
          }
        },
        tagHandler: function (el, trumbowyg) {
          // return (el.tagName == 'A') ? ['wplink'] : [];
          return [];
        },
        destroy: function (trumbowyg) {
        },
      }
    }
  });
})(jQuery);