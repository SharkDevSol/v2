let _tauri = null;

export async function getTauri() {
  if (_tauri !== null) return _tauri;
  try {
    _tauri = await import('@tauri-apps/api/core');
    return _tauri;
  } catch {
    _tauri = false;
    return null;
  }
}

export async function tauriInvoke(cmd, args) {
  const api = await getTauri();
  if (!api) return null;
  try { return await api.invoke(cmd, args); }
  catch { return null; }
}
