const fs = require('fs');
let content = fs.readFileSync('src/pages/Configuracion.tsx', 'utf8');
content = content.replace("from 'lucide-react';", "");
content = content.replace(", Box", ""); // cleanup my previous mistakes
content = content.replace("} from 'lucide-react';", ", Box } from 'lucide-react';");
content = content.replace(/import \{ Users, FileText.*?\} from 'lucide-react';/, (match) => match.replace("}", ", Box }"));
fs.writeFileSync('src/pages/Configuracion.tsx', content);
