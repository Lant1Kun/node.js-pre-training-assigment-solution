const fs = require("fs");
const { Transform } = require("stream");
const { pipeline } = require("stream/promises");
const path = require('path');
const { createReadStream, createWriteStream } = require("fs");


class CSVParser extends Transform {
  constructor(options = {}) {
    super({ objectMode: true, ...options });
    // TODO: Initialize properties
    this.headers = null;
    this.lineNumber = 0;
    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    // TODO: Implement CSV parsing
    // 1. Convert chunk to string and add to buffer
    // 2. Split buffer by newlines
    // 3. Keep last incomplete line in buffer
    // 4. Process complete lines:
    //    - First line: extract headers
    //    - Other lines: create objects with headers as keys
    // 5. Push objects to next stream
    this.buffer += chunk.toString();
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() || '';
    for (const line of lines) {
      this.processLine(line);
    }
    callback();
  }

  _flush(callback) {
    // TODO: Process any remaining data in buffer
    if (this.buffer && this.buffer.trim() !== '') {
      this.processLine(this.buffer);
    }
    callback();
  }
  
  processLine(line) {
    if (line.trim() === '') return;
    
    const values = this.parseCSVLine(line);

    if (this.lineNumber === 0) {
      this.headers = values.map(h => h.trim());
      this.lineNumber++;
    } else {
      const obj = {};
      this.headers.forEach((header, index) => {
        obj[header] = values[index] !== undefined ? values[index] : '';
      });
      this.push(obj);
      this.lineNumber++;
    }
  }

  parseCSVLine(line) {
    const result = [];
    let cur = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (inQuotes) {
        if (char === '"' && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else if (char === '"') {
          inQuotes = false;
        } else {
          cur += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          result.push(cur);
          cur = '';
        } else {
          cur += char;
        }
      }
    }
    result.push(cur);
    return result;
  }
}

/**
 * Data Transformer Stream
 * Applies transformations to each record
 */
class DataTransformer extends Transform {
  constructor(options = {}) {
    super({ objectMode: true });
  }

  _transform(record, encoding, callback) {
    // TODO: Apply transformations to record
    // 1. Capitalize name using capitalizeName()
    // 2. Normalize email using normalizeEmail()
    // 3. Format phone using formatPhone()
    // 4. Standardize date using standardizeDate()
    // 5. Capitalize city name
    // 6. Push transformed record

    if (record.name) {
      record.name = capitalizeName(record.name);
    }
    if (record.email) {
      record.email = normalizeEmail(record.email);
    }
    if (record.phone) {
      record.phone = formatPhone(record.phone);
    }
    if (record.birthdate) {
      record.birthdate = standardizeDate(record.birthdate);
    }
    if (record.city) {
      record.city = capitalizeCity(record.city);
    }

    this.push(record);
    callback();
  }
}

/**
 * CSV Writer Transform Stream
 * Converts objects back to CSV format
 */
class CSVWriter extends Transform {
  constructor(options = {}) {
    super({ objectMode: true, ...options });
    // TODO: Initialize properties
    // - this.headerWritten = false;
    this.headerWritten = false;
    this.headers = null;
  }

  _transform(record, encoding, callback) {
    // TODO: Convert object to CSV format
    // 1. Write headers on first record
    // 2. Convert record values to CSV line
    // 3. Handle special characters and quotes
    // 4. Push CSV line as string
    try {
      if (!this.headerWritten) {
        this.headers = Object.keys(record);
        const headerLine = this.headers
          .map(field => this.escapeField(field))
          .join(',');
        this.push(headerLine + '\n');
        this.headerWritten = true;
      }
      const values = this.headers.map(key => {
        const val = record[key];
        return val !== undefined && val !== null ? String(val) : '';
      });

      const line = values
        .map(value => this.escapeField(value))
        .join(',');
      this.push(line + '\n');
      callback();
    } catch (err) {
      callback(err);
    }
  }

