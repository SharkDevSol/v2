/**
 * Convert number to words (English)
 * Supports numbers up to 999,999,999.99
 */

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];

function convertLessThanOneThousand(number) {
  let result = '';

  if (number >= 100) {
    result += ones[Math.floor(number / 100)] + ' Hundred ';
    number %= 100;
  }

  if (number >= 10 && number <= 19) {
    result += teens[number - 10] + ' ';
  } else if (number >= 20 || number === 10) {
    result += tens[Math.floor(number / 10)] + ' ';
    number %= 10;
  }

  if (number > 0 && number < 10) {
    result += ones[number] + ' ';
  }

  return result.trim();
}

export function numberToWords(number) {
  if (number === 0) return 'Zero';
  if (number < 0) return 'Negative ' + numberToWords(Math.abs(number));

  // Split into integer and decimal parts
  const parts = number.toString().split('.');
  const integerPart = parseInt(parts[0]);
  const decimalPart = parts[1] ? parseInt(parts[1].padEnd(2, '0').substring(0, 2)) : 0;

  let words = '';

  // Convert integer part
  if (integerPart >= 1000000) {
    words += convertLessThanOneThousand(Math.floor(integerPart / 1000000)) + ' Million ';
  }

  if (integerPart >= 1000) {
    words += convertLessThanOneThousand(Math.floor((integerPart % 1000000) / 1000)) + ' Thousand ';
  }

  words += convertLessThanOneThousand(integerPart % 1000);

  // Add decimal part (cents)
  if (decimalPart > 0) {
    words += ' and ' + convertLessThanOneThousand(decimalPart) + ' Cents';
  }

  return words.trim() + ' Birr Only';
}

// Generate sequential receipt number
export function generateReceiptNumber(lastReceiptNumber = 0) {
  const nextNumber = lastReceiptNumber + 1;
  return nextNumber.toString().padStart(6, '0'); // Format: 000001, 000002, etc.
}
