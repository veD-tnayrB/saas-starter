# AGENTS.md - Services Layer

## Propósito de esta capa

Los **Services** pertenecen a la **Business Logic Layer** y son responsables de:

- Orquestar lógica de negocio compleja
- Coordinar entre múltiples Repositories y Clients
- Aplicar reglas de negocio y validaciones complejas
- Manejar transacciones y operaciones atómicas
- Componer funcionalidad de múltiples fuentes de datos

## Reglas generales de TypeScript

### TypeScript

- **Usar TypeScript para todo el código**
- **Preferir interfaces sobre types**
- **Interfaces DEBEN estar en PascalCase y SIEMPRE comenzar con prefijo "I"**
  - ✅ `ICreateProductInput`, `IProductService`, `IServiceResult`
  - ❌ `CreateProductInput`, `ProductService`, `ServiceResult`
- **Types deben estar en PascalCase cuando se usan para formas de objetos o unions**
- **Evitar enums; usar maps en su lugar**

### Estructura de código

- Escribir código TypeScript conciso y técnico con ejemplos precisos
- Usar patrones funcionales y declarativos; evitar clases
- Preferir iteración y modularización sobre duplicación de código
- Usar nombres de variables descriptivos con verbos auxiliares (e.g., `isLoading`, `hasError`)

## Accesos permitidos

Puedes importar y usar:

- ✅ **Repositories** (`repositories/*`) - **Para acceso a base de datos**
- ✅ **Clients** (`clients/*`) - **Para APIs externas**
- ✅ **Otros Services** (`services/*`) - **Para composición de lógica de negocio**
- ✅ **Types** (`types/*`)
- ✅ **Utilities** (`lib/utils.ts`)

## Accesos prohibidos

**NUNCA** importes o uses:

- ❌ **Consultas directas a base de datos** (`sql`, `db`) - **DEBES usar Repositories**
- ❌ **Llamadas directas a APIs** (`fetch`, `axios`) - **DEBES usar Clients**
- ❌ **Components** (`components/*`)
- ❌ **Pages** (`app/**/page.tsx`)
- ❌ **Actions** (`actions/*`)
- ❌ **API Routes** (`app/api/**`)

### Excepción: Type-only imports

Puedes importar **solo tipos** desde cualquier capa:

```typescript
// ✅ GOOD: Importación de tipo solamente
import type { IProduct } from "@/types/catalog";
```

## Reglas específicas de services

### Composición de lógica de negocio

- **Services pueden llamar a otros Services** - Para componer lógica compleja
- **Orquestar múltiples operaciones** - Coordinar entre Repositories y Clients
- **Aplicar reglas de negocio** - Validaciones complejas, cálculos, transformaciones

### Separación de responsabilidades

- **NO contener lógica de presentación** - Eso es para Components/Pages
- **NO contener queries SQL directas** - Eso es para Repositories
- **NO contener llamadas directas a APIs externas** - Eso es para Clients

### Manejo de transacciones

- **Coordinar operaciones atómicas** - Cuando múltiples operaciones deben ejecutarse juntas
- **Manejar rollbacks** - Si una operación falla, revertir cambios anteriores

### Validación de negocio

- **Aplicar reglas de negocio complejas** - Más allá de validación de esquemas
- **Validar relaciones entre entidades** - Verificar que los datos sean consistentes

## Ejemplos de código

### ✅ GOOD: Service orquestando Repository y Client

```typescript
import { sendWhatsAppMessage } from "@/clients/whatsapp";
import { findProductById } from "@/repositories/catalog";

import type { IProduct } from "@/types/catalog";

interface INotifyProductUpdateParams {
  productId: string;
  userId: string;
}

export async function notifyProductUpdate(
  params: INotifyProductUpdateParams,
): Promise<void> {
  // 1. Obtener datos de repository
  const product = await findProductById(params.productId);

  if (!product) {
    throw new Error("Product not found");
  }

  // 2. Aplicar lógica de negocio
  const shouldNotify = product.price > 100; // Regla de negocio

  if (shouldNotify) {
    // 3. Llamar a client para notificación externa
    await sendWhatsAppMessage({
      to: "+1234567890",
      message: `Product ${product.name} was updated with new price: ${product.price}`,
    });
  }
}
```

### ❌ BAD: Service haciendo query SQL directa

```typescript
// ❌ VIOLACIÓN: Query SQL directa
import { sql } from "kysely";

import { db } from "@/lib/db";

export async function getProductById(productId: string) {
  // ❌ VIOLACIÓN: Debe usar repository
  const result = await sql`
    SELECT * FROM products WHERE id = ${productId}
  `.execute(db);
  return result.rows[0];
}
```

### ❌ BAD: Service usando fetch directamente

```typescript
// ❌ VIOLACIÓN: Llamada directa a API
export async function notifyProductUpdate(productId: string) {
  const product = await findProductById(productId);

  // ❌ VIOLACIÓN: Debe usar client
  await fetch("https://api.whatsapp.com/messages", {
    method: "POST",
    body: JSON.stringify({ message: `Product ${product.name} updated` }),
  });
}
```

### ✅ GOOD: Service componiendo otros services

