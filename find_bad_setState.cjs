const fs = require('fs');
const content = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

const setters = [
  'setInventoryConfig', 'setActiveRate', 'setMinoristaRate', 'setUseSeparateMinoristaRate', 
  'setUserRole', 'setRoles', 'setCanEditPrice', 'setCompanyConfig', 'setSequencesConfig', 
  'setReceipts', 'setSales', 'setClients', 'setProviders', 'setInventory', 'setPurchases', 'setExpenses'
];

setters.forEach(setter => {
  const regex = new RegExp(setter + '\\(', 'g');
  let match;
  while ((match = regex.exec(content)) !== null) {
    const index = match.index;
    const start = Math.max(0, index - 200);
    const end = Math.min(content.length, index + 200);
    console.log(`Found ${setter} at index ${index}. Context:`);
    console.log(content.substring(start, end));
    console.log('---');
  }
});
