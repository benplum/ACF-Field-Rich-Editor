<?php

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

class acf_field_rich_editor extends acf_field {

  function __construct( $settings ) {
    $this->name = 'rich_editor';

    $this->label = __( 'Rich Editor', 'acf' );

    $this->category = 'content';

    $this->defaults = [
      'toolbar' => 'full',
    ];

    $this->l10n = [];

    $this->settings = $settings;

    $this->supports = array(
      // 'escaping_html' => true,
    );

    parent::__construct();
  }

  function get_toolbars() {
    $toolbars  = [
      'full' => [
        'label' => 'Full',
        'buttons' => [
          ['formats'],
          ['strong', 'em', 'strikethrough'],
          ['wplink'],
          ['superscript', 'subscript'],
          ['justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull'],
          ['unorderedList', 'orderedList'],
          ['viewHTML'],
        ],
      ],
      'simple' => [
        'label' => 'Simple',
        'buttons' => [
          ['formats'],
          ['strong', 'em'],
          ['wplink'],
          ['unorderedList', 'orderedList'],
          ['viewHTML'],
        ],
      ],
      'basic' => [
        'label' => 'Basic',
        'buttons' => [
          ['strong', 'em'],
          ['wplink'],
          ['viewHTML'],
        ],
      ],
    ];

    $toolbars = apply_filters( 'acf/fields/rich_editor/toolbars', $toolbars );

    return $toolbars;
  }

  function render_field_presentation_settings( $field ) {
    $toolbars = $this->get_toolbars();
    $choices  = [];

    if ( ! empty( $toolbars ) ) {
      foreach ( $toolbars as $k => $v ) {
        $label = $v['label'];
        $name  = sanitize_title( $label );
        $name  = str_replace( '-', '_', $name );

        $choices[ $k ] = $label;
      }
    }

    acf_render_field_setting( $field, [
      'label'        => __( 'Toolbar', 'acf' ),
      'instructions' => '',
      'type'         => 'select',
      'name'         => 'toolbar',
      'choices'      => $choices,
      'conditions'   => [
        'field'    => 'tabs',
        'operator' => '!=',
        'value'    => 'text',
      ],
    ]);
  }

  function render_field( $field  ){
    $toolbars = $this->get_toolbars();

    $html = '';

    $check = [ 'id', 'class', 'name', 'placeholder', 'mode', 'theme' ];
    $attributes = [];

    foreach ( $check as $c ) {
      if ( ! empty( $field[ $c ] ) ) {
        $atttributes[ $c ] = $field[ $c ];
      }
    }

    if ( ! empty( $toolbars[ $field['toolbar'] ]['buttons'] ) ) {
      $options = [
        'btns' => $toolbars[ $field['toolbar'] ]['buttons'],
      ];
    }

    $value = $field['value'];

    $html .= '<div class="acf_rich_editor">';

    $html .= '<textarea ' . acf_esc_attr( $atttributes ) . ' data-rich-editor-options="' . htmlentities( json_encode( $options ) ) . '">';
    $html .= $value;
    $html .= '</textarea>';

    $html .= '</div>';

    echo $html;
  }

  function input_admin_enqueue_scripts() {
    $url = $this->settings['url'];
    $version = $this->settings['version'];

    wp_register_script( 'acf-rich-lib', 'https://cdn.jsdelivr.net/npm/trumbowyg@2.31.0/dist/trumbowyg.min.js', [ 'acf-input' ], $version );
    wp_enqueue_script( 'acf-rich-lib' );

    wp_register_style( 'acf-rich-lib', 'https://cdn.jsdelivr.net/npm/trumbowyg@2.31.0/dist/ui/trumbowyg.min.css', [ 'acf-input' ], $version );
    wp_enqueue_style( 'acf-rich-lib' );

    wp_register_script( 'acf-rich-editor', $url . 'assets/js/input.js', [ 'acf-rich-lib' ], $version );
    wp_enqueue_script( 'acf-rich-editor' );

    wp_register_style( 'acf-rich-editor', $url . 'assets/css/input.css', [ 'acf-rich-lib' ], $version );
    wp_enqueue_style( 'acf-rich-editor' );

    //

    $theme_dir = get_stylesheet_directory() . '/style-rich-editor.css';
    $theme_uri = get_stylesheet_directory_uri() . '/style-rich-editor.css';

    if ( file_exists( $theme_dir ) ) {
      wp_register_style( 'acf-rich-editor-theme', $theme_uri, [ 'acf-rich-editor' ], $version );
      wp_enqueue_style( 'acf-rich-editor-theme' );
    }
  }

}

new acf_field_rich_editor( $this->settings );
