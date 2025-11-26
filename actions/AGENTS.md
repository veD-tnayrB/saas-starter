# AGENTS.md - Server Actions Layer

## Propósito de esta capa

Las **Server Actions** pertenecen a la **Presentation Layer** y son responsables de:
- Manejar submissions de formularios desde el cliente
- Ejecutar mutaciones en el servidor
- Validar datos de entrada
- Revalidar rutas y cache después de mutaciones
- Retornar resultados de operaciones al cliente

## Reglas generales de TypeScript y Next.js

### TypeScript

- **Usar TypeScript para todo el código**
- **Preferir interfaces sobre types**
- **Interfaces DEBEN estar en PascalCase y SIEMPRE comenzar con prefijo "I"**
  - ✅ `ICreateProductActionInput`, `IActionResult`, `IFormState`
  - ❌ `CreateProductActionInput`, `ActionResult`, `FormState`
- **Types deben estar en PascalCase cuando se usan para formas de objetos o unions**
- **Evitar enums; usar maps en su lugar**

### Estructura de código

- Escribir código TypeScript conciso y técnico con ejemplos precisos
- Usar patrones funcionales y declarativos; evitar clases
- Preferir iteración y modularización sobre duplicación de código
- Usar nombres de variables descriptivos con verbos auxiliares (e.g., `isLoading`, `hasError`)

### Next.js Server Actions

- **Marcar con 'use server'** - Todas las server actions deben tener 'use server' al inicio del archivo o función
- **Pueden ser async** - Usa async/await para operaciones asíncronas
- **Validar entrada** - Siempre validar y sanitizar datos de entrada
- **Revalidar después de mutaciones** - Usar `revalidatePath` o `revalidateTag` después de cambios

## Accesos permitidos

Puedes importar y usar:

- ✅ **Services** (`services/*`) - **OBLIGATORIO para datos y operaciones**
- ✅ **Session helpers** - Excepciones permitidas:
  - `getCurrentUser()` from `@/repositories/auth/session`
  - `getCurrentUserId()` from `@/lib/session`
- ✅ **Next.js cache utilities:**
  - `revalidatePath` from `next/cache`
  - `revalidateTag` from `next/cache`
  - `redirect` from `next/navigation`
- ✅ **Types** (`types/*`)
- ✅ **Utilities** (`lib/utils.ts`)
- ✅ **Validation libraries** (`zod` para validación de esquemas)

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
import type { IProduct } from "@/types/catalog";
import type { IAuthUser } from "@/repositories/auth"; // Solo tipos permitidos
```

## Reglas específicas de server actions

### Estructura de una server action

1. **Marcar con 'use server'**
2. **Validar entrada** (preferiblemente con zod)
3. **Autenticar/verificar permisos** usando session helpers
4. **Llamar a Services** para realizar operaciones
5. **Revalidar rutas/cache** después de mutaciones
6. **Retornar resultado** con formato consistente

### Validación

- **Siempre validar datos de entrada** antes de procesarlos
- **Usar zod** para validación de esquemas
- **Retornar errores de validación** de forma clara

### Revalidación

- **Usar `revalidatePath`** después de crear/actualizar/eliminar recursos
- **Usar `revalidateTag`** si usas tags de cache
- **Revalidar rutas específicas** afectadas por la mutación

### Manejo de errores

- **Capturar y manejar errores** apropiadamente
- **Retornar mensajes de error** claros y útiles
- **No exponer detalles internos** de errores al cliente

### Formato de retorno

- **Usar formato consistente** para resultados
- **Incluir información de éxito/error**
- **Incluir datos relevantes** cuando sea apropiado

## Ejemplos de código

### ✅ GOOD: Server action usando service

```typescript
"use server";

import { catalogService } from "@/services/catalog";
import { projectService } from "@/services/projects";
import { getCurrentUserId } from "@/lib/session"; // ✅ Excepción permitida
import { revalidatePath } from "next/cache";
import { z } from "zod";

const createProductSchema = z.object({
  catalogId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  price: z.number().positive(),
});

interface ICreateProductActionInput {
  catalogId: string;
  name: string;
  description?: string;
  price: number;
}

interface IActionResult {
  success: boolean;
  error?: string;
  product?: {
    id: string;
    name: string;
  };
}

