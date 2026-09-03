const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const mockProvidersStr = `
const mockProviders = [
  {
    id: "p1",
    tipoProveedor: 'J',
    rif: "29584736-2",
    razonSocial: "DISTRIBUIDORA ALIMENTOS CA",
    direccion: "ZONA INDUSTRIAL, CARACAS",
    telefono: "0212-555-1234",
    email: "ventas@alimentosca.com",
    credito: true,
    diasCredito: 15
  },
  {
    id: "p2",
    tipoProveedor: 'J',
    rif: "30123456-0",
    razonSocial: "SUMINISTROS MAYORISTAS SRL",
    direccion: "AV. PRINCIPAL VALENCIA",
    telefono: "0241-888-5678",
    email: "pedidos@suministros.com",
    credito: false,
    diasCredito: 0
  },
  {
    id: "p3",
    tipoProveedor: 'V',
    rif: "18234567-8",
    razonSocial: "JOSEFINA PEREZ",
    direccion: "BARQUISIMETO CENTRO",
    telefono: "0414-123-4567",
    email: "jperez@gmail.com",
    credito: true,
    diasCredito: 7
  }
];
`;

code = code.replace("const [providers, setProviders] = useState<Provider[]>(() => {", mockProvidersStr + "\n  const [providers, setProviders] = useState<Provider[]>(() => {");
code = code.replace("return saved ? JSON.parse(saved) : [];", "return saved ? JSON.parse(saved) : mockProviders;");

fs.writeFileSync('src/context/AppContext.tsx', code);
