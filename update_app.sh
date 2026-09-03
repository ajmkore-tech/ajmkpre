sed -i 's/import SimplePage from ".\/components\/SimplePage";/import SimplePage from ".\/components\/SimplePage";\nimport CxC from ".\/pages\/CxC";/g' src/App.tsx
sed -i 's/<Route path="cxc" element={<SimplePage title="Cuentas por Cobrar" \/>} \/>/<Route path="cxc" element={<CxC \/>} \/>/g' src/App.tsx