export async function createProductAction(
  input: ICreateProductActionInput
): Promise<IActionResult> {
  try {
    // 1. Validar entrada
    const validated = createProductSchema.parse(input);
    
    // 2. Autenticar
    const userId = await getCurrentUserId();
    
    // 3. Verificar permisos (usando service)
    const catalog = await catalogService.getCatalogById(validated.catalogId);
    await projectService.verifyAccess(catalog.projectId, userId);
    
    // 4. Realizar operación (usando service)
    const product = await catalogService.createProduct({
      ...validated,
      userId,
    });
    
    // 5. Revalidar rutas
    revalidatePath(`/dashboard/${catalog.projectId}/catalog/${validated.catalogId}`);
    
    // 6. Retornar resultado
    return {
      success: true,
      product: {
        id: product.id,
        name: product.name,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Invalid input",
      };
    }
    
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
```

### ❌ BAD: Server action accediendo repository directamente

```typescript
"use server";

// ❌ VIOLACIÓN: Importando repository
import { createProduct } from "@/repositories/catalog";

export async function createProductAction(input: ICreateProductActionInput) {
  // ❌ VIOLACIÓN: Acceso directo a repository
  const product = await createProduct(input);
  // ...
}
```

### ✅ GOOD: Server action con validación robusta

```typescript
"use server";

import { z } from "zod";
import { updateProductService } from "@/services/catalog";
import { revalidatePath } from "next/cache";

const updateProductSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  price: z.number().positive().optional(),
}).refine(
  (data) => data.name !== undefined || data.price !== undefined,
  { message: "At least one field must be provided" }
);

export async function updateProductAction(
  input: z.infer<typeof updateProductSchema>
) {
  const validated = updateProductSchema.parse(input);
  
  const product = await updateProductService(validated.id, {
    name: validated.name,
    price: validated.price,
  });
  
  revalidatePath(`/products/${product.id}`);
  
  return { success: true, product };
}
```

### ✅ GOOD: Server action con revalidación múltiple

```typescript
"use server";

import { deleteProductService } from "@/services/catalog";
import { revalidatePath, revalidateTag } from "next/cache";

export async function deleteProductAction(productId: string) {
  const product = await deleteProductService(productId);
  
  // Revalidar múltiples rutas afectadas
  revalidatePath(`/dashboard/${product.projectId}/catalog/${product.catalogId}`);
  revalidatePath(`/dashboard/${product.projectId}/catalog`);
  revalidateTag(`products-${product.catalogId}`);
  
  return { success: true };
}
```

### ❌ BAD: Server action usando fetch directamente

```typescript
"use server";

// ❌ VIOLACIÓN: Llamada directa a API
export async function createProductAction(input: ICreateProductActionInput) {
  // ❌ VIOLACIÓN: Debe usar service
  const response = await fetch("/api/products", {
    method: "POST",
    body: JSON.stringify(input),
  });
  // ...
}
```

### ✅ GOOD: Server action con redirect

```typescript
"use server";

import { createProductService } from "@/services/catalog";
import { redirect } from "next/navigation";

export async function createProductAndRedirect(input: ICreateProductActionInput) {
  const product = await createProductService(input);
  
  // Redirect después de creación exitosa
  redirect(`/dashboard/products/${product.id}`);
}
```

## Nomenclatura de archivos

- **Nombre descriptivo del action** - `create-product.ts`, `update-user.ts`
- **Sin prefijo redundante** - Si está en `actions/catalog/`, usar `create.ts` no `create-catalog.ts`
- **Usar lowercase con dashes** - `delete-product.ts`, `update-settings.ts`

### Ejemplos de nomenclatura

```
actions/
  create-project.ts           # ✅ Root level, necesita contexto
  delete-project.ts           # ✅ Root level, necesita contexto
  catalog/
    create.ts                 # ✅ Ya está en carpeta catalog/
    update.ts                 # ✅ Ya está en carpeta catalog/
    delete.ts                 # ✅ Ya está en carpeta catalog/
```

## Checklist antes de commitear

Antes de hacer commit, verifica:

- [ ] La action tiene 'use server' marcado
- [ ] La action NO importa de `repositories/` (excepto `getCurrentUser()` y type-only imports)
- [ ] La action NO importa de `clients/`
- [ ] La action NO usa `fetch()` o `axios` directamente
- [ ] La action usa Services para todas las operaciones de datos
- [ ] La action valida datos de entrada (preferiblemente con zod)
- [ ] La action verifica autenticación/permisos antes de operar
- [ ] La action revalida rutas/cache después de mutaciones
- [ ] La action maneja errores apropiadamente
- [ ] La action retorna formato consistente
- [ ] Interfaces usan prefijo "I" (e.g., `ICreateProductActionInput`)

## Flujo de datos

```
Usuario envía formulario
  ↓
Component llama a Server Action
  ↓
Action valida y llama a Service
  ↓
Service orquesta lógica usando Repositories/Clients
  ↓
Action revalida rutas/cache
  ↓
Response fluye de vuelta: Service → Action → Component
```

**Recuerda:** Las server actions NO deben conocer la implementación de datos o APIs externas. Solo deben llamar a Services.

