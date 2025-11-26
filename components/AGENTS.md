# AGENTS.md - Components Layer

## Propósito de esta capa

Los **Components** pertenecen a la **Presentation Layer** y son responsables de:

- Presentación de la UI al usuario
- Manejo de interacciones del usuario (clics, formularios, eventos)
- Renderizado de datos usando componentes de UI (Shadcn, Radix, Tailwind)

## Reglas generales de TypeScript y React

### TypeScript

- **Usar TypeScript para todo el código**
- **Preferir interfaces sobre types**
- **Interfaces DEBEN estar en PascalCase y SIEMPRE comenzar con prefijo "I"**
  - ✅ `IProduct`, `IUserData`, `INavigationProps`
  - ❌ `Product`, `UserData`, `NavigationProps`
- **Types deben estar en PascalCase cuando se usan para formas de objetos o unions**
- **Evitar enums; usar maps en su lugar**
- **Usar componentes funcionales con interfaces TypeScript**

### Estructura de código

- Escribir código TypeScript conciso y técnico con ejemplos precisos
- Usar patrones funcionales y declarativos; evitar clases
- Preferir iteración y modularización sobre duplicación de código
- Usar nombres de variables descriptivos con verbos auxiliares (e.g., `isLoading`, `hasError`)

### Estructura de archivos

- **UN SOLO COMPONENTE POR ARCHIVO** - Extraer UI adicional a archivos separados
- **Mantener archivos enfocados y cohesivos**
- **Componentes NO deben exceder 80 líneas** - Si un componente tiene más de 80 líneas, es una señal de que al menos un subcomponente debe ser extraído
- **Estructura de archivo:** componente exportado, subcomponentes, helpers, contenido estático, types

### Organización de componentes

- **Organizar componentes relacionados en carpetas** - Si múltiples archivos comparten un prefijo común (e.g., `project-switcher-button.tsx`, `project-switcher-empty.tsx`, `project-switcher.tsx`), deben organizarse en una carpeta con ese prefijo
- **Componente principal debe ser `index.tsx`**, subcomponentes nombrados por su sufijo (e.g., `project-switcher/button.tsx`, `project-switcher/empty.tsx`, `project-switcher/index.tsx`)
- **Anidar carpetas relacionadas cuando existe carpeta padre** - Si existe una carpeta `project/` y hay una carpeta relacionada `project-switcher/`, anidarla dentro de la padre como `project/switcher/`
- **Remover prefijos redundantes al anidar** - Si tienes `pricing/pricing-card/`, renómbralo a `pricing/card/` ya que el prefijo `pricing-` es redundante

### Nomenclatura

- Usar lowercase con dashes para directorios (e.g., `components/auth-wizard`)
- Favorecer exports nombrados para componentes

### Sintaxis y formato

- Usar la palabra clave "function" para funciones puras
- Evitar llaves innecesarias en condicionales; usar sintaxis concisa para declaraciones simples
- Usar JSX declarativo
- **NO usar condiciones ternarias directamente dentro de JSX** - Calcular valores con variables/funciones helper pequeñas antes del return
- **NO usar Array.map directamente dentro de JSX** - Extraer un subcomponente presentacional pequeño e iterar fuera del árbol JSX, o renderizar un componente de lista que reciba datos preparados

## Accesos permitidos

Puedes importar y usar:

- ✅ **Services** (`services/*`) - **OBLIGATORIO para datos y operaciones**
- ✅ **Librerías de UI** (Shadcn, Radix, Tailwind)
- ✅ **Types** (`types/*`)
- ✅ **Utilities** (`lib/utils.ts`)
- ✅ **Hooks** (`hooks/*`) - Solo hooks de React o custom hooks que no violen arquitectura

## Accesos prohibidos

**NUNCA** importes o uses:

- ❌ **Repositories** (`repositories/*`) - **DEBES usar Services**
- ❌ **Clients** (`clients/*`) - **DEBES usar Services**
- ❌ **Consultas directas a base de datos** (`sql`, `db`)
- ❌ **Llamadas directas a APIs** (`fetch`, `axios`, etc.)

### Excepción: Type-only imports

Puedes importar **solo tipos** desde cualquier capa:

```typescript
// ✅ GOOD: Importación de tipo solamente
import type { IAuthUser } from "@/repositories/auth"; // Solo tipos permitidos

import type { IProduct } from "@/types/catalog";
```

## Reglas específicas de componentes

### Server Components vs Client Components

- **Priorizar Server Components sobre Client Components**
- **Usar React Server Components (RSC) por defecto**
- **Solo usar 'use client' cuando sea absolutamente necesario:**
  - Interactividad (eventos onClick, onChange, etc.)
  - APIs del navegador (localStorage, window, etc.)
  - Hooks de React (useState, useEffect, etc.)
- **Minimizar 'use client', 'useEffect', y 'setState'**
- **Envolver componentes cliente en Suspense con fallback**
- **Usar carga dinámica para componentes no críticos**

