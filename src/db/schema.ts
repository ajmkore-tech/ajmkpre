import { pgTable, serial, text, numeric, integer, timestamp } from 'drizzle-orm/pg-core';

// Esta es la estructura de la base de datos lista para ser migrada a Supabase (PostgreSQL)
// Utilizamos Drizzle ORM para definir los esquemas de forma tipada.

export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  codigo: text('codigo').notNull().unique(),
  categoria: text('categoria'),
  tipo: text('tipo'),
  marca: text('marca'),
  detalle: text('detalle').notNull(),
  proveedor: text('proveedor'),
  stockDisp: integer('stock_disp').default(0),
  stockComp: integer('stock_comp').default(0),
  stockTrans: integer('stock_trans').default(0),
  stockTotal: integer('stock_total').default(0),
  precioMayor: numeric('precio_mayor').notNull(), // Almacenado en USD base
  precioMinor: numeric('precio_minor').notNull(), // Almacenado en USD base
  createdAt: timestamp('created_at').defaultNow(),
});

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  nombre: text('nombre').notNull(),
  correo: text('correo').notNull().unique(),
  telefono: text('telefono'),
  rolId: integer('rol_id'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const roles = pgTable('roles', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull().unique(), // Ej: Admin, Vendedor Externo, Vendedor Local
  descripcion: text('descripcion'),
});

export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(), // Ej: 'active_rate'
  value: text('value').notNull(),      // Ej: 'BCV' o 'EUR'
});

export const kardex = pgTable('kardex', {
  id: serial('id').primaryKey(),
  productId: integer('product_id').notNull(),
  tipoOperacion: text('tipo_operacion').notNull(), // 'ENTRADA' | 'SALIDA'
  cantidad: integer('cantidad').notNull(),
  costoUnitario: numeric('costo_unitario').notNull(), // Para lógica PEPS futura
  referencia: text('referencia'), // Documento origen (ej: Compra #123, Venta #456)
  fecha: timestamp('fecha').defaultNow(),
});
