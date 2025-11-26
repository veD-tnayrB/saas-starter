# AGENTS.md - Repositories Layer

## Propósito de esta capa

Los **Repositories** pertenecen a la **Data Access Layer** y son responsables de:
- Acceso a base de datos (únicamente)
- Ejecutar queries SQL usando Kysely
- Mapear columnas de base de datos (snake_case) a interfaces TypeScript (camelCase)
- Retornar estructuras de datos tipadas
- Sanitizar inputs para prevenir SQL injection

## Reglas generales de TypeScript

### TypeScript

- **Usar TypeScript para todo el código**
- **Preferir interfaces sobre types**
- **Interfaces DEBEN estar en PascalCase y SIEMPRE comenzar con prefijo "I"**
  - ✅ `IProduct`, `IUserRecord`, `IProductRepository`
  - ❌ `Product`, `UserRecord`, `ProductRepository`
- **Types deben estar en PascalCase cuando se usan para formas de objetos o unions**
- **Evitar enums; usar maps en su lugar**

### Estructura de código

- Escribir código TypeScript conciso y técnico con ejemplos precisos
- Usar patrones funcionales y declarativos; evitar clases
- Preferir iteración y modularización sobre duplicación de código
- Usar nombres de variables descriptivos con verbos auxiliares (e.g., `isLoading`, `hasError`)

## Accesos permitidos

Puedes importar y usar:

- ✅ **Database client** (`lib/db.ts` o `clients/db.ts`)
- ✅ **Kysely SQL builder** (`kysely`, `sql` template literals)
- ✅ **Types** (`types/*`)

## Accesos prohibidos

**NUNCA** importes o uses:

- ❌ **Clients** (APIs externas) - **Excepto `clients/db.ts`**
- ❌ **Services** - Crearía dependencia circular
- ❌ **Lógica de negocio** - Eso es para Services
- ❌ **Components, Pages, Actions, API Routes**

### Excepción: Type-only imports

Puedes importar **solo tipos** desde cualquier capa:

```typescript
// ✅ GOOD: Importación de tipo solamente
import type { IProduct } from "@/types/catalog";
```

## Reglas específicas de repositories

### CRÍTICO: Aliases SQL con comillas dobles para PostgreSQL

**MANDATORY RULE: TODOS los aliases SQL en SELECT, RETURNING, y otras cláusulas DEBEN usar comillas dobles para identificadores camelCase.**

PostgreSQL convierte identificadores sin comillas a lowercase por defecto. Sin comillas, PostgreSQL retornará nombres de columnas en lowercase (e.g., `projectid` en lugar de `projectId`), causando errores de acceso a propiedades `undefined` en TypeScript.

**SIEMPRE usa:** `AS "camelCase"` 
**NUNCA uses:** `AS camelCase` (sin comillas)

### Reglas de mapeo snake_case → camelCase

- **Usar aliases AS para convertir** columnas de base de datos (snake_case) a propiedades TypeScript (camelCase)
- **Permite reusar interfaces TypeScript existentes** directamente sin crear interfaces temporales
- **Mejora type safety** y reduce duplicación de código

### CRÍTICO: Prevención de SQL Injection

**MANDATORY RULE: TODAS las queries de base de datos DEBEN estar correctamente sanitizadas usando el parameter binding estándar de Kysely para prevenir ataques de SQL injection.**

- **NUNCA uses concatenación de strings con `sql.raw()`** para input del usuario o valores dinámicos
- **SIEMPRE usa sintaxis de template literal de Kysely** con interpolación de parámetros
- **Usa `sql.raw()` SOLO para SQL estático** (keywords, nombres de columnas, operadores SQL) controlados por el código
- **Todos los valores dinámicos** (input del usuario, IDs, fechas, etc.) **DEBEN ser pasados como parámetros interpolados** usando sintaxis `${value}` dentro de template literals `sql`

### Pure Data Access

- **Repositories DEBEN ser acceso de datos puro**
- **NO contener lógica de negocio** - Eso es para Services
- **Solo ejecutar queries y retornar datos**

### Tipos de retorno

- **Retornar tipos tipados** usando interfaces TypeScript existentes
- **Usar interfaces directamente** cuando los aliases están correctamente configurados
- **NO crear interfaces temporales** con snake_case cuando puedes usar aliases

## Ejemplos de código

### ✅ GOOD: Repository con aliases correctos y sanitización

```typescript
import { sql } from "kysely";
import type { IProduct } from "@/types/catalog";
import { db } from "@/lib/db";

export async function findProductById(id: string): Promise<IProduct | null> {
  // ✅ GOOD: Aliases con comillas dobles para PostgreSQL
  // ✅ GOOD: Parámetros sanitizados usando ${id}
  const result = await sql<IProduct>`
    SELECT
      id,
      catalog_id AS "catalogId",
      name,
      description,
      price,
      image_url AS "imageUrl",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
    FROM products
    WHERE id = ${id}
  `.execute(db);

  return result.rows[0] ?? null;
}
```

