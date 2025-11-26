# AGENTS.md - Pages Layer

## Propósito de esta capa

Las **Pages** pertenecen a la **Presentation Layer** y son responsables de:

- Manejar rutas del Next.js App Router
- Realizar data fetching en el servidor (Server-Side Rendering)
- Renderizar páginas completas que pueden incluir múltiples componentes
- Definir metadata y configuraciones de ruta

## Reglas generales de TypeScript y Next.js

### TypeScript

- **Usar TypeScript para todo el código**
- **Preferir interfaces sobre types**
- **Interfaces DEBEN estar en PascalCase y SIEMPRE comenzar con prefijo "I"**
  - ✅ `IPageProps`, `IUserPageParams`, `IMetadata`
  - ❌ `PageProps`, `UserPageParams`, `Metadata`
- **Types deben estar en PascalCase cuando se usan para formas de objetos o unions**
- **Evitar enums; usar maps en su lugar**

### Estructura de código

- Escribir código TypeScript conciso y técnico con ejemplos precisos
- Usar patrones funcionales y declarativos; evitar clases
- Preferir iteración y modularización sobre duplicación de código
- Usar nombres de variables descriptivos con verbos auxiliares (e.g., `isLoading`, `hasError`)

### Next.js App Router

- **Las pages SON Server Components por defecto** - No necesitas 'use client' a menos que uses hooks o APIs del navegador
- **Export default function** para el componente de página
- **Usar async/await** para data fetching en el servidor
- **Metadata puede ser exportada** como objeto estático o función

## Accesos permitidos

Puedes importar y usar:

- ✅ **Services** (`services/*`) - **OBLIGATORIO para datos y operaciones**
- ✅ **Session helpers** - Excepciones permitidas:
  - `getCurrentUser()` from `@/repositories/auth/session`
  - `getCurrentUserId()` from `@/lib/session`
- ✅ **Types** (`types/*`)
- ✅ **Utilities** (`lib/utils.ts`)
- ✅ **Components** (`components/*`)
- ✅ **Next.js utilities** (`next/...`)

## Accesos prohibidos

**NUNCA** importes o uses:

- ❌ **Repositories** (`repositories/*`) - **DEBES usar Services** (excepto `getCurrentUser()`)
- ❌ **Clients** (`clients/*`) - **DEBES usar Services**
- ❌ **Consultas directas a base de datos** (`sql`, `db`)
- ❌ **Llamadas directas a APIs** (`fetch`, `axios`, etc.)

### Excepción: Session helpers

Las siguientes funciones de sesión son excepciones y pueden ser accedidas:

- `getCurrentUser()` from `@/repositories/auth/session` - ✅ Permitido
- `getCurrentUserId()` from `@/lib/session` - ✅ Permitido

**Razón:** Estas son funciones utilitarias, no lógica de negocio, y son comúnmente necesarias en todas las capas.

### Excepción: Type-only imports

Puedes importar **solo tipos** desde cualquier capa:

```typescript
// ✅ GOOD: Importación de tipo solamente
import type { IAuthUser } from "@/repositories/auth"; // Solo tipos permitidos

import type { IProduct } from "@/types/catalog";
```

## Reglas específicas de pages

### Server Components por defecto

- **Las pages SON Server Components** - No necesitas marcar con 'use client'
- **Pueden ser async** - Usa async/await directamente en el componente
- **Acceso directo a base de datos en servidor** - Pero a través de Services, NO directamente

### Data fetching

- **Hacer data fetching en el servidor** usando async/await
- **Usar Services** para todas las operaciones de datos
- **No usar useEffect para data fetching** - Esto es para Client Components

### Manejo de parámetros

- **Params del App Router** - Accede a través de props: `{ params }: { params: { id: string } }`
- **Search params** - Usa `searchParams` prop o `nuqs` para manejo de estado

### Metadata y SEO

- **Exportar metadata estática o dinámica**
- **Generar metadata dinámica** usando la función `generateMetadata` cuando sea necesario

## Ejemplos de código

### ✅ GOOD: Page usando service

```typescript
import { catalogService } from "@/services/catalog";
import { projectService } from "@/services/projects";
import { getCurrentUser } from "@/repositories/auth/session"; // ✅ Excepción permitida
import type { IProduct } from "@/types/catalog";
import { ProductList } from "@/components/product-list";

interface ICatalogPageProps {
  params: {
    projectId: string;
    catalogId: string;
  };
}

export default async function CatalogPage({ params }: ICatalogPageProps) {
  const user = await getCurrentUser(); // ✅ Excepción permitida

  // ✅ GOOD: Usando service
  await projectService.verifyAccess(params.projectId, user.id);
  const catalog = await catalogService.getCatalogById(params.catalogId);
  const products = await catalogService.getProductsByCatalog(params.catalogId);

  return (
    <div>
      <h1>{catalog.name}</h1>
      <ProductList products={products} />
    </div>
  );
}
```

