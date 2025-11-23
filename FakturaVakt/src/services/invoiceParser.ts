/**
 * Invoice Parser Service
 * Extracts structured data from invoice text
 */

export interface ParsedInvoice {
  companyName?: string;
  invoiceNumber?: string;
  amount?: number;
  dueDate?: string;
  bankgiro?: string;
  ocr?: string;
  currency?: string;
}

export class InvoiceParser {
  /**
   * Parse invoice text and extract relevant information
   * Supports Swedish invoice formats
   */
  static parseInvoiceText(text: string): ParsedInvoice {
    const result: ParsedInvoice = {};
    
    // Normalize text
    const normalizedText = text.replace(/\s+/g, ' ').trim();
    const lines = text.split('\n').map(line => line.trim());
    
    // Extract company name (usually at the top in larger text)
    result.companyName = this.extractCompanyName(lines);
    
    // Extract invoice number
    result.invoiceNumber = this.extractInvoiceNumber(normalizedText);
    
    // Extract amount
    result.amount = this.extractAmount(normalizedText);
    
    // Extract due date
    result.dueDate = this.extractDueDate(normalizedText);
    
    // Extract payment details
    result.bankgiro = this.extractBankgiro(normalizedText);
    result.ocr = this.extractOCR(normalizedText);
    
    // Extract currency
    result.currency = this.extractCurrency(normalizedText);
    
    return result;
  }
  
  private static extractCompanyName(lines: string[]): string | undefined {
    // Common Swedish company suffixes
    const companySuffixes = ['AB', 'HB', 'KB', 'Ek. för', 'ekonomisk förening'];
    
    // Look for lines with company suffixes
    for (const line of lines.slice(0, 10)) { // Check first 10 lines
      for (const suffix of companySuffixes) {
        if (line.includes(suffix)) {
          return line.trim();
        }
      }
    }
    
    // If no suffix found, try to find the first line with only letters and spaces
    const companyPattern = /^[A-ZÅÄÖa-zåäö\s&\-\.]+$/;
    for (const line of lines.slice(0, 5)) {
      if (line.length > 3 && line.length < 50 && companyPattern.test(line)) {
        return line.trim();
      }
    }
    
    return undefined;
  }
  
  private static extractInvoiceNumber(text: string): string | undefined {
    // Common patterns for invoice numbers in Swedish invoices
    const patterns = [
      /(?:faktura|invoice)[\s\-]*(?:nr|nummer|no|#)?[\s:]*([A-Z0-9\-]+)/i,
      /(?:fakturanr|fakturanummer)[\s:]*([A-Z0-9\-]+)/i,
      /(?:invoice\s*number)[\s:]*([A-Z0-9\-]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    
    return undefined;
  }
  
  private static extractAmount(text: string): number | undefined {
    // Patterns for amounts in Swedish format
    const patterns = [
      /(?:totalt?|total|att betala|amount|belopp)[\s:]*([0-9\s]+[,\.][0-9]{2})/i,
      /(?:summa|sum)[\s:]*([0-9\s]+[,\.][0-9]{2})/i,
      /([0-9]{1,3}(?:\s?[0-9]{3})*[,\.][0-9]{2})[\s]*(?:kr|sek|:-)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        // Convert Swedish number format to standard
        const amount = match[1]
          .replace(/\s/g, '') // Remove spaces
          .replace(',', '.'); // Replace comma with dot
        return parseFloat(amount);
      }
    }
    
    return undefined;
  }
  
  private static extractDueDate(text: string): string | undefined {
    // Patterns for due dates
    const patterns = [
      /(?:förfallo?dag|due date|betalas senast)[\s:]*([0-9]{4}[\-\/][0-9]{2}[\-\/][0-9]{2})/i,
      /(?:förfallo?dag|due date|betalas senast)[\s:]*([0-9]{2}[\-\/][0-9]{2}[\-\/][0-9]{4})/i,
      /(?:senast|latest)[\s:]*([0-9]{4}[\-\/][0-9]{2}[\-\/][0-9]{2})/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        // Try to normalize date to YYYY-MM-DD format
        const dateParts = match[1].split(/[\-\/]/);
        if (dateParts.length === 3) {
          if (dateParts[0].length === 4) {
            // Already in YYYY-MM-DD format
            return match[1];
          } else if (dateParts[2].length === 4) {
            // DD-MM-YYYY format, convert to YYYY-MM-DD
            return `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
          }
        }
      }
    }
    
    return undefined;
  }
  
  private static extractBankgiro(text: string): string | undefined {
    // Pattern for Swedish Bankgiro (format: XXX-XXXX or XXXX-XXXX)
    const pattern = /(?:bankgiro|bg)[\s:]*([0-9]{3,4}[\-\s]?[0-9]{4})/i;
    const match = text.match(pattern);
    
    if (match) {
      return match[1].replace(/\s/g, '-');
    }
    
    return undefined;
  }
  
  private static extractOCR(text: string): string | undefined {
    // Pattern for OCR reference number
    const patterns = [
      /(?:ocr|referens|ref)[\s:]*([0-9\s]+)/i,
      /(?:OCR-nummer)[\s:]*([0-9\s]+)/i,
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match) {
        const ocr = match[1].replace(/\s/g, '');
        // OCR should be numeric and reasonable length
        if (ocr.length >= 4 && ocr.length <= 25) {
          return ocr;
        }
      }
    }
    
    return undefined;
  }
  
  private static extractCurrency(text: string): string | undefined {
    // Look for currency indicators
    if (/\b(?:sek|kr|kronor)\b/i.test(text)) {
      return 'SEK';
    }
    if (/\b(?:eur|euro|€)\b/i.test(text)) {
      return 'EUR';
    }
    if (/\b(?:usd|\$|dollar)\b/i.test(text)) {
      return 'USD';
    }
    
    // Default to SEK for Swedish invoices
    return 'SEK';
  }
  
  /**
   * Smart extraction using patterns and confidence scoring
   */
  static smartExtract(text: string): ParsedInvoice & { confidence: number } {
    const parsed = this.parseInvoiceText(text);
    
    // Calculate confidence score based on extracted fields
    let confidence = 0;
    let fieldCount = 0;
    
    if (parsed.companyName) { confidence += 15; fieldCount++; }
    if (parsed.invoiceNumber) { confidence += 20; fieldCount++; }
    if (parsed.amount) { confidence += 25; fieldCount++; }
    if (parsed.dueDate) { confidence += 20; fieldCount++; }
    if (parsed.bankgiro || parsed.ocr) { confidence += 20; fieldCount++; }
    
    return {
      ...parsed,
      confidence: Math.min(100, confidence)
    };
  }
}