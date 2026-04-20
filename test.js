const html = '$$$$hello$$$$'.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/__(.*?)__/g, '<u>$1</u>').replace(/\$\$(.*?)\$\$/g, '<span style=\'color: #d4af37\'>$1</span>');
console.log("RESULT:", html);