### ❌ BAD: Page accediendo repository directamente

```typescript
// ❌ VIOLACIÓN: Importando repository
import {
  findCatalogById,
  findProductsByCatalogId,
} from "@/repositories/catalog";

export default async function CatalogPage({ params }: ICatalogPageProps) {
  // ❌ VIOLACIÓN: Acceso directo a repository
  const catalog = await findCatalogById(params.catalogId);
  const products = await findProductsByCatalogId(params.catalogId);
  // ...
}
```

### ✅ GOOD: Page con metadata

```typescript
import { catalogService } from "@/services/catalog";
import type { Metadata } from "next";

interface ICatalogPageProps {
  params: {
    catalogId: string;
  };
}

export async function generateMetadata({ params }: ICatalogPageProps): Promise<Metadata> {
  const catalog = await catalogService.getCatalogById(params.catalogId);

  return {
    title: catalog.name,
    description: catalog.description,
  };
}

export default async function CatalogPage({ params }: ICatalogPageProps) {
  const catalog = await catalogService.getCatalogById(params.catalogId);

  return (
    <div>
      <h1>{catalog.name}</h1>
    </div>
  );
}
```

### ✅ GOOD: Page con search params

```typescript
import { catalogService } from "@/services/catalog";
import { parseAsString, useQueryState } from "nuqs"; // Para Client Components

interface IProductsPageProps {
  params: {
    catalogId: string;
  };
  searchParams: {
    category?: string;
    search?: string;
  };
}

export default async function ProductsPage({
  params,
  searchParams
}: IProductsPageProps) {
  // ✅ GOOD: Usando searchParams del App Router
  const products = await catalogService.getProductsByCatalog(
    params.catalogId,
    {
      category: searchParams.category,
      search: searchParams.search,
    }
  );

  return (
    <div>
      <h1>Products</h1>
      <ProductList products={products} />
    </div>
  );
}
```

### ❌ BAD: Page usando fetch directamente

```typescript
// ❌ VIOLACIÓN: Llamada directa a API
export default async function CatalogPage({ params }: ICatalogPageProps) {
  // ❌ VIOLACIÓN: Debe usar service
  const response = await fetch(`/api/catalog/${params.catalogId}`);
  const catalog = await response.json();
  // ...
}
```

### ✅ GOOD: Page con manejo de errores

```typescript
import { catalogService } from "@/services/catalog";
import { notFound } from "next/navigation";

export default async function CatalogPage({ params }: ICatalogPageProps) {
  try {
    const catalog = await catalogService.getCatalogById(params.catalogId);

    if (!catalog) {
      notFound();
    }

    return (
      <div>
        <h1>{catalog.name}</h1>
      </div>
    );
  } catch (error) {
    // Manejo de errores
    notFound();
  }
}
```

## Nomenclatura de archivos

- **Archivo de página:** `page.tsx` (nombre fijo requerido por Next.js)
- **Archivo de layout:** `layout.tsx`
- **Archivo de metadata:** `opengraph-image.tsx`, `icon.tsx`, etc.
- **Rutas dinámicas:** `[id]/page.tsx`, `[slug]/page.tsx`
- **Rutas catch-all:** `[...slug]/page.tsx`

## Estructura de rutas

```
app/
  dashboard/
    page.tsx              # /dashboard
    [projectId]/
      page.tsx            # /dashboard/[projectId]
      catalog/
        page.tsx          # /dashboard/[projectId]/catalog
        [catalogId]/
          page.tsx        # /dashboard/[projectId]/catalog/[catalogId]
```

## Checklist antes de commitear

Antes de hacer commit, verifica:

- [ ] La page NO importa de `repositories/` (excepto `getCurrentUser()` y type-only imports)
- [ ] La page NO importa de `clients/`
- [ ] La page NO usa `fetch()` o `axios` directamente
- [ ] La page usa Services para todas las operaciones de datos
- [ ] La page es un Server Component (no tiene 'use client' innecesario)
- [ ] Interfaces usan prefijo "I" (e.g., `ICatalogPageProps`)
- [ ] La page exporta default function
- [ ] Data fetching se hace en el servidor con async/await
- [ ] Params y searchParams están correctamente tipados
- [ ] Metadata está exportada si es necesaria

## Flujo de datos

```
Usuario visita ruta
  ↓
Page (Server Component) carga datos usando Services
  ↓
Service orquesta lógica usando Repositories/Clients
  ↓
Response fluye de vuelta: Service → Page → Component
```

**Recuerda:** Las pages NO deben conocer la implementación de datos o APIs externas. Solo deben llamar a Services.
