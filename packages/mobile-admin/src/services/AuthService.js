import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

const STORAGE_KEYS = {
  CREDENTIALS: 'auth_credentials',
  USERNAME: 'auth_username',
  BRANCH_CODE: 'auth_branch_code',
};

class AuthService {
  static async saveCredentials(username, password, branchCode) {
    if (!username || !password || !branchCode) {
      throw new Error('Username, password, and branch code are required');
    }
    const credentials = {
      username: username.trim(),
      password,
      branchCode: branchCode.trim(),
      savedAt: new Date().toISOString(),
    };
    await SecureStoragePlugin.set({
      key: STORAGE_KEYS.CREDENTIALS,
      value: JSON.stringify(credentials),
    });
  }

  static async getCredentials() {
    try {
      const result = await SecureStoragePlugin.get({ key: STORAGE_KEYS.CREDENTIALS });
      return JSON.parse(result.value);
    } catch (error) {
      return null;
    }
  }

  static async clearCredentials() {
    try {
      await SecureStoragePlugin.remove({ key: STORAGE_KEYS.CREDENTIALS });
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  }

  static async autoLogin(validateFn) {
    try {
      const credentials = await this.getCredentials();
      if (!credentials) {
        return { success: false, error: 'No credentials found' };
      }
      const user = await validateFn(credentials);
      return { success: true, user };
    } catch (error) {
      await this.clearCredentials();
      return { success: false, error: error.message };
    }
  }

  static async updatePassword(newPassword) {
    const credentials = await this.getCredentials();
    if (credentials) {
      credentials.password = newPassword;
      await SecureStoragePlugin.set({
        key: STORAGE_KEYS.CREDENTIALS,
        value: JSON.stringify(credentials),
      });
    }
  }

  static async updateUsername(newUsername) {
    const credentials = await this.getCredentials();
    if (credentials) {
      credentials.username = newUsername;
      await SecureStoragePlugin.set({
        key: STORAGE_KEYS.CREDENTIALS,
        value: JSON.stringify(credentials),
      });
    }
  }
}

export default AuthService;
