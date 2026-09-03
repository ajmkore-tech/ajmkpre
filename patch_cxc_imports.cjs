const fs = require('fs');
let code = fs.readFileSync('src/pages/CxC.tsx', 'utf8');

code = code.replace(
  /import \{ Sale, Client \} from '\.\.\/types';/,
  "import { Sale, Client, SaleStatus } from '../types';"
);

code = code.replace(
  /import \{ Search, DollarSign, Calendar, Clock, CreditCard, ChevronDown, CheckCircle2, User, X, FileText, ArrowRight, History, ArrowLeft \} from 'lucide-react';/,
  "import { Search, DollarSign, Calendar, Clock, CreditCard, ChevronDown, CheckCircle2, User, X, FileText, ArrowRight, History, ArrowLeft, Truck } from 'lucide-react';"
);

fs.writeFileSync('src/pages/CxC.tsx', code);
