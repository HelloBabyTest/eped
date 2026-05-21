import { supabase } from './supabase';

export const handleFileDownload = async (fileUrl: string, fileName?: string) => {
  try {
    if (!fileUrl) return;
    
    const pathParts = fileUrl.split('/teacher_files/');
    const path = pathParts.length > 1 ? pathParts[1] : null;
    
    if (!path) {
       window.open(fileUrl, '_blank');
       return;
    }

    // Try downloading the file blob
    const { data: blobData, error: downloadError } = await supabase.storage.from('teacher_files').download(path);
    
    if (downloadError || !blobData) {
       // If download fails, it might be due to lack of SELECT permission or RLS blocking.
       // We can try to generate a signed url as fallback.
       const { data: signedUrlData, error: signedError } = await supabase.storage.from('teacher_files').createSignedUrl(path, 60);
       
       if (!signedError && signedUrlData?.signedUrl) {
         window.open(signedUrlData.signedUrl, '_blank');
         return;
       }
       
       window.open(fileUrl, '_blank');
       return;
    }
    
    const url = URL.createObjectURL(blobData);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'fayl';
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (err) {
    console.error('Download error:', err);
    window.open(fileUrl, '_blank');
  }
};
