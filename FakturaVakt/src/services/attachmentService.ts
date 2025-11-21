// import DocumentPicker from 'react-native-document-picker';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';
import dayjs from 'dayjs';
import { v4 as uuidv4 } from 'uuid';
import type { Attachment } from '../types';
import { ATTACHMENT_DIRECTORY } from '../utils/constants';

const ensureFolder = async () => {
  const rootPath =
    Platform.OS === 'android'
      ? RNFS.DocumentDirectoryPath
      : RNFS.LibraryDirectoryPath ?? RNFS.DocumentDirectoryPath;

  const targetPath = `${rootPath}/${ATTACHMENT_DIRECTORY}`;

  const exists = await RNFS.exists(targetPath);

  if (!exists) {
    await RNFS.mkdir(targetPath);
  }

  return targetPath;
};

const persistFile = async (sourceUri: string, fileName: string) => {
  const folder = await ensureFolder();
  const destinationPath = `${folder}/${fileName}`;

  if (sourceUri.startsWith('file://')) {
    await RNFS.copyFile(sourceUri.replace('file://', ''), destinationPath);
  } else {
    await RNFS.copyFile(sourceUri, destinationPath);
  }

  return `file://${destinationPath}`;
};

export const pickDocumentAttachment = async (billId: string): Promise<Attachment | null> => {
  try {
    const result = await DocumentPicker.pickSingle({
      presentationStyle: 'fullScreen',
      copyTo: 'documentDirectory',
    });

    const fileName = `${billId}-${result.name ?? uuidv4()}`;
    const storedUri = await persistFile(result.fileCopyUri ?? result.uri, fileName);

    return {
      id: uuidv4(),
      billId,
      name: result.name ?? fileName,
      type: result.type?.includes('pdf') ? 'pdf' : 'file',
      uri: storedUri,
      mimeType: result.type ?? undefined,
      size: result.size ?? undefined,
      addedAt: dayjs().toISOString(),
    };
  } catch (error) {
    if (DocumentPicker.isCancel(error)) {
      return null;
    }

    throw error;
  }
};

export const captureImageAttachment = async (billId: string): Promise<Attachment | null> => {
  const response = await launchCamera({
    mediaType: 'photo',
    includeBase64: false,
    cameraType: 'back',
  });

  if (response.didCancel || !response.assets?.length) {
    return null;
  }

  const asset = response.assets[0];
  const fileName = `${billId}-${asset.fileName ?? uuidv4()}.jpg`;

  if (!asset.uri) {
    return null;
  }

  const storedUri = await persistFile(asset.uri, fileName);

  return {
    id: uuidv4(),
    billId,
    name: asset.fileName ?? fileName,
    type: 'image',
    uri: storedUri,
    mimeType: asset.type ?? 'image/jpeg',
    size: asset.fileSize ?? undefined,
    addedAt: dayjs().toISOString(),
  };
};

export const chooseImageAttachment = async (billId: string): Promise<Attachment | null> => {
  const response = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: 1,
  });

  if (response.didCancel || !response.assets?.length) {
    return null;
  }

  const asset = response.assets[0];
  const fileName = `${billId}-${asset.fileName ?? uuidv4()}.jpg`;

  if (!asset.uri) {
    return null;
  }

  const storedUri = await persistFile(asset.uri, fileName);

  return {
    id: uuidv4(),
    billId,
    name: asset.fileName ?? fileName,
    type: 'image',
    uri: storedUri,
    mimeType: asset.type ?? 'image/jpeg',
    size: asset.fileSize ?? undefined,
    addedAt: dayjs().toISOString(),
  };
};

export const removeAttachmentFromDisk = async (attachment: Attachment) => {
  if (!attachment.uri.startsWith('file://')) {
    return;
  }

  const path = attachment.uri.replace('file://', '');
  const exists = await RNFS.exists(path);

  if (exists) {
    await RNFS.unlink(path);
  }
};
