import * as FileSystem from 'expo-file-system';
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
    console.error('❌ Error managing session ID:', error);
    throw error;
  }
};

/**
 * Upload image to backend (anonymous upload with sessionId)
 * Converts local file URI to base64 and sends to backend
 */
const uploadImageAnonymous = async (
  imageUri: string
): Promise<{ success: boolean; data?: { url: string }; error?: string }> => {
  try {
    const sessionId = await getSessionId();

    // Read file as base64
    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // Get file extension from URI
    const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
    const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;

    // Create data URL for backend
    const dataUrl = `data:${mimeType};base64,${base64}`;

    console.log('📤 Uploading image...', {
      size: base64.length,
      mimeType,
      sessionId: sessionId.substring(0, 8) + '...',
    });

    // Send to backend
    const response = await fetch(`${API_URL}/upload-base64`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sessionId,
        imageData: dataUrl,
        fileName: `moment-${Date.now()}.${fileExtension}`,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, ${error}`);
    }

    const json = await response.json();

    console.log('✅ Image uploaded successfully');

    return {
      success: true,
      data: json.data || json,
    };
  } catch (error) {
    console.error('❌ Error uploading image:', error);
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
    console.error('❌ Error uploading image:', error);
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