  escapeField(field) {
    if (field == null) return ''; // null/undefined → empty string
    const str = String(field);
    // Check if quoting is needed
    if (str.includes(',') || str.includes('\n') || str.includes('\r') || str.includes('"')) {
      // Escape double quotes by doubling them
      const escaped = str.replace(/"/g, '""');
      return `"${escaped}"`;
    }
    return str;
  }
}

/**
 * Helper Functions
 */

/**
 * Capitalize names properly
 * @param {string} name - Name to capitalize
 * @returns {string} Capitalized name
 */
function capitalizeName(name) {
  // TODO: Implement name capitalization
  // 1. Handle empty/null names
  // 2. Split by spaces and hyphens
  // 3. Capitalize each part
  // 4. Join back together
  // Examples:
  // "john doe" → "John Doe"
  // "mary-jane smith" → "Mary-Jane Smith"
  if (name === "" || name === null) {
    return "";
  }
  return name
    .split(' ')
    .map(part =>
      part
        .split('-')
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join('-')
    )
    .join(' ');
}

/**
 * Normalize email addresses
 * @param {string} email - Email to normalize
 * @returns {string} Normalized email or original if invalid
 */
function normalizeEmail(email) {
  // TODO: Implement email normalization
  // 1. Convert to lowercase
  // 2. Validate basic email format (contains @ and .)
  // 3. Return normalized email or original if invalid
  const trimmed = email.trim().toLowerCase();
  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  return isValid ? trimmed : email;
}

/**
 * Format phone numbers
 * @param {string} phone - Phone number to format
 * @returns {string} Formatted phone or "INVALID"
 */
function formatPhone(phone) {
  // TODO: Implement phone formatting
  // 1. Extract only digits
  // 2. Check if exactly 10 digits
  // 3. Format as (XXX) XXX-XXXX
  // 4. Return "INVALID" if not valid
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  return "INVALID";
}

/**
 * Standardize date formats
 * @param {string} date - Date to standardize
 * @returns {string} Date in YYYY-MM-DD format
 */
function standardizeDate(date) {
  // TODO: Implement date standardization
  // 1. Handle different input formats:
  //    - MM/DD/YYYY
  //    - YYYY-MM-DD
  //    - YYYY/MM/DD
  // 2. Convert to YYYY-MM-DD format
  // 3. Validate date is real
  // 4. Return original if invalid
  const trimmed = date.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parts = trimmed.split('-');
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (d.getFullYear() === year && d.getMonth() === month && d.getDate() === day) {
      if (month <= 12 && month > 0) {
        return trimmed;
      } else {
        return date;
      }
    }
  }
  const parsed = new Date(trimmed);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');
    if (month <= 12 && month > 0) {
      return `${year}-${month}-${day}`;
    } else {
      return date;
    }
    
  }
  return date;
}

function capitalizeCity(city) {
  
  return city
    .split(' ')
    .map(part =>
      part
        .split('-')
        .map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase())
        .join('-')
    )
    .join(' ');
}

/**
 * Main function to process CSV file
 * @param {string} inputPath - Path to input CSV file
 * @param {string} outputPath - Path to output CSV file
 * @returns {Promise} Promise that resolves when processing is complete
 */
async function processCSVFile(inputPath, outputPath) {
  // TODO: Implement the main processing pipeline
  // 1. Create read stream from input file
  // 2. Create transform streams (CSVParser, DataTransformer, CSVWriter)
  // 3. Create write stream to output file
  // 4. Use pipeline() to connect all streams
  // 5. Handle errors appropriately
  // 6. Return promise that resolves when complete
  try {
    const readStream = createReadStream(inputPath);

    const parser = new CSVParser();
    const transformer = new DataTransformer();
    const writer = new CSVWriter();

    const writeStream = createWriteStream(outputPath);

    await pipeline(
      readStream,
      parser,       
      transformer,   
      writer,     
      writeStream   
    );
    console.log(`CSV processing complete. Output written to ${outputPath}`);
  } catch (error) {
    throw new Error(`Failed to process CSV file: ${error.message}`);
  }
}

/**
 * Create sample input data for testing
 */
function createSampleData(outputPath = 'data/input.csv') {
  // TODO: Create data directory and sample CSV file
  // 1. Create 'data' directory if it doesn't exist
  // 2. Write sample CSV data as specified in task description
  const dir = path.dirname(outputPath);
  fs.mkdirSync(dir, { recursive: true });
  const sampleCSV = `name,email,phone,birthdate,city
john doe,JOHN.DOE@EXAMPLE.COM,1234567890,12/25/1990,new york
jane smith,Jane.Smith@Gmail.Com,555-123-4567,1985-03-15,los angeles
bob johnson,BOB@TEST.COM,invalid-phone,03/22/1992,chicago
alice brown,alice.brown@company.org,9876543210,1988/07/04,houston`;
  fs.writeFileSync(outputPath, sampleCSV, 'utf8');
  console.log(`Sample data written to ${outputPath}`);
  return outputPath;
}

// Export classes and functions
module.exports = {
  CSVParser,
  DataTransformer,
  CSVWriter,
  processCSVFile,
  capitalizeName,
  normalizeEmail,
  formatPhone,
  standardizeDate,
  createSampleData,
};

// Example usage (for testing):
const isReadyToTest = true;

if (isReadyToTest) {
  // Create sample data
  createSampleData("data/users.csv");

  // Process the file
  processCSVFile("data/users.csv", "data/users_transformed.csv")
    .then(() => {
      console.log("✅ File transformation completed successfully!");

      // Read and display results
      const output = fs.readFileSync("data/users_transformed.csv", "utf-8");
      console.log("\n📄 Transformed CSV output:");
      console.log(output);
    })
    .catch((error) => {
      console.error("❌ Error processing file:", error.message);
    });
}
