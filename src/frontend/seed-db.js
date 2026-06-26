const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, '..', 'backend', 'TallerMecanico', 'TallerMecanico.API', 'TallerMecanico.db');
const db = new Database(dbPath);

db.pragma('foreign_keys = ON');

const now = new Date().toISOString();
const today = new Date();
const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
const lastWeek = new Date(today); lastWeek.setDate(today.getDate() - 7);
const twoWeeksAgo = new Date(today); twoWeeksAgo.setDate(today.getDate() - 14);
const threeWeeksAgo = new Date(today); threeWeeksAgo.setDate(today.getDate() - 21);
const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 5);

console.log('Limpiando datos existentes...');
db.exec(`
  DELETE FROM FacturaDetalles;
  DELETE FROM Facturas;
  DELETE FROM OrdenDetalles;
  DELETE FROM InventarioMovimientos;
  DELETE FROM Citas;
  DELETE FROM OrdenesTrabajo;
  DELETE FROM Vehiculos;
  DELETE FROM Clientes WHERE Id > 1;
  DELETE FROM Servicios WHERE Id > 5;
  DELETE FROM Refacciones WHERE Id > 5;
  DELETE FROM Empleados WHERE Id > 1;
  DELETE FROM Usuarios WHERE Id > 1;
  DELETE FROM sqlite_sequence WHERE name IN ('Usuarios','Empleados','Clientes','Vehiculos','Servicios','Refacciones','OrdenesTrabajo','OrdenDetalles','InventarioMovimientos','Citas','Facturas','FacturaDetalles');
`);

console.log('Insertando datos de prueba...');

// --- USUARIOS ---
const adminHash = db.prepare('SELECT PasswordHash FROM Usuarios WHERE Id = 1').get().PasswordHash;

const insertUsuario = db.prepare(`INSERT INTO Usuarios (Id, Username, PasswordHash, Rol, Activo, FechaCreacion, FechaActualizacion) VALUES (?, ?, ?, ?, ?, ?, ?)`);

const usuarioIds = [1];
const usuariosData = [
  [2, 'carlos.mendoza', adminHash, 'Mecanico', 1],
  [3, 'maria.gonzalez', adminHash, 'Recepcionista', 1],
  [4, 'roberto.hernandez', adminHash, 'Mecanico', 1],
  [5, 'ana.martinez', adminHash, 'Recepcionista', 1],
  [6, 'luis.sanchez', adminHash, 'Mecanico', 0],
];
for (const u of usuariosData) {
  insertUsuario.run(...u, now, now);
  usuarioIds.push(u[0]);
}

