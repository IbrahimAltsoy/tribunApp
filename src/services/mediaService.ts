import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';
const API_URL = `${API_BASE_URL}/api/media`;

/**
 * Get or create a unique session ID for this device
 */
const getSessionId = async (): Promise<string> => {
  try {
    let sessionId = await SecureStore.getItemAsync('userSessionId');

    if (!sessionId) {
      // Generate a new UUID v4
      sessionId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });

      await SecureStore.setItemAsync('userSessionId', sessionId);
    }

    return sessionId;
  } catch (error) {
    // Silent error - generate fallback session ID
    return 'fallback-session-' + Date.now();
  }
};

/**
 * Upload image to backend using multipart/form-data (anonymous upload with sessionId)
 * This is simpler and more reliable than base64 encoding
 */
const uploadImageAnonymous = async (
  imageUri: string
): Promise<{ success: boolean; data?: { url: string }; error?: string }> => {
  try {
    const sessionId = await getSessionId();


    // Create FormData for multipart upload
    const formData = new FormData();

    // Get filename from URI
    const filename = imageUri.split('/').pop() || `moment-${Date.now()}.jpg`;
    const fileExtension = filename.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

    // Create file object for FormData
    const file = {
      uri: imageUri,
      type: mimeType,
      name: filename,
    } as any;

    formData.append('file', file);

    // Send to backend with sessionId in header
    const response = await fetch(`${API_URL}/upload-anonymous`, {
      method: 'POST',
      headers: {
        'X-Session-Id': sessionId,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, ${error}`);
    }

    const json = await response.json();

    // Backend returns camelCase: { success: true, data: { publicUrl, objectName, ... } }
    const publicUrl = json.data?.publicUrl || json.publicUrl;

    return {
      success: true,
      data: {
        url: publicUrl,
        ...json.data,
      },
    };
  } catch (error) {
    // Silent error - user-friendly error handling
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Upload image using multipart/form-data (requires authentication)
 * @deprecated Use uploadImageAnonymous for mobile app
 */
const uploadImage = async (
  imageUri: string
): Promise<{ success: boolean; data?: { url: string }; error?: string }> => {
  try {
    const formData = new FormData();

    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'image.jpg';

    // Create file object for FormData
    const file = {
      uri: imageUri,
      type: 'image/jpeg',
      name: filename,
    } as any;

    formData.append('file', file);

    const response = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    return {
      success: true,
      data: json,
    };
  } catch (error) {
    // Silent error - user-friendly error handling
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

export const mediaService = {
  uploadImage,
  uploadImageAnonymous,
};
