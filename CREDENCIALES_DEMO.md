# Credenciales de Demo - Portal Informes Energeia

Este archivo contiene las credenciales de prueba para acceder al sistema demo.

## Usuarios de Backoffice Energeia

### Administradora del Sistema
- **Email:** `admin@energeia.com.ar`
- **Contraseña:** Cualquier contraseña (el sistema acepta cualquier contraseña en modo demo)
- **Rol:** Backoffice
- **Nombre:** María González

### Analista de Operaciones  
- **Email:** `operaciones@energeia.com.ar`
- **Contraseña:** Cualquier contraseña
- **Rol:** Backoffice
- **Nombre:** Carlos Rodríguez

## Usuarios de Portal del Cliente

### Industrias Metalúrgicas SA
- **Admin:** `admin@industriasmetalurgicas.com.ar`
- **Usuario:** `usuario1@industriasmetalurgicas.com.ar`

### Textil del Norte SRL
- **Admin:** `admin@textildelnorte.com.ar`
- **Usuario:** `usuario1@textildelnorte.com.ar`

### Alimentos Patagónicos SA
- **Admin:** `admin@alimentospatagonicos.com.ar`
- **Usuario:** `usuario1@alimentospatagonicos.com.ar`

### Química Industrial Córdoba
- **Admin:** `admin@quimicaindustrialcordoba.com.ar`
- **Usuario:** `usuario1@quimicaindustrialcordoba.com.ar`

## Notas Importantes

1. **Contraseña:** En modo demo, el sistema acepta cualquier contraseña para usuarios existentes
2. **Roles:** 
   - Los usuarios `admin@` tienen rol de administrador de empresa
   - Los usuarios `usuario1@` tienen rol de usuario regular
   - Los usuarios `@energeia.com.ar` tienen rol de backoffice
3. **Redirección:** El sistema redirige automáticamente según el rol:
   - Backoffice → `/dashboard`
   - Cliente → `/inicio`

## Cómo probar

1. Ve a la página de login
2. Usa cualquiera de los emails listados arriba
3. Ingresa cualquier contraseña (ej: "123456")
4. El sistema te redirigirá automáticamente según tu rol

## Estado del Proyecto

✅ **Completado:**
- Autenticación simulada
- Layouts base con navegación
- Protección de rutas por rol
- Sidebar responsive con colapso
- Breadcrumbs y menú de usuario

🚧 **En desarrollo:**
- Páginas de contenido específico (próximas tareas)
- Componentes de gráficos
- Filtros y formularios