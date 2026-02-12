# NOVIQ Restaurant OS — Dashboard

Sistema de administración todo-en-uno para restaurantes. Dashboard profesional con conexión a Airtable.

## Stack

- **Next.js** (Pages Router)
- **React 18**
- **Tailwind CSS**
- **Airtable** (backend)
- **Vercel** (deploy)

## Arquitectura

```
Frontend (React) → API Routes (/pages/api/*) → Airtable
```

**Airtable nunca es accedido desde el frontend.** Todas las llamadas pasan por API Routes server-side.

## Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/noviq-restaurant-os.git
cd noviq-restaurant-os
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
AIRTABLE_PAT=tu_personal_access_token
AIRTABLE_BASE_ID=tu_base_id
```

**¿Dónde obtenerlos?**

- **AIRTABLE_PAT**: Ve a [airtable.com/create/tokens](https://airtable.com/create/tokens) → Crear token → Dar permisos de lectura/escritura a tu base
- **AIRTABLE_BASE_ID**: Abre tu base en Airtable → La URL será `airtable.com/appXXXXXXXXX` → El `appXXXXXXXXX` es tu Base ID

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## Deploy en Vercel

### 1. Sube a GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/tu-usuario/noviq-restaurant-os.git
git push -u origin main
```

### 2. Importar en Vercel

1. Ve a [vercel.com](https://vercel.com)
2. Importa tu repositorio
3. En **Environment Variables**, agrega:
   - `AIRTABLE_PAT`
   - `AIRTABLE_BASE_ID`
4. Deploy

## Estructura del Proyecto

```
├── components/
│   ├── Layout.js          # Sidebar + estructura principal
│   ├── KpiCard.js         # Cards de métricas
│   ├── Modal.js           # Modal reutilizable
│   ├── Toast.js           # Notificaciones
│   ├── DateFilter.js      # Filtro de fechas global
│   ├── ConfirmDialog.js   # Diálogo de confirmación
│   └── StatusBadge.js     # Badges de estado
├── lib/
│   ├── airtable.js        # Cliente Airtable (server-side)
│   └── dates.js           # Utilidades de fechas
├── pages/
│   ├── api/
│   │   ├── kpis/          # GET KPIs consolidados
│   │   ├── reservas/      # CRUD completo
│   │   ├── pedidos/       # CRUD completo
│   │   ├── inventario/    # CRUD + PATCH activar/desactivar
│   │   ├── movimientos/   # Solo lectura
│   │   ├── ventas/        # Solo lectura
│   │   ├── tareas/        # CRUD completo
│   │   └── usuarios/      # Solo lectura (para linked records)
│   ├── _app.js
│   ├── index.js           # Dashboard con KPIs
│   ├── reservas.js        # CRUD Reservas
│   ├── pedidos.js         # CRUD Pedidos
│   ├── inventario.js      # CRUD Inventario
│   ├── movimientos.js     # Solo lectura + filtros
│   ├── ventas.js          # Solo lectura + filtros
│   └── tareas.js          # CRUD Tareas
├── styles/
│   └── globals.css        # Tailwind + estilos custom
├── .env.local             # Variables de entorno (NO subir a git)
├── .gitignore
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## Tablas de Airtable

La base **Restaurant OS Noviq** debe contener:

| Tabla | Operaciones |
|-------|-------------|
| Reservas | CRUD |
| Pedidos | CRUD |
| Items | CRUD + Toggle activo |
| Movimientos | Solo lectura |
| Ventas | Solo lectura |
| Tareas | CRUD |
| Usuarios | Solo lectura |

## Módulos

| Módulo | Funcionalidad |
|--------|---------------|
| Dashboard | KPIs numéricos con filtro de fecha global |
| Reservas | Crear, editar, eliminar, cambiar estado |
| Pedidos | Crear, editar, eliminar, cambiar estado |
| Inventario | Crear, editar, activar/desactivar (sin editar stock manual) |
| Movimientos | Tabla de solo lectura con filtro de fecha y tipo |
| Ventas | Tabla de solo lectura con filtro de fecha |
| Tareas | Crear, editar, eliminar, múltiples responsables |

## Diseño

- Negro profundo (#0a0a0a / #0f0f0f)
- Detalles dorados (#c9952c)
- Textos blancos
- Estilo premium tipo Linear / SaaS

---

**NOVIQ** © 2026
