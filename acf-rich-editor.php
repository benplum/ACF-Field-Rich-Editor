<?php
/*
Plugin Name: Advanced Custom Fields: Rich Editor
Plugin URI: https://github.com/benplum/ACF-Field-Rich-Editor
Description: Rich Editor field for Advanced Custom Fields Pro.
Version: 0.3.0
Author: Ben Plum
Author URI: https://benplum.com
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
*/

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
  exit;
}

class ACF_Plugin_Rich_Editor_Field {

  protected static $instance;

  public $file = __FILE__;

  var $settings;

  public static function get_instance() {
    if ( empty( self::$instance ) && ! ( self::$instance instanceof ACF_Plugin_Rich_Editor_Field ) ) {
      self::$instance = new ACF_Plugin_Rich_Editor_Field();
    }

    return self::$instance;
  }

  function __construct() {
    $this->settings = [
      'version' => '0.3.0',
      'url' => plugin_dir_url( __FILE__ ),
      'path' => plugin_dir_path( __FILE__ )
    ];

    // add_action( 'acf/register_fields', [ $this, 'include_field' ] ); // v4
    add_action( 'acf/include_field_types', [ $this, 'include_field' ] ); // v5
  }

  function include_field( $version = false ) {
    if ( ! $version ) $version = 5; // 4;

    include_once 'fields/class-acf-field-rich-editor-v' . $version . '.php';
  }

}

ACF_Plugin_Rich_Editor_Field::get_instance();

include 'includes/updater.php';