### ❌ BAD: Aliases sin comillas dobles

```typescript
// ❌ BAD: Aliases sin comillas dobles (PostgreSQL convertirá a lowercase)
const result = await sql<IProduct>`
  SELECT
    catalog_id AS catalogId,  // ❌ Retornará como 'catalogid' (lowercase)
    created_at AS createdAt   // ❌ Retornará como 'createdat' (lowercase)
  FROM products
  WHERE id = ${id}
`.execute(db);
// Error: result.rows[0].catalogId es undefined porque PostgreSQL retorna 'catalogid'
```

### ❌ BAD: Interface temporal con snake_case

```typescript
// ❌ BAD: Usando interface temporal y mapeo manual
const result = await sql<{
  email_verified: Date | null;
  created_at: Date;
}>`
  SELECT email_verified, created_at FROM users
`.execute(db);

// ❌ BAD: Mapeo manual innecesario
return {
  emailVerified: row.email_verified,
  createdAt: row.created_at,
};
```

### ✅ GOOD: Usando interface existente con aliases

```typescript
import type { IAuthUser } from "@/types/auth";

// ✅ GOOD: Usando interface existente directamente
const result = await sql<IAuthUser>`
  SELECT
    email_verified AS "emailVerified",  // ✅ Preserva camelCase
    created_at AS "createdAt"           // ✅ Preserva camelCase
  FROM users
  WHERE id = ${userId}
`.execute(db);

return result.rows[0];  // ✅ Propiedades correctamente accesibles como emailVerified, createdAt
```

### ❌ BAD: Vulnerable a SQL injection

```typescript
// ❌ BAD: Vulnerable a SQL injection - usando concatenación de strings
const setParts: string[] = [
  `stripe_price_id = ${sql.lit(data.priceId)}`, // sql.lit() en string es inseguro
];
const result = await sql`
  UPDATE users
  SET ${sql.raw(setParts.join(", "))} // Peligroso: SQL raw con strings concatenados
  WHERE id = ${userId}
`.execute(db);

// ❌ BAD: Vulnerable a SQL injection - interpolación directa de string
const result = await sql`
  SELECT * FROM users WHERE email = '${userEmail}' // NUNCA hagas esto!
`.execute(db);
```

### ✅ GOOD: Sanitización correcta usando Kysely

```typescript
// ✅ GOOD: Correctamente sanitizado usando parameter binding de Kysely
const setParts = [
  sql.raw("updated_at = CURRENT_TIMESTAMP"), // OK: SQL estático
  sql`stripe_price_id = ${data.priceId}`, // ✅ Parámetro sanitizado
];
const setClause = sql.join(setParts, sql`, `);
const result = await sql`
  UPDATE users
  SET ${setClause} // ✅ Seguro: usa fragmentos de Kysely
  WHERE id = ${userId} // ✅ Parámetro sanitizado
`.execute(db);

// ✅ GOOD: Interpolación directa de parámetros (recomendado) con aliases con comillas para PostgreSQL
const result = await sql<IUserSubscriptionRecord>`
  UPDATE users
  SET
    stripe_price_id = ${data.priceId ?? null}, // ✅ Sanitizado automáticamente
    updated_at = CURRENT_TIMESTAMP
  WHERE id = ${userId} // ✅ Sanitizado automáticamente
  RETURNING
    id AS "userId",
    stripe_price_id AS "stripePriceId"
`.execute(db);
```

### ✅ GOOD: INSERT con RETURNING

```typescript
import type { IProduct } from "@/types/catalog";

interface ICreateProductData {
  catalogId: string;
  name: string;
  description?: string;
  price: number;
}

export async function createProduct(
  data: ICreateProductData
): Promise<IProduct> {
  const result = await sql<IProduct>`
    INSERT INTO products (
      catalog_id,
      name,
      description,
      price,
      created_at,
      updated_at
    )
    VALUES (
      ${data.catalogId},
      ${data.name},
      ${data.description ?? null},
      ${data.price},
      CURRENT_TIMESTAMP,
      CURRENT_TIMESTAMP
    )
    RETURNING
      id,
      catalog_id AS "catalogId",
      name,
      description,
      price,
      image_url AS "imageUrl",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `.execute(db);

  return result.rows[0];
}
```

### ✅ GOOD: UPDATE con múltiples condiciones