### UI y estilos

- Usar Shadcn UI, Radix, y Tailwind para componentes y estilos
- Implementar diseño responsivo con Tailwind CSS; usar enfoque mobile-first
- Optimizar imágenes: usar formato WebP, incluir datos de tamaño, implementar lazy loading

### Optimización de rendimiento

- Optimizar Web Vitals (LCP, CLS, FID)
- Usar 'nuqs' para manejo de estado de parámetros de búsqueda en URL
- Mantener componentes pequeños y enfocados; extraer subcomponentes y utilidades para legibilidad y mantenibilidad

## Ejemplos de código

### ✅ GOOD: Component usando service

```typescript
import { catalogService } from "@/services/catalog";
import type { IProduct } from "@/types/catalog";
import { Button } from "@/components/ui/button";

interface IProductListProps {
  catalogId: string;
}

export function ProductList({ catalogId }: IProductListProps) {
  // Server Component - puede ser async
  const products = await catalogService.getProductsByCatalog(catalogId);

  // Calcular valores antes del return
  const hasProducts = products.length > 0;
  const productCount = products.length;

  if (!hasProducts) {
    return <div>No products found</div>;
  }

  return (
    <div>
      <h2>Products ({productCount})</h2>
      {/* Iterar fuera del JSX */}
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// Subcomponente extraído
function ProductCard({ product }: { product: IProduct }) {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>{product.description}</p>
    </div>
  );
}
```

### ❌ BAD: Component accediendo repository directamente

```typescript
// ❌ VIOLACIÓN: Importando repository
import { findProductsByCatalogId } from "@/repositories/catalog";

export function ProductList({ catalogId }: IProductListProps) {
  // ❌ VIOLACIÓN: Acceso directo a repository
  const products = await findProductsByCatalogId(catalogId);
  // ...
}
```

### ❌ BAD: Component usando fetch directamente

```typescript
// ❌ VIOLACIÓN: Llamada directa a API
export function ProductList({ catalogId }: IProductListProps) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // ❌ VIOLACIÓN: Debe usar service
    fetch(`/api/catalog/${catalogId}/products`)
      .then((res) => res.json())
      .then(setProducts);
  }, [catalogId]);

  // ...
}
```

### ✅ GOOD: Client Component con interactividad

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ICounterProps {
  initialValue?: number;
}

export function Counter({ initialValue = 0 }: ICounterProps) {
  const [count, setCount] = useState(initialValue);

  const increment = () => setCount(count + 1);
  const decrement = () => setCount(count - 1);

  return (
    <div>
      <p>Count: {count}</p>
      <Button onClick={increment}>+</Button>
      <Button onClick={decrement}>-</Button>
    </div>
  );
}
```

### ❌ BAD: Ternario directo en JSX

```typescript
// ❌ BAD: Ternario directo en JSX
export function ProductCard({ product }: { product: IProduct }) {
  return (
    <div>
      {product.price > 100 ? <Badge>Expensive</Badge> : <Badge>Affordable</Badge>}
    </div>
  );
}
```

### ✅ GOOD: Valor calculado antes del return

```typescript
// ✅ GOOD: Valor calculado antes del return
export function ProductCard({ product }: { product: IProduct }) {
  const priceLabel = product.price > 100 ? "Expensive" : "Affordable";
  const badgeVariant = product.price > 100 ? "destructive" : "default";

  return (
    <div>
      <Badge variant={badgeVariant}>{priceLabel}</Badge>
    </div>
  );
}
```

## Nomenclatura de archivos

- Usar lowercase con dashes para nombres de archivos: `product-list.tsx`
- Nombre del componente debe coincidir con el nombre del archivo (sin extensión): `ProductList` en `product-list.tsx`
- Para componentes en carpetas, usar `index.tsx` para el componente principal

## Checklist antes de commitear

Antes de hacer commit, verifica:

- [ ] El componente NO importa de `repositories/` (excepto type-only imports)
- [ ] El componente NO importa de `clients/`
- [ ] El componente NO usa `fetch()` o `axios` directamente
- [ ] El componente usa Services para todas las operaciones de datos
- [ ] El componente tiene máximo 80 líneas (o se extrajeron subcomponentes)
- [ ] Solo hay UN componente por archivo
- [ ] Interfaces usan prefijo "I" (e.g., `IProductListProps`)
- [ ] No hay ternarios directos en JSX
- [ ] No hay Array.map directo en JSX
- [ ] 'use client' solo se usa cuando es absolutamente necesario
- [ ] El componente sigue el patrón de Server Component por defecto

## Flujo de datos

```
Usuario interactúa con Component
  ↓
Component llama a Service
  ↓
Service orquesta lógica usando Repositories/Clients
  ↓
Response fluye de vuelta: Service → Component
```

**Recuerda:** Los componentes NO deben conocer la implementación de datos o APIs externas. Solo deben llamar a Services.
