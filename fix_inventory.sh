sed -i 's/const \[inventory, setInventory\] = useState<Product\[\]>(inventoryData as Product\[\]);/const { inventory, setInventory, userRole } = useAppContext();/g' src/pages/Inventory.tsx
sed -i '/interface Product {/,/}/d' src/pages/Inventory.tsx
