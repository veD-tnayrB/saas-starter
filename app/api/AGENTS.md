# AGENTS.md - API Routes Layer

## Propósito de esta capa

Las **API Routes** pertenecen a la **Presentation Layer** y son responsables de:
- Exponer endpoints REST API
- Manejar requests HTTP (GET, POST, PUT, DELETE, etc.)
- Validar request body y query parameters
- Retornar respuestas JSON estructuradas
- Manejar códigos de estado HTTP apropiados

## Reglas generales de TypeScript y Next.js

### TypeScript

- **Usar TypeScript para todo el código**
- **Preferir interfaces sobre types**
- **Interfaces DEBEN estar en PascalCase y SIEMPRE comenzar con prefijo "I"**
  - ✅ `IAPIResponse`, `IGetRequestParams`, `IPostRequestBody`
  - ❌ `APIResponse`, `GetRequestParams`, `PostRequestBody`
- **Types deben estar en PascalCase cuando se usan para formas de objetos o unions**
- **Evitar enums; usar maps en su lugar**

### Estructura de código

- Escribir código TypeScript conciso y técnico con ejemplos precisos
- Usar patrones funcionales y declarativos; evitar clases
- Preferir iteración y modularización sobre duplicación de código
- Usar nombres de variables descriptivos con verbos auxiliares (e.g., `isLoading`, `hasError`)

### Next.js API Routes

- **Exportar funciones HTTP** - `GET`, `POST`, `PUT`, `DELETE`, etc.
- **Usar NextRequest y NextResponse** de Next.js
- **Retornar NextResponse** con códigos de estado apropiados
- **Manejar errores** y retornar códigos de estado HTTP apropiados

## Accesos permitidos

Puedes importar y usar:

- ✅ **Services** (`services/*`) - **OBLIGATORIO para datos y operaciones**
- ✅ **Session helpers** - Excepciones permitidas:
  - `getCurrentUser()` from `@/repositories/auth/session`
  - `getCurrentUserId()` from `@/lib/session`
- ✅ **Next.js utilities:**
  - `NextRequest` from `next/server`
  - `NextResponse` from `next/server`
- ✅ **Types** (`types/*`)
- ✅ **Utilities** (`lib/utils.ts`)
- ✅ **Validation libraries** (`zod` para validación de esquemas)

## Accesos prohibidos

**NUNCA** importes o uses:

- ❌ **Repositories** (`repositories/*`) - **DEBES usar Services** (excepto `getCurrentUser()`)
- ❌ **Clients** (`clients/*`) - **DEBES usar Services**
- ❌ **Consultas directas a base de datos** (`sql`, `db`)
- ❌ **Llamadas directas a APIs** (`fetch`, `axios`, etc.) - Excepto para APIs externas a través de Clients

### Excepción: Session helpers

Las siguientes funciones de sesión son excepciones y pueden ser accedidas:

- `getCurrentUser()` from `@/repositories/auth/session` - ✅ Permitido
- `getCurrentUserId()` from `@/lib/session` - ✅ Permitido

**Razón:** Estas son funciones utilitarias, no lógica de negocio, y son comúnmente necesarias en todas las capas.

### Excepción: Type-only imports

Puedes importar **solo tipos** desde cualquier capa:

```typescript
// ✅ GOOD: Importación de tipo solamente
import type { IProduct } from "@/types/catalog";
import type { IAuthUser } from "@/repositories/auth"; // Solo tipos permitidos
```

## Reglas específicas de API routes

### Estructura de una API route

1. **Exportar funciones HTTP** - `GET`, `POST`, `PUT`, `DELETE`, `PATCH`
2. **Validar request** - Body, query params, headers según corresponda
3. **Autenticar/verificar permisos** usando session helpers
4. **Llamar a Services** para realizar operaciones
5. **Retornar NextResponse** con código de estado apropiado

### Métodos HTTP

- **GET** - Para leer recursos (no debe modificar estado)
- **POST** - Para crear recursos
- **PUT** - Para actualizar recursos completamente
- **PATCH** - Para actualizar recursos parcialmente
- **DELETE** - Para eliminar recursos

### Códigos de estado HTTP

- **200 OK** - Request exitoso
- **201 Created** - Recurso creado exitosamente
- **204 No Content** - Request exitoso sin contenido de retorno
- **400 Bad Request** - Request inválido (validación fallida)
- **401 Unauthorized** - No autenticado
- **403 Forbidden** - Autenticado pero sin permisos
- **404 Not Found** - Recurso no encontrado
- **500 Internal Server Error** - Error del servidor

### Validación

- **Validar siempre** - Request body, query params, headers según sea necesario
- **Usar zod** para validación de esquemas
- **Retornar 400** si la validación falla con mensajes claros

### Manejo de errores

- **Capturar y manejar errores** apropiadamente
- **Retornar códigos de estado HTTP apropiados**
- **No exponer detalles internos** de errores (usar mensajes genéricos en producción)

### Formato de respuesta

- **Usar formato JSON consistente**
- **Incluir metadata cuando sea útil** (pagination, timestamps, etc.)
- **Usar NextResponse.json()** para respuestas JSON

## Ejemplos de código

### ✅ GOOD: API route usando service (GET)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { catalogService } from "@/services/catalog";
import { projectService } from "@/services/projects";
import { getCurrentUserId } from "@/lib/session"; // ✅ Excepción permitida

interface IGetRequestParams {
  params: {
    projectId: string;
    catalogId: string;
  };
}

