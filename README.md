# Portal Soporte Onsite
### Hipermercados Tottus S.A. — Sistemas de la Información

[![React](https://img.shields.io/badge/React-19.0-61dafb.svg?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38bdf8.svg?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-00236f.svg)]()

Sistema integral de gestión de activos, mantenimiento preventivo/correctivo, mesa de ayuda (helpdesk), generación de informes técnicos y supervisión operativa en las **90 tiendas a nivel nacional** de Hipermercados Tottus S.A.

---

## 📋 Módulos del Sistema

1. **Dashboard Operativo & KPIs en Tiempo Real**
   - Monitoreo de disponibilidad (Uptime global), OTs pendientes, tickets críticos y alertas activas.
   - Indicadores de criticidad por tienda (Lima Metropolitana y Provincias).

2. **Inventario de Activos (20 Categorías Industriales & TI)**
   - Catálogo maestro de equipos con códigos QR, marca, modelo, número de serie, criticidad y ciclo de vida.
   - Escáner QR integrado para identificación rápida de equipos en piso de venta y cuartos técnicos.
   - Exportación de catálogo completo a CSV.

3. **Mantenimiento & Órdenes de Trabajo (OT)**
   - Programación de mantenimientos preventivos, correctivos, calibraciones e inspecciones.
   - Checklists interactivos de verificación con cálculo de porcentaje de avance.

4. **Helpdesk & Mesa de Ayuda Onsite**
   - Registro y seguimiento de tickets de incidencia con control de SLA por criticidad (Crítica, Alta, Media, Baja).
   - Asignación a técnicos de soporte y cambio de estados (Abierto, Asignado, En Progreso, Resuelto, Cerrado).

5. **Generador de Informes Técnicos Oficiales (PDF)**
   - Emisión de informes técnicos descargables en PDF con formato corporativo de Hipermercados Tottus S.A.
   - Inclusión de mediciones instrumentales, pruebas de aislamiento, calibraciones y doble firma digital (Técnico especialista y Supervisor/Gerente de Tienda).

6. **Directorio de Personal & Especialistas**
   - Gestión de técnicos, supervisores de zona y roles operativos.

7. **Conector Microsoft 365 (SharePoint Online / Microsoft Dataverse)**
   - Integración nativa con listas de SharePoint Online (`CMMS_Activos`, `CMMS_Tickets`, `CMMS_OTs`).
   - Soporte para Microsoft Dataverse (Common Data Service) y Webhooks de Power Automate.
   - Descarga de esquemas normalizados JSON y plantillas CSV para importación masiva.

---

## 🚀 Requisitos Previos

- **Node.js**: Versión 18.x o superior (recomendado 20.x LTS)
- **npm** (versión 9 o superior) o **pnpm** / **yarn**
- **Git** instalado en tu computadora

---

## 🛠️ Instalación y Puesta en Marcha Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO_O_ORGANIZACION/portal-soporte-onsite-tottus.git
cd portal-soporte-onsite-tottus
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno (Opcional)
Si te conectarás a SharePoint o Dataverse, copia el archivo de ejemplo:
```bash
cp .env.example .env
```

### 4. Iniciar en modo desarrollo
```bash
npm run dev
```
La aplicación se ejecutará localmente en:
👉 `http://localhost:3000`

---

## 📦 Compilación para Producción

Para generar los archivos estáticos optimizados para despliegue:
```bash
npm run build
```
Los archivos de distribución se generarán en la carpeta `dist/`.

Para validar tipos y sintaxis sin compilar:
```bash
npm run lint
```

---

## 🌐 Opciones de Despliegue

### Opción A: Despliegue en Google Cloud Run / Docker
La aplicación cuenta con servidor Node/Express para servir los archivos compilados:
```bash
npm start
```

### Opción B: Azure Static Web Apps / AWS Amplify / Vercel / Netlify
Basta con configurar:
- **Build command**: `npm run build`
- **Output directory**: `dist`

---

## 📂 Estructura del Proyecto

```text
├── src/
│   ├── components/            # Componentes React de las vistas y modales
│   │   ├── DashboardView.tsx       # Métricas, KPIs y gráficas
│   │   ├── InventoryView.tsx       # Catálogo de 20 categorías de equipos
│   │   ├── MaintenanceView.tsx     # Órdenes de trabajo y checklists
│   │   ├── HelpdeskView.tsx        # Mesa de ayuda y tickets SLA
│   │   ├── ReportsView.tsx         # Historial y emisión de informes
│   │   ├── StoresView.tsx          # Gestión de las 90 tiendas Tottus
│   │   ├── UsersView.tsx           # Directorio de personal técnico
│   │   ├── QRScannerModal.tsx      # Lector de códigos QR de activos
│   │   ├── SharePointDataverseModal.tsx # Conector Microsoft 365
│   │   ├── Sidebar.tsx             # Navegación principal de escritorio
│   │   └── MobileHeader.tsx        # Cabecera responsive para móviles
│   ├── data/
│   │   └── mockData.ts        # Base de datos inicial (90 tiendas, equipos, OTs)
│   ├── services/
│   │   └── microsoftDataService.ts # Conexión a Dataverse, SharePoint y Webhooks
│   ├── utils/
│   │   └── helpers.ts         # Generador de PDF oficial Tottus con jsPDF
│   ├── types.ts               # Definición de tipos TypeScript del CMMS
│   ├── App.tsx                # Componente raíz y orquestación de estado
│   └── main.tsx               # Punto de entrada Vite/React
├── index.html                 # Plantilla HTML con metadata institucional
├── package.json               # Dependencias y scripts de construcción
├── vite.config.ts             # Configuración de compilación Vite
└── README.md                  # Documentación del proyecto
```

---

## 🏢 Créditos & Información Institucional

- **Organización**: Hipermercados Tottus S.A.
- **Área**: Sistemas de la Información / Soporte Onsite
- **Plataforma**: Portal Soporte Onsite
