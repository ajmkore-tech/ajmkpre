sed -i 's/import mockSales from ..\/data\/mockSales.json/import { SaleStatus, SaleItem, Sale, Client, Product } from "..\/context\/AppContext"/g' src/pages/Sales.tsx
sed -i '/import clientsData from ..\/data\/clients.json/d' src/pages/Sales.tsx
sed -i '/import inventoryData from ..\/data\/inventory.json/d' src/pages/Sales.tsx
sed -i '/type SaleStatus = /d' src/pages/Sales.tsx
sed -i '/interface SaleItem {/,/}/d' src/pages/Sales.tsx
sed -i '/interface Sale {/,/}/d' src/pages/Sales.tsx
sed -i '/interface Client {/,/}/d' src/pages/Sales.tsx
sed -i '/interface Product {/,/}/d' src/pages/Sales.tsx
