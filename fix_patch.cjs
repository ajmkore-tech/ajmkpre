const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

// I need to add back the closing tags and the ternary branch
const missingEnd = `            </div>
          </div>
        ) : (
          <div className="hidden lg:flex flex-1 items-center justify-center bg-gray-50">`;

// I will just find the place where it breaks and replace it.
// Right after: `<div className="text-[10px] text-gray-400 italic">No hay registros de auditoría</div>}`
// `</div>`
// `</div>`
// And then I need to inject `</div></div>) : (`

const searchStr = `                    </div>
                  )) || <div className="text-[10px] text-gray-400 italic">No hay registros de auditoría</div>}
                </div>
              </div>
              `;

code = code.replace(searchStr, searchStr + missingEnd);
fs.writeFileSync('src/pages/Sales.tsx', code);
