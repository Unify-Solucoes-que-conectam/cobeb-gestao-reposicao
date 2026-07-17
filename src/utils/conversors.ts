/**
 * função para converter documento de file > base64
 * @param file arquivo a ser convertido
 * @returns base64 do arquivo e o mimeType
 */
export const convertFileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const base64 = reader.result as string;
      const mimeType = file.type;
      resolve({ base64, mimeType });
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};