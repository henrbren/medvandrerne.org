

import * as Print from 'expo-print';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import  missing  from './missing.html.js';


const createAndSharePDF = async (data) => {
  // Generate HTML content
  const htmlContent = await missing(data);

  try {
    // Create PDF
    const pdfResult = await Print.printToFileAsync({ html: htmlContent });
    
    if (pdfResult && pdfResult.uri) {
      // Define where to save the PDF in the file system
      const pdfName = `${Date.now()}_missing.pdf`;
      const savedPdfFile = FileSystem.documentDirectory + pdfName;

      // Move the PDF from the cache directory to a permanent directory
      await FileSystem.moveAsync({
        from: pdfResult.uri,
        to: savedPdfFile,
      });

      console.log(`PDF saved at: ${savedPdfFile}`);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        // Share the file
        await Sharing.shareAsync(savedPdfFile);
      } else {
        console.log(`Couldn't share because sharing is not available on this platform!`);
      }
    }
  } catch (error) {
    console.error(`Couldn't create or share PDF: ${error}`);
  }
};



export default createAndSharePDF;