```typescript
import { aiService } from "@/services/ai";
import { embeddingService } from "@/services/embeddings";

import type { IProduct } from "@/types/catalog";

import { catalogService } from "./catalog";

export async function processProduct(
  productId: string,
): Promise<IProcessedProduct> {
  // 1. Obtener producto usando otro service
  const product = await catalogService.getProductById(productId);

  // 2. Generar embedding usando otro service
  const embedding = await embeddingService.generateEmbedding(
    `${product.name} ${product.description}`,
  );

  // 3. Generar respuesta de AI usando otro service
  const aiResponse = await aiService.generateResponse(product, embedding);

  // 4. Aplicar lógica de negocio y retornar
  return {
    ...product,
    embedding,
    aiAnalysis: aiResponse,
    processedAt: new Date(),
  };
}
```

### ✅ GOOD: Service con validación de negocio compleja

```typescript
import {
  createProduct as createProductRepo,
  findCatalogById,
  findProductsByCatalogId,
} from "@/repositories/catalog";

interface ICreateProductInput {
  catalogId: string;
  name: string;
  price: number;
}

export async function createProduct(
  input: ICreateProductInput,
): Promise<IProduct> {
  // 1. Validar reglas de negocio
  const catalog = await findCatalogById(input.catalogId);

  if (!catalog) {
    throw new Error("Catalog not found");
  }

  // 2. Aplicar regla de negocio: verificar límite de productos
  const existingProducts = await findProductsByCatalogId(input.catalogId);

  if (catalog.maxProducts && existingProducts.length >= catalog.maxProducts) {
    throw new Error(
      `Catalog has reached maximum of ${catalog.maxProducts} products`,
    );
  }

  // 3. Aplicar regla de negocio: precio mínimo según catalog
  if (catalog.minPrice && input.price < catalog.minPrice) {
    throw new Error(`Price must be at least ${catalog.minPrice}`);
  }

  // 4. Crear producto usando repository
  const product = await createProductRepo({
    ...input,
    catalogId: catalog.id,
  });

  return product;
}
```

### ✅ GOOD: Service coordinando múltiples repositories

```typescript
import { sendInvitationEmail } from "@/clients/auth/email";
import { findUserById } from "@/repositories/auth";
import { createInvitation, findProjectById } from "@/repositories/projects";

interface ICreateProjectInvitationInput {
  projectId: string;
  email: string;
  role: string;
  invitedByUserId: string;
}

export async function createProjectInvitation(
  input: ICreateProjectInvitationInput,
): Promise<IInvitation> {
  // 1. Validar que el proyecto existe
  const project = await findProjectById(input.projectId);
  if (!project) {
    throw new Error("Project not found");
  }

  // 2. Validar que el invitador tiene permisos
  const inviter = await findUserById(input.invitedByUserId);
  if (
    !inviter ||
    !project.members.some((m) => m.userId === inviter.id && m.role === "admin")
  ) {
    throw new Error("Unauthorized");
  }

  // 3. Crear invitación en base de datos
  const invitation = await createInvitation({
    projectId: input.projectId,
    email: input.email,
    role: input.role,
    invitedBy: input.invitedByUserId,
  });

  // 4. Enviar email de invitación
  await sendInvitationEmail({
    to: input.email,
    projectName: project.name,
    invitationLink: `/accept-invitation/${invitation.id}`,
  });

  return invitation;
}
```

## Nomenclatura de archivos

### Sin prefijos redundantes

**Cuando un archivo está dentro de una carpeta que ya indica su dominio, el nombre del archivo NO debe repetir ese nombre de dominio.**

### Ejemplos de nomenclatura

```
services/
  catalog/
    service.ts           # ✅ Ya está en carpeta catalog/
    index.ts             # ✅ Standard index file
  projects/
    service.ts           # ✅ Ya está en carpeta projects/
    invitations.ts       # ✅ Acción específica sin prefijo
  auth/
    verification.ts      # ✅ Acción específica sin prefijo
```

### ❌ BAD: Prefijos redundantes

```
services/
  catalog/
    catalog-service.ts   # ❌ "catalog" es redundante
    catalog-repo.ts      # ❌ "catalog" es redundante
```

### ✅ GOOD: Root level con contexto

```
services/
  create-project.ts      # ✅ Root level, necesita contexto
  delete-project.ts      # ✅ Root level, necesita contexto
```

## Checklist antes de commitear

Antes de hacer commit, verifica:

- [ ] El service NO usa queries SQL directas (`sql`, `db`)
- [ ] El service NO usa `fetch()` o `axios` directamente
- [ ] El service NO importa de `components/`, `app/`, `actions/`
- [ ] El service usa Repositories para acceso a base de datos
- [ ] El service usa Clients para APIs externas
- [ ] El service puede componer otros services cuando sea apropiado
- [ ] El service aplica lógica de negocio, no solo pasa datos
- [ ] Interfaces usan prefijo "I" (e.g., `ICreateProductInput`)
- [ ] El nombre del archivo no tiene prefijos redundantes si está en una carpeta

## Flujo de datos

```
Component/Action/API Route llama a Service
  ↓
Service orquesta lógica:
  - Llama a Repositories para datos
  - Llama a Clients para APIs externas
  - Aplica reglas de negocio
  - Coordina operaciones complejas
  ↓
Response fluye de vuelta: Repository/Client → Service → Component/Action/API
```

**Recuerda:** Los services son donde vive la lógica de negocio. NO deben tener queries SQL directas ni llamadas directas a APIs externas. Usa Repositories y Clients respectivamente.
