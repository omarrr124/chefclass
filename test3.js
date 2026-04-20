const html = '**fat** and __underlined__ and $$gold$$'.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/__(.+?)__/g, '<u>$1</u>').replace(/\$\$(.+?)\$\$/g, '<span style=\'color: #d4af37\'>$1</span>');
console.log(html);
