const fs = require('fs');
const path = require('path');

const replacer = (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // App.jsx and others specific replaces
  content = content.replace(/rgba\(146\s*,\s*64\s*,\s*14\s*,\s*([^)]+)\)/g, 'rgba(212, 175, 55, $1)');
  content = content.replace(/rgba\(120\s*,\s*53\s*,\s*15\s*,\s*([^)]+)\)/g, 'rgba(0, 0, 0, 0.7)');
  content = content.replace(/rgba\(255\s*,\s*255\s*,\s*255\s*,\s*([^)]+)\)/g, 'rgba(30, 35, 40, $1)');
  content = content.replace(/rgba\(254\s*,\s*243\s*,\s*199\s*,\s*([^)]+)\)/g, 'rgba(15, 20, 25, $1)');
  
  // Specific linear gradients
  content = content.replace(/linear-gradient\(135deg,\s*rgba\(254,243,199,1\)\s*0%,\s*rgba\(217,119,6,0\.3\)\s*100%\)/g, 'linear-gradient(135deg, rgba(30,35,40,1) 0%, rgba(212,175,55,0.1) 100%)');
  
  // Box shadows that look red/orange
  content = content.replace(/rgba\(180,\s*83,\s*9,\s*([^)]+)\)/g, 'rgba(0, 0, 0, 0.6)');

  fs.writeFileSync(filePath, content);
  console.log(`Updated ${filePath}`);
};

replacer(path.join(__dirname, 'src/pages/Recipes.jsx'));
replacer(path.join(__dirname, 'src/pages/Chef.jsx'));
replacer(path.join(__dirname, 'src/pages/Home.jsx'));
replacer(path.join(__dirname, 'src/App.jsx'));