// --- EMPLEADOS ---
const insertEmpleado = db.prepare(`INSERT INTO Empleados (Id, Nombre, ApellidoPaterno, ApellidoMaterno, Telefono, Email, Puesto, UsuarioId, Activo, FechaCreacion, FechaActualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const empleadoIds = [1];
const empleadosData = [
  [2, 'Carlos', 'Mendoza', 'Ruiz', '555-100-2001', 'carlos@taller.com', 'Mecanico', usuarioIds[1], 1],
  [3, 'Maria', 'Gonzalez', 'Lopez', '555-100-2002', 'maria@taller.com', 'Recepcionista', usuarioIds[2], 1],
  [4, 'Roberto', 'Hernandez', 'Diaz', '555-100-2003', 'roberto@taller.com', 'Mecanico', usuarioIds[3], 1],
  [5, 'Ana', 'Martinez', 'Torres', '555-100-2004', 'ana@taller.com', 'Recepcionista', usuarioIds[4], 1],
  [6, 'Luis', 'Sanchez', 'Vega', '555-100-2005', 'luis@taller.com', 'Mecanico', usuarioIds[5], 0],
];
for (const e of empleadosData) {
  insertEmpleado.run(...e, now, now);
  empleadoIds.push(e[0]);
}

// --- CLIENTES ---
const insertCliente = db.prepare(`INSERT INTO Clientes (Id, Nombre, ApellidoPaterno, ApellidoMaterno, Telefono, Email, Direccion, RFC, Activo, FechaCreacion, FechaActualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const clienteIds = [1];
const clientesData = [
  [2, 'Maria', 'Lopez', 'Hernandez', '555-200-0002', 'maria.lopez@mail.com', 'Calle Morelos 456, Col. Roma', 'LOHM900215', 1],
  [3, 'Roberto', 'Diaz', 'Martinez', '555-200-0003', 'roberto.diaz@mail.com', 'Blvd. Juarez 789, Col. Norte', 'DIMR850330', 1],
  [4, 'Ana', 'Torres', 'Sanchez', '555-200-0004', 'ana.torres@mail.com', 'Paseo de la Reforma 321', 'TOSA920412', 1],
  [5, 'Carlos', 'Ramirez', 'Flores', '555-200-0005', 'carlos.ramirez@mail.com', 'Av. Insurgentes 567', 'RAFC780520', 1],
  [6, 'Patricia', 'Vega', 'Morales', '555-200-0006', 'patricia.vega@mail.com', 'Calle Hidalgo 890', 'VEMP910630', 1],
  [7, 'Miguel', 'Castillo', 'Rojas', '555-200-0007', 'miguel.castillo@mail.com', 'Av. Madero 234', 'CARM750815', 1],
  [8, 'Laura', 'Flores', 'Jimenez', '555-200-0008', 'laura.flores@mail.com', 'Calle 5 de Mayo 678', 'FLJL880925', 0],
  [9, 'Fernando', 'Morales', 'Cruz', '555-200-0009', 'fernando.morales@mail.com', 'Blvd. de la Luz 901', 'MOCF931010', 1],
  [10, 'Gabriela', 'Jimenez', 'Reyes', '555-200-0010', 'gabriela.jimenez@mail.com', 'Calle Libertad 456', 'JIRG860111', 1],
];
for (const c of clientesData) {
  insertCliente.run(...c, now, now);
  clienteIds.push(c[0]);
}

// --- VEHICULOS ---
const insertVehiculo = db.prepare(`INSERT INTO Vehiculos (Id, ClienteId, Marca, Modelo, Anio, Color, Placas, VIN, Kilometraje, FechaCreacion, FechaActualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const vehiculoIds = [];
const vehiculosData = [
  [1,  1,  'Toyota',    'Corolla',  2022, 'Blanco',  'ABC-123-A', '1HGBH41JXMN109186', 35000],
  [2,  clienteIds[1], 'Honda',    'Civic',    2021, 'Negro',   'DEF-456-B', '2HGFC2F59H558739', 42000],
  [3,  clienteIds[2], 'Ford',     'F-150',    2023, 'Rojo',    'GHI-789-C', '1FTEW1EP5MKE12345', 18000],
  [4,  clienteIds[2], 'Ford',     'Escape',   2020, 'Azul',    'JKL-012-D', '1FMCU9GD5LUB98765', 67000],
  [5,  clienteIds[3], 'Chevrolet','Silverado',2019, 'Gris',    'MNO-345-E', '3GCUYDED0KG234567', 95000],
  [6,  clienteIds[4], 'Nissan',   'Sentra',   2021, 'Plata',   'PQR-678-F', '3N1AB8CV5MY345678', 28000],
  [7,  clienteIds[5], 'Volkswagen','Jetta',   2022, 'Blanco',  'STU-901-G', '3VWD17BU5NM456789', 31000],
  [8,  clienteIds[6], 'Mazda',    '3',        2020, 'Negro',   'VWX-234-H', '3MZBPAEL0MM567890', 54000],
  [9,  clienteIds[7], 'Toyota',   'RAV4',     2018, 'Verde',   'YZA-567-I', '2T3P1RFV5JW678901', 102000],
  [10, clienteIds[7], 'Honda',    'CR-V',     2023, 'Rojo',    'BCD-890-J', '7FARS6H30PE789012', 5000],
  [11, clienteIds[8], 'Hyundai',  'Tucson',   2021, 'Azul',    'EFG-123-K', '5NMJFDAE0MH890123', 39000],
  [12, clienteIds[4], 'Nissan',   'Versa',    2019, 'Gris',    'HIJ-456-L', '3N1CN8BV2LY901234', 72000],
  [13, clienteIds[3], 'Kia',      'Sportage', 2022, 'Blanco',  'KLM-789-M', '5XYP3DHC5NG012345', 22000],
];
for (const v of vehiculosData) {
  insertVehiculo.run(...v, now, now);
  vehiculoIds.push(v[0]);
}

// --- SERVICIOS adicionales ---
const insertServicio = db.prepare(`INSERT INTO Servicios (Id, Nombre, Descripcion, PrecioManoObra, Activo, FechaCreacion, FechaActualizacion) VALUES (?, ?, ?, ?, ?, ?, ?)`);

const servicioIds = [1, 2, 3, 4, 5];
const serviciosData = [
  [6,  'Cambio de frenos traseros', 'Reemplazo de balatas y discos traseros', 1200, 1],
  [7,  'Servicio de transmision', 'Mantenimiento y revision de transmision', 2500, 1],
  [8,  'Cambio de amortiguadores', 'Reemplazo de amortiguadores delanteros o traseros', 1800, 1],
  [9,  'Afinacion mayor', 'Afinacion completa del motor', 1500, 1],
  [10, 'Revision de suspension', 'Diagnostico y ajuste de suspension', 800, 1],
  [11, 'Cambio de clutch', 'Reemplazo de clutch completo', 3500, 0],
];
for (const s of serviciosData) {
  insertServicio.run(...s, now, now);
  servicioIds.push(s[0]);
}

// --- REFACCIONES adicionales ---
const insertRefaccion = db.prepare(`INSERT INTO Refacciones (Id, Codigo, Nombre, Descripcion, PrecioCompra, PrecioVenta, StockActual, StockMinimo, Activo, FechaCreacion, FechaActualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const refaccionIds = [1, 2, 3, 4, 5];
const refaccionesData = [
  [6,  'BAL-TRA-001', 'Balatas traseras', 'Juego de balatas traseras universales', 250, 450, 20, 5, 1],
  [7,  'DIS-DEL-001', 'Discos delanteros', 'Par de discos delanteros estandar', 400, 750, 10, 3, 1],
  [8,  'AMO-DEL-001', 'Amortiguador delantero', 'Amortiguador delantero individual', 600, 1100, 8, 4, 1],
  [9,  'CLU-001', 'Kit de clutch', 'Clutch completo con disco y balero', 1500, 2800, 3, 2, 1],
  [10, 'FUL-001', 'Filtro de combustible', 'Filtro de combustible universal', 80, 180, 30, 10, 1],
  [11, 'BOM-001', 'Bomba de agua', 'Bomba de agua para motor 2.0L', 900, 1600, 4, 2, 1],
  [12, 'TEN-001', 'Tensor de banda', 'Tensor de banda serpentina', 350, 650, 6, 3, 1],
  [13, 'RAD-001', 'Radiador', 'Radiador de aluminio estandar', 1200, 2200, 2, 1, 1],
  [14, 'ALT-001', 'Alternador', 'Alternador reconstruido 120A', 2500, 4200, 0, 1, 1],
  [15, 'TER-001', 'Termostato', 'Termostato 82 grados', 120, 280, 15, 5, 0],
];
for (const r of refaccionesData) {
  insertRefaccion.run(...r, now, now);
  refaccionIds.push(r[0]);
}

db.prepare('UPDATE Refacciones SET StockActual = 25, PrecioVenta = 380, PrecioCompra = 200 WHERE Id = 1').run();
db.prepare('UPDATE Refacciones SET StockActual = 30, PrecioVenta = 220, PrecioCompra = 120 WHERE Id = 2').run();
db.prepare('UPDATE Refacciones SET StockActual = 12, PrecioVenta = 650, PrecioCompra = 350 WHERE Id = 3').run();
db.prepare('UPDATE Refacciones SET StockActual = 18, PrecioVenta = 300, PrecioCompra = 160 WHERE Id = 4').run();
db.prepare('UPDATE Refacciones SET StockActual = 10, PrecioVenta = 250, PrecioCompra = 130 WHERE Id = 5').run();

// --- ORDENES DE TRABAJO (todos los estatus) ---
const insertOrden = db.prepare(`INSERT INTO OrdenesTrabajo (Id, Folio, VehiculoId, ClienteId, EmpleadoRecibeId, EmpleadoAsignadoId, Estatus, FechaEntrada, FechaPrometida, FechaEntrega, KilometrajeEntrada, Diagnostico, Observaciones, TotalManoObra, TotalRefacciones, Total, FechaCreacion, FechaActualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const ordenesData = [
  { id: 1, folio: 'OT-2026-002', veh: vehiculoIds[0], cli: 1, rec: empleadoIds[2], asig: null,
    estatus: 'Recibida', entrada: yesterday.toISOString(), prometida: nextWeek.toISOString(), entrega: null,
    km: 35000, diag: null, obs: 'Cliente reporta ruido al frenar', mano: 0, ref: 0, total: 0 },
  { id: 2, folio: 'OT-2026-003', veh: vehiculoIds[1], cli: clienteIds[1], rec: empleadoIds[2], asig: empleadoIds[1],
    estatus: 'Diagnostico', entrada: yesterday.toISOString(), prometida: nextWeek.toISOString(), entrega: null,
    km: 42500, diag: 'Posible falla en transmision automatica', obs: 'Requiere escaneo de computadora', mano: 0, ref: 0, total: 500 },
  { id: 3, folio: 'OT-2026-004', veh: vehiculoIds[2], cli: clienteIds[2], rec: empleadoIds[2], asig: empleadoIds[1],
    estatus: 'EnProceso', entrada: lastWeek.toISOString(), prometida: tomorrow.toISOString(), entrega: null,
    km: 18500, diag: 'Balatas delanteras y traseras desgastadas', obs: 'Se requieren refacciones', mano: 1500, ref: 1200, total: 2700 },
  { id: 4, folio: 'OT-2026-005', veh: vehiculoIds[3], cli: clienteIds[2], rec: empleadoIds[4], asig: empleadoIds[3],
    estatus: 'EsperaRefacciones', entrada: lastWeek.toISOString(), prometida: nextWeek.toISOString(), entrega: null,
    km: 67500, diag: 'Amortiguadores delanteros sin vida util', obs: 'Esperando pedido de amortiguadores', mano: 1800, ref: 2200, total: 4000 },
  { id: 5, folio: 'OT-2026-006', veh: vehiculoIds[4], cli: clienteIds[3], rec: empleadoIds[2], asig: empleadoIds[1],
    estatus: 'Terminada', entrada: twoWeeksAgo.toISOString(), prometida: lastWeek.toISOString(), entrega: yesterday.toISOString(),
    km: 96000, diag: 'Cambio de aceite y filtro completado', obs: 'Servicio terminado, pendiente entrega', mano: 500, ref: 588, total: 1088 },
  { id: 6, folio: 'OT-2026-007', veh: vehiculoIds[5], cli: clienteIds[4], rec: empleadoIds[4], asig: empleadoIds[3],
    estatus: 'Entregada', entrada: threeWeeksAgo.toISOString(), prometida: twoWeeksAgo.toISOString(), entrega: twoWeeksAgo.toISOString(),
    km: 28500, diag: 'Problema de sobrecalentamiento', obs: 'Se reemplazo termostato y anticongelante', mano: 800, ref: 530, total: 1330 },
  { id: 7, folio: 'OT-2026-008', veh: vehiculoIds[6], cli: clienteIds[5], rec: empleadoIds[2], asig: null,
    estatus: 'Cancelada', entrada: twoWeeksAgo.toISOString(), prometida: null, entrega: null,
    km: 54000, diag: null, obs: 'Cliente cancelo el servicio por costo', mano: 0, ref: 0, total: 0 },
  { id: 8, folio: 'OT-2026-009', veh: vehiculoIds[7], cli: clienteIds[6], rec: empleadoIds[2], asig: empleadoIds[1],
    estatus: 'EnProceso', entrada: lastWeek.toISOString(), prometida: nextWeek.toISOString(), entrega: null,
    km: 55000, diag: 'Falla en alternador, no carga bateria', obs: 'Alternador agotado, se pidio reconstruido', mano: 1500, ref: 4200, total: 5700 },
  { id: 9, folio: 'OT-2026-010', veh: vehiculoIds[8], cli: clienteIds[6], rec: empleadoIds[4], asig: empleadoIds[3],
    estatus: 'Diagnostico', entrada: yesterday.toISOString(), prometida: nextWeek.toISOString(), entrega: null,
    km: 5100, diag: null, obs: 'Ruido en suspension delantera', mano: 0, ref: 0, total: 500 },
  { id: 10, folio: 'OT-2026-011', veh: vehiculoIds[9], cli: clienteIds[8], rec: empleadoIds[2], asig: empleadoIds[1],
    estatus: 'EnProceso', entrada: threeWeeksAgo.toISOString(), prometida: twoWeeksAgo.toISOString(), entrega: null,
    km: 39500, diag: 'Cambio de clutch completo', obs: 'En proceso de instalacion', mano: 3500, ref: 2800, total: 6300 },
  { id: 11, folio: 'OT-2026-012', veh: vehiculoIds[10], cli: clienteIds[4], rec: empleadoIds[4], asig: empleadoIds[3],
    estatus: 'Terminada', entrada: threeWeeksAgo.toISOString(), prometida: lastWeek.toISOString(), entrega: yesterday.toISOString(),
    km: 72500, diag: 'Afinacion mayor completa', obs: 'Afinacion terminada, listo para entrega', mano: 1500, ref: 1380, total: 2880 },
  { id: 12, folio: 'OT-2026-013', veh: vehiculoIds[11], cli: clienteIds[3], rec: empleadoIds[2], asig: empleadoIds[1],
    estatus: 'EsperaRefacciones', entrada: twoWeeksAgo.toISOString(), prometida: nextWeek.toISOString(), entrega: null,
    km: 22500, diag: 'Fuga en radiador', obs: 'Esperando radiador de aluminio', mano: 1200, ref: 2200, total: 3400 },
  { id: 13, folio: 'OT-2026-014', veh: vehiculoIds[12], cli: clienteIds[9], rec: empleadoIds[4], asig: null,
    estatus: 'Recibida', entrada: today.toISOString(), prometida: nextWeek.toISOString(), entrega: null,
    km: 30000, diag: null, obs: 'Revision general de 30,000 km', mano: 0, ref: 0, total: 0 },
];

const ordenIds = [];
for (const o of ordenesData) {
  insertOrden.run(
    o.id, o.folio, o.veh, o.cli, o.rec, o.asig, o.estatus,
    o.entrada, o.prometida, o.entrega, o.km, o.diag, o.obs,
    o.mano, o.ref, o.total, now, now
  );
  ordenIds.push(o.id);
}

// --- ORDEN DETALLES ---
const insertDetalle = db.prepare(`INSERT INTO OrdenDetalles (OrdenTrabajoId, Tipo, ServicioId, RefaccionId, Cantidad, PrecioUnitario, Subtotal, Notas, FechaCreacion, FechaActualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const detallesData = [
  [ordenIds[2], 'Servicio', 3, null, 1, 800, 800, 'Frenos delanteros', now, now],
  [ordenIds[2], 'Servicio', 6, null, 1, 700, 700, 'Frenos traseros', now, now],
  [ordenIds[2], 'Refaccion', null, 3, 1, 650, 650, 'Balatas delanteras', now, now],
  [ordenIds[2], 'Refaccion', null, 6, 1, 450, 450, 'Balatas traseras', now, now],
  [ordenIds[3], 'Servicio', 8, null, 1, 1800, 1800, 'Cambio de amortiguadores', now, now],
  [ordenIds[3], 'Refaccion', null, 8, 2, 1100, 2200, 'Amortiguadores delanteros', now, now],
  [ordenIds[4], 'Servicio', 1, null, 1, 500, 500, 'Cambio de aceite', now, now],
  [ordenIds[4], 'Refaccion', null, 1, 1, 380, 380, 'Aceite sintetico', now, now],
  [ordenIds[4], 'Refaccion', null, 2, 1, 220, 220, 'Filtro de aceite nuevo', now, now],
  [ordenIds[5], 'Servicio', 10, null, 1, 800, 800, 'Diagnostico de enfriamiento', now, now],
  [ordenIds[5], 'Refaccion', null, 15, 1, 280, 280, 'Termostato nuevo', now, now],
  [ordenIds[5], 'Refaccion', null, 5, 1, 250, 250, 'Anticongelante', now, now],
  [ordenIds[7], 'Servicio', 10, null, 1, 1500, 1500, 'Revision electrica', now, now],
  [ordenIds[7], 'Refaccion', null, 14, 1, 4200, 4200, 'Alternador reconstruido', now, now],
  [ordenIds[9], 'Servicio', 11, null, 1, 3500, 3500, 'Cambio de clutch', now, now],
  [ordenIds[9], 'Refaccion', null, 9, 1, 2800, 2800, 'Kit de clutch', now, now],
  [ordenIds[10], 'Servicio', 9, null, 1, 1500, 1500, 'Afinacion mayor', now, now],
  [ordenIds[10], 'Refaccion', null, 1, 1, 380, 380, 'Aceite 10W-30', now, now],
  [ordenIds[10], 'Refaccion', null, 2, 1, 220, 220, 'Filtro de aceite', now, now],
  [ordenIds[10], 'Refaccion', null, 4, 1, 300, 300, 'Filtro de aire', now, now],
  [ordenIds[10], 'Refaccion', null, 5, 1, 250, 250, 'Anticongelante', now, now],
  [ordenIds[10], 'Refaccion', null, 10, 1, 180, 180, 'Filtro de combustible', now, now],
];
for (const d of detallesData) {
  insertDetalle.run(...d);
}

// --- MOVIMIENTOS DE INVENTARIO ---
const insertMov = db.prepare(`INSERT INTO InventarioMovimientos (RefaccionId, TipoMovimiento, Cantidad, PrecioUnitario, Motivo, OrdenTrabajoId, FechaMovimiento, FechaCreacion, FechaActualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const movimientosData = [
  [1, 'Entrada', 25, 200, 'Reabastecimiento inicial', null, now, now, now],
  [2, 'Entrada', 30, 120, 'Reabastecimiento inicial', null, now, now, now],
  [3, 'Entrada', 12, 350, 'Reabastecimiento inicial', null, now, now, now],
  [6, 'Entrada', 20, 250, 'Compra proveedor AutoZone', null, now, now, now],
  [8, 'Entrada', 8, 600, 'Pedido amortiguadores', null, now, now, now],
  [14, 'Entrada', 5, 2500, 'Pedido alternadores reconstruidos', null, now, now, now],
  [1, 'Salida', 1, 380, 'Uso en OT-2026-006', ordenIds[4], now, now, now],
  [2, 'Salida', 1, 220, 'Uso en OT-2026-006', ordenIds[4], now, now, now],
  [15, 'Salida', 1, 280, 'Uso en OT-2026-007', ordenIds[5], now, now, now],
  [5, 'Salida', 1, 250, 'Uso en OT-2026-007', ordenIds[5], now, now, now],
  [3, 'Salida', 1, 650, 'Uso en OT-2026-004', ordenIds[2], now, now, now],
  [8, 'Salida', 2, 1100, 'Uso en OT-2026-005', ordenIds[3], now, now, now],
  [4, 'Ajuste', -2, 200, 'Ajuste por inventario fisico', null, now, now, now],
];
for (const m of movimientosData) {
  insertMov.run(...m);
}

// --- CITAS (todos los estatus) ---
const insertCita = db.prepare(`INSERT INTO Citas (ClienteId, VehiculoId, EmpleadoId, FechaHora, DuracionMinutos, Estatus, Motivo, Observaciones, OrdenTrabajoId, FechaCreacion, FechaActualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const manana9am = new Date(today); manana9am.setHours(9, 0, 0, 0);
const manana11am = new Date(today); manana11am.setHours(11, 0, 0, 0);
const pasadoManana = new Date(today); pasadoManana.setDate(pasadoManana.getDate() + 2); pasadoManana.setHours(10, 0, 0, 0);
const hoy2pm = new Date(today); hoy2pm.setHours(14, 0, 0, 0);
const ayer10am = new Date(yesterday); ayer10am.setHours(10, 0, 0, 0);
const semanaPasada = new Date(lastWeek); semanaPasada.setHours(9, 30, 0, 0);

const citasData = [
  [1, 1, empleadoIds[1], manana9am.toISOString(), 60, 'Programada', 'Cambio de aceite sintetico', 'Traer factura de ultimo servicio', null],
  [clienteIds[1], vehiculoIds[1], empleadoIds[3], manana11am.toISOString(), 90, 'Confirmada', 'Revision de transmision', 'Cliente confirma asistencia', null],
  [clienteIds[2], vehiculoIds[2], empleadoIds[1], hoy2pm.toISOString(), 120, 'EnProceso', 'Servicio de frenos completo', 'Se estan instalando las balatas', null],
  [clienteIds[4], vehiculoIds[5], empleadoIds[3], semanaPasada.toISOString(), 60, 'Completada', 'Cambio de anticongelante', 'Servicio completado exitosamente', null],
  [clienteIds[5], vehiculoIds[6], null, ayer10am.toISOString(), 60, 'Cancelada', 'Alineacion y balanceo', 'Cliente cancelo por agenda personal', null],
  [clienteIds[8], vehiculoIds[9], empleadoIds[1], pasadoManana.toISOString(), 90, 'Programada', 'Revision general 5000 km', 'Primer servicio de la CR-V', null],
  [clienteIds[9], vehiculoIds[12], empleadoIds[3], manana9am.toISOString(), 60, 'Confirmada', 'Diagnostico de suspension', 'Ruido en llanta delantera', null],
];
for (const c of citasData) {
  insertCita.run(...c, now, now);
}

// --- FACTURAS (todos los estatus) ---
const insertFactura = db.prepare(`INSERT INTO Facturas (Id, Folio, OrdenTrabajoId, ClienteId, FechaFacturacion, Subtotal, IVA, Total, Estatus, MetodoPago, FechaPago, Observaciones, FechaCreacion, FechaActualizacion) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const facturasData = [
  { id: 1, folio: 'FAC-2026-001', orden: ordenIds[4], cli: clienteIds[3],
    fecha: yesterday.toISOString(), sub: 1100, iva: 176, total: 1276,
    estatus: 'Pendiente', metodo: null, fpago: null, obs: 'Pendiente de pago' },
  { id: 2, folio: 'FAC-2026-002', orden: ordenIds[5], cli: clienteIds[4],
    fecha: twoWeeksAgo.toISOString(), sub: 1330, iva: 212.8, total: 1542.8,
    estatus: 'Pagada', metodo: 'Efectivo', fpago: twoWeeksAgo.toISOString(), obs: 'Pagado en efectivo' },
  { id: 3, folio: 'FAC-2026-003', orden: ordenIds[6], cli: clienteIds[5],
    fecha: twoWeeksAgo.toISOString(), sub: 0, iva: 0, total: 0,
    estatus: 'Cancelada', metodo: null, fpago: null, obs: 'Orden cancelada por el cliente' },
  { id: 4, folio: 'FAC-2026-004', orden: ordenIds[10], cli: clienteIds[4],
    fecha: lastWeek.toISOString(), sub: 2880, iva: 460.8, total: 3340.8,
    estatus: 'Pagada', metodo: 'Transferencia', fpago: lastWeek.toISOString(), obs: 'Transferencia bancaria recibida' },
];

const facturaIds = [];
for (const f of facturasData) {
  insertFactura.run(
    f.id, f.folio, f.orden, f.cli, f.fecha, f.sub, f.iva, f.total,
    f.estatus, f.metodo, f.fpago, f.obs, now, now
  );
  facturaIds.push(f.id);
}

// --- FACTURA DETALLES ---
const insertFacturaDetalle = db.prepare(`INSERT INTO FacturaDetalles (FacturaId, Concepto, Cantidad, PrecioUnitario, Subtotal, FechaCreacion, FechaActualizacion) VALUES (?, ?, ?, ?, ?, ?, ?)`);

const facturaDetallesData = [
  [facturaIds[0], 'Cambio de aceite sintetico', 1, 500, 500, now, now],
  [facturaIds[0], 'Aceite 10W-30', 1, 380, 380, now, now],
  [facturaIds[0], 'Filtro de aceite', 1, 220, 220, now, now],
  [facturaIds[1], 'Diagnostico de enfriamiento', 1, 800, 800, now, now],
  [facturaIds[1], 'Termostato nuevo', 1, 280, 280, now, now],
  [facturaIds[1], 'Anticongelante', 1, 250, 250, now, now],
  [facturaIds[3], 'Afinacion mayor completa', 1, 1500, 1500, now, now],
  [facturaIds[3], 'Aceite 10W-30', 1, 380, 380, now, now],
  [facturaIds[3], 'Filtro de aceite', 1, 220, 220, now, now],
  [facturaIds[3], 'Filtro de aire', 1, 300, 300, now, now],
  [facturaIds[3], 'Anticongelante', 1, 250, 250, now, now],
  [facturaIds[3], 'Filtro de combustible', 1, 180, 180, now, now],
];
for (const fd of facturaDetallesData) {
  insertFacturaDetalle.run(...fd);
}

console.log('');
console.log('=== RESUMEN DE DATOS INSERTADOS ===');
console.log('Usuarios:        ', db.prepare('SELECT COUNT(*) as c FROM Usuarios').get().c);
console.log('Empleados:       ', db.prepare('SELECT COUNT(*) as c FROM Empleados').get().c);
console.log('Clientes:        ', db.prepare('SELECT COUNT(*) as c FROM Clientes').get().c);
console.log('Vehiculos:       ', db.prepare('SELECT COUNT(*) as c FROM Vehiculos').get().c);
console.log('Servicios:       ', db.prepare('SELECT COUNT(*) as c FROM Servicios').get().c);
console.log('Refacciones:     ', db.prepare('SELECT COUNT(*) as c FROM Refacciones').get().c);
console.log('Ordenes Trabajo: ', db.prepare('SELECT COUNT(*) as c FROM OrdenesTrabajo').get().c);
console.log('  - Recibida:    ', db.prepare("SELECT COUNT(*) as c FROM OrdenesTrabajo WHERE Estatus = 'Recibida'").get().c);
console.log('  - Diagnostico: ', db.prepare("SELECT COUNT(*) as c FROM OrdenesTrabajo WHERE Estatus = 'Diagnostico'").get().c);
console.log('  - EnProceso:   ', db.prepare("SELECT COUNT(*) as c FROM OrdenesTrabajo WHERE Estatus = 'EnProceso'").get().c);
console.log('  - EsperaRefac: ', db.prepare("SELECT COUNT(*) as c FROM OrdenesTrabajo WHERE Estatus = 'EsperaRefacciones'").get().c);
console.log('  - Terminada:   ', db.prepare("SELECT COUNT(*) as c FROM OrdenesTrabajo WHERE Estatus = 'Terminada'").get().c);
console.log('  - Entregada:   ', db.prepare("SELECT COUNT(*) as c FROM OrdenesTrabajo WHERE Estatus = 'Entregada'").get().c);
console.log('  - Cancelada:   ', db.prepare("SELECT COUNT(*) as c FROM OrdenesTrabajo WHERE Estatus = 'Cancelada'").get().c);
console.log('Citas:           ', db.prepare('SELECT COUNT(*) as c FROM Citas').get().c);
console.log('  - Programada:  ', db.prepare("SELECT COUNT(*) as c FROM Citas WHERE Estatus = 'Programada'").get().c);
console.log('  - Confirmada:  ', db.prepare("SELECT COUNT(*) as c FROM Citas WHERE Estatus = 'Confirmada'").get().c);
console.log('  - EnProceso:   ', db.prepare("SELECT COUNT(*) as c FROM Citas WHERE Estatus = 'EnProceso'").get().c);
console.log('  - Completada:  ', db.prepare("SELECT COUNT(*) as c FROM Citas WHERE Estatus = 'Completada'").get().c);
console.log('  - Cancelada:   ', db.prepare("SELECT COUNT(*) as c FROM Citas WHERE Estatus = 'Cancelada'").get().c);
console.log('Facturas:        ', db.prepare('SELECT COUNT(*) as c FROM Facturas').get().c);
console.log('  - Pendiente:   ', db.prepare("SELECT COUNT(*) as c FROM Facturas WHERE Estatus = 'Pendiente'").get().c);
console.log('  - Pagada:      ', db.prepare("SELECT COUNT(*) as c FROM Facturas WHERE Estatus = 'Pagada'").get().c);
console.log('  - Cancelada:   ', db.prepare("SELECT COUNT(*) as c FROM Facturas WHERE Estatus = 'Cancelada'").get().c);
console.log('Movimientos:     ', db.prepare('SELECT COUNT(*) as c FROM InventarioMovimientos').get().c);

db.close();
console.log('');
console.log('Base de datos actualizada correctamente.');
