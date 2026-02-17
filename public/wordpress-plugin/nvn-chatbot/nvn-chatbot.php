<?php
/**
 * Plugin Name: NVN Chatbot - Női Vállalkozók Napja
 * Plugin URI: https://noivallalkozoknapja.com
 * Description: AI-powered chatbot widget for Női Vállalkozók Napja - provides information about the event, speakers, exhibitors, and schedule.
 * Version: 1.0.0
 * Author: Női Vállalkozók Napja
 * Author URI: https://noivallalkozoknapja.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: nvn-chatbot
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Plugin constants
define('NVN_CHATBOT_VERSION', '1.0.0');
define('NVN_CHATBOT_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('NVN_CHATBOT_PLUGIN_URL', plugin_dir_url(__FILE__));

/**
 * Main plugin class
 */
class NVN_Chatbot {
    
    /**
     * Plugin instance
     */
    private static $instance = null;
    
    /**
     * Get plugin instance
     */
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Constructor
     */
    private function __construct() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('wp_footer', array($this, 'render_chat_widget'));
    }
    
    /**
     * Enqueue chatbot scripts
     */
    public function enqueue_scripts() {
        // Scripts are now rendered inline in render_chat_widget()
    }
    
    /**
     * Render chat widget initialization
     */
    public function render_chat_widget() {
        // Only render if enabled
        if (get_option('nvn_chatbot_enabled', '1') !== '1') {
            return;
        }
        
        $api_url = get_option('nvn_chatbot_api_url', '');
        $api_key = get_option('nvn_chatbot_api_key', '');
        $position = get_option('nvn_chatbot_position', 'bottom-right');
        $primary_color = get_option('nvn_chatbot_primary_color', '#7e57c2');
        $accent_color = get_option('nvn_chatbot_accent_color', '#c2185b');
        
        if (empty($api_url) || empty($api_key)) {
            return;
        }
        
        // Inline the widget script to avoid cross-origin loading issues
        $script_path = NVN_CHATBOT_PLUGIN_DIR . 'assets/nvn-chat.js';
        if (file_exists($script_path)) {
            echo '<script>' . file_get_contents($script_path) . '</script>';
        } else {
            // Fallback: load from hosted URL
            echo '<script src="https://nvnchatbot.lovable.app/nvn-chat.js"></script>';
        }
        
        ?>
        <script>
            if (typeof window.NVNChat !== 'undefined') {
                window.NVNChat.init({
                    apiUrl: <?php echo json_encode($api_url); ?>,
                    apiKey: <?php echo json_encode($api_key); ?>,
                    position: <?php echo json_encode($position); ?>,
                    primaryColor: <?php echo json_encode($primary_color); ?>,
                    accentColor: <?php echo json_encode($accent_color); ?>
                });
            }
        </script>
        <?php
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            'NVN Chatbot Beállítások',
            'NVN Chatbot',
            'manage_options',
            'nvn-chatbot',
            array($this, 'render_admin_page')
        );
    }
    
    /**
     * Register settings
     */
    public function register_settings() {
        register_setting('nvn_chatbot_settings', 'nvn_chatbot_enabled');
        register_setting('nvn_chatbot_settings', 'nvn_chatbot_api_url');
        register_setting('nvn_chatbot_settings', 'nvn_chatbot_api_key');
        register_setting('nvn_chatbot_settings', 'nvn_chatbot_position');
        register_setting('nvn_chatbot_settings', 'nvn_chatbot_primary_color');
        register_setting('nvn_chatbot_settings', 'nvn_chatbot_accent_color');
    }
    
    /**
     * Render admin settings page
     */
    public function render_admin_page() {
        ?>
        <div class="wrap">
            <h1>🌸 NVN Chatbot Beállítások</h1>
            <p>AI-alapú chatbot a Női Vállalkozók Napja eseményhez.</p>
            
            <form method="post" action="options.php">
                <?php settings_fields('nvn_chatbot_settings'); ?>
                
                <table class="form-table">
                    <tr>
                        <th scope="row">Chatbot engedélyezése</th>
                        <td>
                            <label>
                                <input type="checkbox" name="nvn_chatbot_enabled" value="1" <?php checked(get_option('nvn_chatbot_enabled', '1'), '1'); ?>>
                                Chatbot megjelenítése az oldalon
                            </label>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">API URL</th>
                        <td>
                            <input type="url" name="nvn_chatbot_api_url" value="<?php echo esc_attr(get_option('nvn_chatbot_api_url')); ?>" class="regular-text" placeholder="https://your-project.supabase.co/functions/v1/chat">
                            <p class="description">A chatbot API végpont URL-je</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">API Key</th>
                        <td>
                            <input type="password" name="nvn_chatbot_api_key" value="<?php echo esc_attr(get_option('nvn_chatbot_api_key')); ?>" class="regular-text">
                            <p class="description">A Supabase anon key</p>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">Pozíció</th>
                        <td>
                            <select name="nvn_chatbot_position">
                                <option value="bottom-right" <?php selected(get_option('nvn_chatbot_position', 'bottom-right'), 'bottom-right'); ?>>Jobb alsó sarok</option>
                                <option value="bottom-left" <?php selected(get_option('nvn_chatbot_position'), 'bottom-left'); ?>>Bal alsó sarok</option>
                            </select>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">Elsődleges szín</th>
                        <td>
                            <input type="color" name="nvn_chatbot_primary_color" value="<?php echo esc_attr(get_option('nvn_chatbot_primary_color', '#7e57c2')); ?>">
                            <span class="description">Header és bot üzenetek háttérszíne</span>
                        </td>
                    </tr>
                    
                    <tr>
                        <th scope="row">Kiemelő szín</th>
                        <td>
                            <input type="color" name="nvn_chatbot_accent_color" value="<?php echo esc_attr(get_option('nvn_chatbot_accent_color', '#c2185b')); ?>">
                            <span class="description">Gomb és felhasználói üzenetek háttérszíne</span>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button('Beállítások mentése'); ?>
            </form>
            
            <hr>
            
            <h2>📋 Telepítési útmutató</h2>
            <ol>
                <li>Töltsd le a <code>nvn-chat.js</code> fájlt a <code>assets</code> mappába</li>
                <li>Add meg az API URL-t és API Key-t fent</li>
                <li>Állítsd be a kívánt színeket és pozíciót</li>
                <li>Mentsd el a beállításokat</li>
            </ol>
            
            <h3>API adatok:</h3>
            <ul>
                <li><strong>API URL:</strong> <code>https://wxaqhgtoytwpvwzhfrqa.supabase.co/functions/v1/chat</code></li>
                <li><strong>API Key:</strong> <code>eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind4YXFoZ3RveXR3cHZ3emhmcnFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzOTQyODEsImV4cCI6MjA4Mzk3MDI4MX0.ShgIrOdZR90nDtOfz7vHXr5i2T-gQwPiWdRV0QfJXc0</code></li>
            </ul>
        </div>
        <?php
    }
}

// Initialize plugin
NVN_Chatbot::get_instance();
