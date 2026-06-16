-- TallerMecanico - Script de inicialización con datos semilla
-- SQLite compatible

-- Usuario admin por defecto (password: Admin123!)
-- BCrypt hash for "Admin123!": $2a$11$TVP8zdZdha54TtFCS9UTvefxg8zFyMkUxtovy.1q7l7iC/yLrGwVS

INSERT OR IGNORE INTO Usuarios (Id, Username, PasswordHash, Rol, Activo, FechaCreacion, FechaActualizacion)
VALUES (1, 'admin', '$2a$11$TVP8zdZdha54TtFCS9UTvefxg8zFyMkUxtovy.1q7l7iC/yLrGwVS', 'Admin', 1, datetime('now'), datetime('now'));

-- Empleado admin
INSERT OR IGNORE INTO Empleados (Id, Nombre, ApellidoPaterno, ApellidoMaterno, Telefono, Email, Puesto, UsuarioId, FechaCreacion, FechaActualizacion)
VALUES (1, 'Administrador', 'Sistema', NULL, '555-000-0000', 'admin@tallermecanico.com', 'Administrador', 1, datetime('now'), datetime('now'));

-- Servicios catálogo inicial
INSERT OR IGNORE INTO Servicios (Id, Nombre, Descripcion, PrecioManoObra, Activo, FechaCreacion, FechaActualizacion)
VALUES (1, 'Cambio de aceite', 'Cambio de aceite de motor con filtro', 350.00, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Servicios (Id, Nombre, Descripcion, PrecioManoObra, Activo, FechaCreacion, FechaActualizacion)
VALUES (2, 'Alineación y balanceo', 'Alineación delantera y balanceo de 4 llantas', 600.00, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Servicios (Id, Nombre, Descripcion, PrecioManoObra, Activo, FechaCreacion, FechaActualizacion)
VALUES (3, 'Frenos delanteros', 'Cambio de balatas delanteras', 800.00, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Servicios (Id, Nombre, Descripcion, PrecioManoObra, Activo, FechaCreacion, FechaActualizacion)
VALUES (4, 'Diagnóstico general', 'Revisión y diagnóstico del vehículo', 250.00, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Servicios (Id, Nombre, Descripcion, PrecioManoObra, Activo, FechaCreacion, FechaActualizacion)
VALUES (5, 'Servicio mayor', 'Cambio de bujías, filtros, anticongelante', 2500.00, 1, datetime('now'), datetime('now'));

-- Refacciones catálogo inicial
INSERT OR IGNORE INTO Refacciones (Id, Codigo, Nombre, Descripcion, PrecioCompra, PrecioVenta, StockActual, StockMinimo, Activo, FechaCreacion, FechaActualizacion)
VALUES (1, 'ACEITE-10W30', 'Aceite motor 10W30', 'Aceite sintético 5 litros', 180.00, 250.00, 20, 5, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Refacciones (Id, Codigo, Nombre, Descripcion, PrecioCompra, PrecioVenta, StockActual, StockMinimo, Activo, FechaCreacion, FechaActualizacion)
VALUES (2, 'FILTRO-OIL', 'Filtro de aceite universal', 'Filtro de aceite genérico', 45.00, 80.00, 15, 5, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Refacciones (Id, Codigo, Nombre, Descripcion, PrecioCompra, PrecioVenta, StockActual, StockMinimo, Activo, FechaCreacion, FechaActualizacion)
VALUES (3, 'BALATAS-DEL', 'Balatas delanteras', 'Juego de balatas delanteras cerámicas', 350.00, 550.00, 10, 3, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Refacciones (Id, Codigo, Nombre, Descripcion, PrecioCompra, PrecioVenta, StockActual, StockMinimo, Activo, FechaCreacion, FechaActualizacion)
VALUES (4, 'FILTRO-AIRE', 'Filtro de aire', 'Filtro de aire motor', 60.00, 120.00, 8, 3, 1, datetime('now'), datetime('now'));
INSERT OR IGNORE INTO Refacciones (Id, Codigo, Nombre, Descripcion, PrecioCompra, PrecioVenta, StockActual, StockMinimo, Activo, FechaCreacion, FechaActualizacion)
VALUES (5, 'ANTICONGEL', 'Anticongelante verde', 'Anticongelante 4 litros', 70.00, 130.00, 6, 2, 1, datetime('now'), datetime('now'));

-- Cliente de ejemplo
INSERT OR IGNORE INTO Clientes (Id, Nombre, ApellidoPaterno, ApellidoMaterno, Telefono, Email, FechaCreacion, FechaActualizacion)
VALUES (1, 'Juan', 'Pérez', 'García', '555-111-2222', 'juan.perez@email.com', datetime('now'), datetime('now'));

-- Vehículo de ejemplo
INSERT OR IGNORE INTO Vehiculos (Id, ClienteId, Marca, Modelo, Anio, Color, Placas, VIN, Kilometraje, FechaCreacion, FechaActualizacion)
VALUES (1, 1, 'Toyota', 'Corolla', 2022, 'Blanco', 'ABC-123', '1HGBH41JXMN109186', 15000, datetime('now'), datetime('now'));
