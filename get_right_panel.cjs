const fs = require('fs');
const code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

const startIdx = code.indexOf('<div className="flex-1 flex flex-col bg-white overflow-hidden relative">');
const endIdx = code.indexOf('</div>\n          </div>\n        </div>\n      </div>');
if (startIdx !== -1 && endIdx !== -1) {
    fs.writeFileSync('right_panel.txt', code.substring(startIdx, endIdx));
    console.log("Extracted right panel to right_panel.txt");
} else {
    console.log("Could not find boundaries");
}
