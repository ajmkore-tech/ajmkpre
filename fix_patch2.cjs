const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

const badPart = `            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">          </div>        ) : (          <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">`;

const goodPart = `            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">`;

// Actually let's just replace all weird occurrences.
code = code.replace(/<\/div>\s*<\/div>\s*\) : \(\s*<div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">\s*<\/div>\s*\) : \(\s*<div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">/, goodPart);

fs.writeFileSync('src/pages/Sales.tsx', code);
