#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::collections::HashMap;
use std::sync::Mutex;

struct Credentials(Mutex<HashMap<String, String>>);

#[tauri::command]
fn save_credentials(state: tauri::State<Credentials>, username: String, password: String, branch_code: String) -> bool {
    let mut creds = state.0.lock().unwrap();
    creds.insert("username".to_string(), username);
    creds.insert("password".to_string(), password);
    creds.insert("branch_code".to_string(), branch_code);
    true
}

#[tauri::command]
fn get_credentials(state: tauri::State<Credentials>) -> Option<HashMap<String, String>> {
    let creds = state.0.lock().unwrap();
    if creds.contains_key("username") {
        Some(creds.clone())
    } else {
        None
    }
}

#[tauri::command]
fn clear_credentials(state: tauri::State<Credentials>) -> bool {
    state.0.lock().unwrap().clear();
    true
}

fn main() {
    tauri::Builder::default()
        .manage(Credentials(Default::default()))
        .invoke_handler(tauri::generate_handler![
            save_credentials,
            get_credentials,
            clear_credentials,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
