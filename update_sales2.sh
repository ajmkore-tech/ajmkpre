sed -i 's/const \[sales, setSales\] = useState<Sale\[\]>(mockSales as Sale\[\]);/const { sales, setSales, clients, inventory, setInventory, userRole, formatBs, activeRate, calculateBs } = useAppContext();/g' src/pages/Sales.tsx
sed -i '/const { formatBs, activeRate, userRole } = useAppContext();/d' src/pages/Sales.tsx
