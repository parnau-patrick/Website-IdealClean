const fs = require('fs');
const content = fs.readFileSync('c:/Users/parna/OneDrive/Desktop/Site-IdealClean/backend/src/server.js', 'utf8');

function count(char) {
  return content.split(char).length - 1;
}

console.log('Parentheses (: ', count('('));
console.log('Parentheses ): ', count(')'));
console.log('Braces { : ', count('{'));
console.log('Braces } : ', count('}'));
console.log('Brackets [ : ', count('['));
console.log('Brackets ] : ', count(']'));

try {
  new Function(content);
  console.log('✅ Syntax Check Passed');
} catch (e) {
  console.log('❌ Syntax Check Failed:', e.message);
}
