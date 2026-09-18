import { getAccessToken } from './firebase';
import { DriveSavedFile } from '../types';

export const uploadVoiceSessionToDrive = async (
  sessionTitle: string,
  content: string
): Promise<DriveSavedFile> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token not found. Please sign in with Google first.');
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const fileName = `${sessionTitle.replace(/[^a-zA-Z0-9_\u1000-\u109F]/g, '_')}_${new Date().toISOString().slice(0, 10)}.txt`;
  const metadata = {
    name: fileName,
    mimeType: 'text/plain',
    description: 'Saved Bagan Voice Agent Transcript & Android Control Logs - Develop by Victor Geek',
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: text/plain; charset=UTF-8\r\n\r\n' +
    content +
    closeDelimiter;

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Drive upload failed: ${errText}`);
  }

  const data = await response.json();
  return {
    id: data.id,
    name: data.name || fileName,
    mimeType: data.mimeType || 'text/plain',
    createdTime: new Date().toISOString(),
    webViewLink: `https://drive.google.com/file/d/${data.id}/view`,
  };
};

export const listDriveVoiceFiles = async (): Promise<DriveSavedFile[]> => {
  const token = await getAccessToken();
  if (!token) {
    return [];
  }

  // Query files created by this app (or files containing "Bagan_Voice" or text files)
  const q = encodeURIComponent("trashed = false and mimeType = 'text/plain'");
  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,createdTime,webViewLink,size)&pageSize=20&orderBy=createdTime desc`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to retrieve files from Google Drive');
  }

  const data = await response.json();
  return (data.files || []).map((f: any) => ({
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    createdTime: f.createdTime,
    webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
    size: f.size,
  }));
};

export const deleteDriveFile = async (fileId: string): Promise<boolean> => {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Google Drive access token not found.');
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    throw new Error('Failed to delete file from Google Drive');
  }

  return true;
};