export async function GET(
  request: NextRequest,
  { params }: IGetRequestParams
) {
  try {
    // 1. Autenticar
    const userId = await getCurrentUserId();
    
    // 2. Verificar permisos
    await projectService.verifyAccess(params.projectId, userId);
    
    // 3. Obtener datos (usando service)
    const catalog = await catalogService.getCatalogById(params.catalogId);
    
    if (!catalog) {
      return NextResponse.json(
        { error: "Catalog not found" },
        { status: 404 }
      );
    }
    
    // 4. Retornar respuesta
    return NextResponse.json({ catalog }, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("access")) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### ✅ GOOD: API route usando service (POST)

```typescript
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { catalogService } from "@/services/catalog";
import { projectService } from "@/services/projects";
import { getCurrentUserId } from "@/lib/session";

const createProductSchema = z.object({
  catalogId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Validar request body
    const body = await request.json();
    const validated = createProductSchema.parse(body);
    
    // 2. Autenticar
    const userId = await getCurrentUserId();
    
    // 3. Verificar permisos
    const catalog = await catalogService.getCatalogById(validated.catalogId);
    await projectService.verifyAccess(catalog.projectId, userId);
    
    // 4. Crear recurso (usando service)
    const product = await catalogService.createProduct({
      ...validated,
      userId,
    });
    
    // 5. Retornar respuesta
    return NextResponse.json(
      { product },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid input", details: error.errors },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message.includes("access")) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### ❌ BAD: API route accediendo repository directamente

```typescript
import { NextRequest, NextResponse } from "next/server";
// ❌ VIOLACIÓN: Importando repository
import { findCatalogById } from "@/repositories/catalog";

export async function GET(
  request: NextRequest,
  { params }: IGetRequestParams
) {
  // ❌ VIOLACIÓN: Acceso directo a repository
  const catalog = await findCatalogById(params.catalogId);
  return NextResponse.json({ catalog });
}
```

### ✅ GOOD: API route con query parameters

```typescript
import { NextRequest, NextResponse } from "next/server";
import { catalogService } from "@/services/catalog";
import { z } from "zod";

const querySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().int().positive()).optional().default("1"),
  limit: z.string().transform(Number).pipe(z.number().int().positive().max(100)).optional().default("10"),
  category: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Validar query parameters
    const searchParams = request.nextUrl.searchParams;
    const query = querySchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
      category: searchParams.get("category"),
    });
    
    // 2. Obtener datos con paginación
    const result = await catalogService.getProducts({
      page: query.page,
      limit: query.limit,
      category: query.category,
    });
    
    // 3. Retornar respuesta con metadata
    return NextResponse.json({
      products: result.products,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / query.limit),
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### ✅ GOOD: API route DELETE

```typescript
import { NextRequest, NextResponse } from "next/server";
import { catalogService } from "@/services/catalog";
import { projectService } from "@/services/projects";
import { getCurrentUserId } from "@/lib/session";

interface IDeleteRequestParams {
  params: {
    productId: string;
  };
}

export async function DELETE(
  request: NextRequest,
  { params }: IDeleteRequestParams
) {
  try {
    const userId = await getCurrentUserId();
    
    const product = await catalogService.getProductById(params.productId);
    
    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }
    
    await projectService.verifyAccess(product.projectId, userId);
    
    await catalogService.deleteProduct(params.productId);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("access")) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
```

### ❌ BAD: API route usando fetch directamente para operaciones internas

```typescript
// ❌ VIOLACIÓN: Llamada directa a API interna
export async function GET(request: NextRequest) {
  // ❌ VIOLACIÓN: Debe usar service
  const response = await fetch(`/api/internal/catalog`);
  const data = await response.json();
  return NextResponse.json(data);
}
```

## Nomenclatura de archivos

- **Archivo de ruta:** `route.ts` (nombre fijo requerido por Next.js)
- **Estructura de carpetas:** `app/api/[resource]/route.ts`
- **Rutas dinámicas:** `app/api/[resource]/[id]/route.ts`
- **Rutas anidadas:** `app/api/[resource]/[id]/[action]/route.ts`

### Ejemplos de estructura

```
app/api/
  catalog/
    route.ts              # GET /api/catalog, POST /api/catalog
    [id]/
      route.ts            # GET /api/catalog/[id], PUT /api/catalog/[id], DELETE /api/catalog/[id]
  products/
    route.ts              # GET /api/products, POST /api/products
    [id]/
      route.ts            # GET /api/products/[id], PUT /api/products/[id]
      publish/
        route.ts          # POST /api/products/[id]/publish
```

## Checklist antes de commitear

Antes de hacer commit, verifica:

- [ ] La route NO importa de `repositories/` (excepto `getCurrentUser()` y type-only imports)
- [ ] La route NO importa de `clients/`
- [ ] La route NO usa `fetch()` o `axios` directamente para operaciones internas
- [ ] La route usa Services para todas las operaciones de datos
- [ ] La route valida request body/query params (preferiblemente con zod)
- [ ] La route verifica autenticación/permisos antes de operar
- [ ] La route retorna códigos de estado HTTP apropiados
- [ ] La route maneja errores apropiadamente
- [ ] La route retorna formato JSON consistente
- [ ] Interfaces usan prefijo "I" (e.g., `IGetRequestParams`)
- [ ] Se exportan funciones HTTP correctas (GET, POST, etc.)

## Flujo de datos

```
Cliente hace request HTTP
  ↓
API Route valida y llama a Service
  ↓
Service orquesta lógica usando Repositories/Clients
  ↓
Response fluye de vuelta: Service → API Route → Cliente (JSON)
```

**Recuerda:** Las API routes NO deben conocer la implementación de datos o APIs externas. Solo deben llamar a Services.

