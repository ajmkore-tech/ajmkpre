const fs = require('fs');
let code = fs.readFileSync('src/types/index.ts', 'utf8');

const oldProvider = `export interface Provider {
  id: string;
  razonSocial: string;
  rif: string;
  direccion: string;
  telefono: string;
}`;

const newProvider = `export interface Provider {
  id: string;
  tipoProveedor?: 'V' | 'J' | 'G' | 'E';
  razonSocial: string;
  rif: string;
  direccion: string;
  telefono: string;
  email?: string;
  credito?: boolean;
  diasCredito?: number;
}`;

code = code.replace(oldProvider, newProvider);
fs.writeFileSync('src/types/index.ts', code);