```typescript
export async function updateProduct(
  id: string,
  data: Partial<ICreateProductData>
): Promise<IProduct | null> {
  const setParts: Array<ReturnType<typeof sql>> = [];
  
  if (data.name !== undefined) {
    setParts.push(sql`name = ${data.name}`);
  }
  if (data.description !== undefined) {
    setParts.push(sql`description = ${data.description ?? null}`);
  }
  if (data.price !== undefined) {
    setParts.push(sql`price = ${data.price}`);
  }
  
  if (setParts.length === 0) {
    return findProductById(id);
  }
  
  setParts.push(sql.raw("updated_at = CURRENT_TIMESTAMP"));
  
  const setClause = sql.join(setParts, sql`, `);
  
  const result = await sql<IProduct>`
    UPDATE products
    SET ${setClause}
    WHERE id = ${id}
    RETURNING
      id,
      catalog_id AS "catalogId",
      name,
      description,
      price,
      image_url AS "imageUrl",
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `.execute(db);

  return result.rows[0] ?? null;
}
```

### ✅ GOOD: SELECT con JOIN

```typescript
import type { IProductWithCatalog } from "@/types/catalog";

export async function findProductsWithCatalog(
  catalogId: string
): Promise<IProductWithCatalog[]> {
  const result = await sql<IProductWithCatalog>`
    SELECT
      p.id,
      p.catalog_id AS "catalogId",
      p.name,
      p.price,
      c.id AS "catalog.id",
      c.name AS "catalog.name",
      c.project_id AS "catalog.projectId"
    FROM products p
    INNER JOIN catalogs c ON p.catalog_id = c.id
    WHERE p.catalog_id = ${catalogId}
    ORDER BY p.created_at DESC
  `.execute(db);

  return result.rows;
}
```

### ❌ BAD: Repository con lógica de negocio

```typescript
// ❌ BAD: Repository con lógica de negocio
export async function createProduct(data: ICreateProductData) {
  // ❌ BAD: Lógica de negocio debe estar en service
  if (data.price < 0) {
    throw new Error("Price cannot be negative");
  }
  
  if (data.name.length > 255) {
    throw new Error("Name too long");
  }
  
  // ...
}
```

### ✅ GOOD: Repository es acceso de datos puro

```typescript
// ✅ GOOD: Repository es acceso de datos puro
export async function createProduct(data: ICreateProductData): Promise<IProduct> {
  const result = await sql<IProduct>`
    INSERT INTO products (name, price, ...)
    VALUES (${data.name}, ${data.price}, ...)
    RETURNING
      id,
      catalog_id AS "catalogId",
      name,
      price,
      created_at AS "createdAt",
      updated_at AS "updatedAt"
  `.execute(db);
  
  return result.rows[0];
}
```

## Nomenclatura de archivos

### Sin prefijos redundantes

**Cuando un archivo está dentro de una carpeta que ya indica su dominio, el nombre del archivo NO debe repetir ese nombre de dominio.**

### Ejemplos de nomenclatura

```
repositories/
  catalog/
    repo.ts              # ✅ Ya está en carpeta catalog/
    index.ts             # ✅ Standard index file
  projects/
    repo.ts              # ✅ Ya está en carpeta projects/
    members.ts           # ✅ Entidad específica sin prefijo
```

### ❌ BAD: Prefijos redundantes

```
repositories/
  catalog/
    catalog-repo.ts      # ❌ "catalog" es redundante
```

## Checklist antes de commitear

Antes de hacer commit, verifica:

- [ ] TODOS los aliases SQL usan comillas dobles: `AS "camelCase"`
- [ ] TODOS los parámetros dinámicos usan interpolación `${value}` (nunca concatenación)
- [ ] NO hay `sql.raw()` con valores de usuario o dinámicos
- [ ] El repository NO importa de `clients/` (excepto `clients/db.ts`)
- [ ] El repository NO importa de `services/`
- [ ] El repository NO contiene lógica de negocio
- [ ] El repository retorna tipos usando interfaces existentes
- [ ] Las queries usan aliases para mapear snake_case → camelCase
- [ ] Interfaces usan prefijo "I" (e.g., `IProduct`)
- [ ] El nombre del archivo no tiene prefijos redundantes si está en una carpeta

## Reglas críticas resumidas

1. **Aliases con comillas dobles:** `AS "camelCase"` - SIEMPRE
2. **Sanitización de parámetros:** `${value}` - NUNCA concatenación de strings
3. **Pure data access:** Solo queries, sin lógica de negocio
4. **Usar interfaces existentes:** Con aliases correctos, no crear interfaces temporales

## Flujo de datos

```
Service llama a Repository
  ↓
Repository ejecuta query SQL con aliases correctos
  ↓
Datos mapeados de snake_case a camelCase
  ↓
Response fluye de vuelta: Repository → Service
```

**Recuerda:** Los repositories son solo acceso a datos. NO deben tener lógica de negocio ni llamadas a APIs externas. Solo queries SQL correctamente sanitizadas con aliases apropiados.

