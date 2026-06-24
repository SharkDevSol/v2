use keyring::Entry;
use serde::{Deserialize, Serialize};
use tauri::{command, AppHandle, Manager};

#[derive(Debug, Serialize, Deserialize)]
struct Credentials {
    username: String,
    password: String,
    branch_code: String,
}

/// Save credentials securely to the OS keychain
/// Uses Windows Credential Manager on Windows
#[command]
async fn save_credentials(
    username: String,
    password: String,
    branch_code: String,
) -> Result<String, String> {
    // Create keyring entry for Skoolific Admin
    let entry = Entry::new("Skoolific Admin", &username)
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;

    // Store credentials as JSON
    let credentials = Credentials {
        username: username.clone(),
        password,
        branch_code,
    };

    let credentials_json = serde_json::to_string(&credentials)
        .map_err(|e| format!("Failed to serialize credentials: {}", e))?;

    // Save to keyring
    entry
        .set_password(&credentials_json)
        .map_err(|e| format!("Failed to save credentials: {}", e))?;

    Ok(format!("Credentials saved successfully for user: {}", username))
}

/// Retrieve credentials from the OS keychain
#[command]
async fn get_credentials(username: String) -> Result<Credentials, String> {
    // Create keyring entry
    let entry = Entry::new("Skoolific Admin", &username)
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;

    // Retrieve password (which contains our JSON credentials)
    let credentials_json = entry
        .get_password()
        .map_err(|e| format!("Failed to retrieve credentials: {}", e))?;

    // Deserialize credentials
    let credentials: Credentials = serde_json::from_str(&credentials_json)
        .map_err(|e| format!("Failed to parse credentials: {}", e))?;

    Ok(credentials)
}

/// Delete credentials from the OS keychain
#[command]
async fn delete_credentials(username: String) -> Result<String, String> {
    let entry = Entry::new("Skoolific Admin", &username)
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;

    entry
        .delete_credential()
        .map_err(|e| format!("Failed to delete credentials: {}", e))?;

    Ok(format!("Credentials deleted successfully for user: {}", username))
}

/// Show a native desktop notification
#[command]
async fn show_notification(
    app: AppHandle,
    title: String,
    body: String,
) -> Result<String, String> {
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| format!("Failed to show notification: {}", e))?;

    Ok("Notification shown successfully".to_string())
}

/// Check if credentials exist for a given username
#[command]
async fn has_credentials(username: String) -> Result<bool, String> {
    let entry = Entry::new("Skoolific Admin", &username)
        .map_err(|e| format!("Failed to create keyring entry: {}", e))?;

    match entry.get_password() {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            save_credentials,
            get_credentials,
            delete_credentials,
            has_credentials,
            show_notification
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
