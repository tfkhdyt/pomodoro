// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::{fs::File, io::BufReader};

use rodio::{Decoder, OutputStream, Sink};
use tauri::{path::BaseDirectory, Manager};

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            play_transition_audio,
            play_button_press
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command(async)]
fn play_button_press(handle: tauri::AppHandle) {
    let resource_path = handle
        .path()
        .resolve("audio/button-press.wav", BaseDirectory::Resource)
        .expect("failed to resolve resource");

    let (_stream, stream_handle) = OutputStream::try_default().unwrap();
    let sink = Sink::try_new(&stream_handle).unwrap();
    let file = File::open(&resource_path).unwrap();
    sink.append(Decoder::new(BufReader::new(file)).unwrap());
    sink.sleep_until_end();
}

#[tauri::command(async)]
fn play_transition_audio(handle: tauri::AppHandle) {
    let resource_path = handle
        .path()
        .resolve("audio/alarm-kitchen.mp3", BaseDirectory::Resource)
        .expect("failed to resolve resource");

    let (_stream, stream_handle) = OutputStream::try_default().unwrap();
    let sink = Sink::try_new(&stream_handle).unwrap();
    let file = File::open(&resource_path).unwrap();
    sink.append(Decoder::new(BufReader::new(file)).unwrap());
    sink.sleep_until_end();
}
