import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';

export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Convert Next.js File object to a raw Node Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the PDF using pdf2json
    const text = await new Promise((resolve, reject) => {
      // The '1' in the constructor tells it to extract RAW TEXT instead of JSON structure
      const pdfParser = new PDFParser(null, 1);

      pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
      
      pdfParser.on("pdfParser_dataReady", () => {
         // getRawTextContent() extracts just the words
         resolve(pdfParser.getRawTextContent());
      });

      pdfParser.parseBuffer(buffer);
    });

    // Clean up the text (pdf2json adds some weird line breaks, this normalizes it)
    const cleanText = text.replace(/\r\n/g, ' ').replace(/\s+/g, ' ').trim();

    return NextResponse.json({ text: cleanText });

  } catch (error) {
    console.error("PDF parsing error:", error);
    
    return NextResponse.json(
      { error: `Failed to parse PDF: ${error.message}` }, 
      { status: 500 }
    );
  }
}