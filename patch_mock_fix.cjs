const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const oldProvidersInit = `const [providers, setProviders] = useState<Provider[]>(() => {
    const saved = localStorage.getItem('app_providers');
    return saved ? JSON.parse(saved) : mockProviders;
  });`;

const newProvidersInit = `const [providers, setProviders] = useState<Provider[]>(() => {
    const saved = localStorage.getItem('app_providers');
    const parsed = saved ? JSON.parse(saved) : [];
    // If we have very few providers, inject the mock ones to ensure they appear for testing
    if (parsed.length < 3 && !parsed.some(p => p.razonSocial === "DISTRIBUIDORA ALIMENTOS CA")) {
      return [...parsed, ...mockProviders];
    }
    return parsed.length > 0 ? parsed : mockProviders;
  });`;

code = code.replace(oldProvidersInit, newProvidersInit);
fs.writeFileSync('src/context/AppContext.tsx', code);
