# AGENTS.md - Clients Layer

## Propósito de esta capa

Los **Clients** pertenecen a la **Data Access Layer** y son responsables de:
- Integraciones con APIs externas (Stripe, OpenAI, WhatsApp, etc.)
- Configurar clientes de API
- Hacer llamadas a APIs externas
- Manejar errores y respuestas de APIs
- Abstraer detalles específicos de APIs

## Reglas generales de TypeScript

### TypeScript

- **Usar TypeScript para todo el código**
- **Preferir interfaces sobre types**
- **Interfaces DEBEN estar en PascalCase y SIEMPRE comenzar con prefijo "I"**
  - ✅ `ISendMessageParams`, `IStripeClient`, `IOpenAIConfig`
  - ❌ `SendMessageParams`, `StripeClient`, `OpenAIConfig`
- **Types deben estar en PascalCase cuando se usan para formas de objetos o unions**
- **Evitar enums; usar maps en su lugar**

### Estructura de código

- Escribir código TypeScript conciso y técnico con ejemplos precisos
- Usar patrones funcionales y declarativos; evitar clases
- Preferir iteración y modularización sobre duplicación de código
- Usar nombres de variables descriptivos con verbos auxiliares (e.g., `isLoading`, `hasError`)

## Accesos permitidos

Puedes importar y usar:

- ✅ **SDKs de APIs externas** (Stripe SDK, OpenAI SDK, WhatsApp SDK, etc.)
- ✅ **Environment variables** (`env.mjs`)
- ✅ **Types** (`types/*`)
- ✅ **Utilities** (`lib/utils.ts`)

## Accesos prohibidos

**NUNCA** importes o uses:

- ❌ **Repositories** - Crearía dependencia circular
- ❌ **Services** - Crearía dependencia circular
- ❌ **Consultas a base de datos** (`sql`, `db`)
- ❌ **Lógica de negocio** - Eso es para Services
- ❌ **Components, Pages, Actions, API Routes**

### Excepción: Type-only imports

Puedes importar **solo tipos** desde cualquier capa:

```typescript
// ✅ GOOD: Importación de tipo solamente
import type { IMessage } from "@/types/messaging";
```

## Reglas específicas de clients

### Abstracción de APIs

- **Abstraer detalles específicos de APIs** - Manejar versionado de APIs, autenticación, errores internamente
- **Retornar estructuras limpias y tipadas** - No exponer detalles de implementación de la API
- **Manejar errores de API** - Convertir errores de API en errores tipados consistentes

### Configuración

- **Configurar clientes de API** usando environment variables
- **Manejar autenticación** (API keys, tokens, OAuth) internamente

### Retorno de datos

- **Retornar estructuras tipadas** usando interfaces TypeScript
- **Ocultar complejidad de la API** - El código que usa el client no debe conocer detalles de la API

## Ejemplos de código

### ✅ GOOD: Client manejando API externa

```typescript
import { env } from "@/env.mjs";
import { OpenAI } from "openai";

const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

interface IGenerateEmbeddingParams {
  text: string;
}

export async function generateEmbedding(
  params: IGenerateEmbeddingParams
): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: params.text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    // Manejar errores de API y convertirlos en errores consistentes
    if (error instanceof Error) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    throw new Error("Unknown error generating embedding");
  }
}
```

### ❌ BAD: Client accediendo repository

```typescript
// ❌ VIOLACIÓN: Importando repository
import { findUserById } from "@/repositories/auth";

export async function generateEmbedding(text: string, userId: string) {
  // ❌ VIOLACIÓN: Acceso a repository
  const user = await findUserById(userId);
  // ...
}
```

### ✅ GOOD: Client abstraendo detalles de API

```typescript
import { env } from "@/env.mjs";

interface ISendWhatsAppMessageParams {
  to: string;
  message: string;
}

interface ISendMessageResult {
  success: boolean;
  messageId: string;
}

export async function sendWhatsAppMessage(
  params: ISendWhatsAppMessageParams
): Promise<ISendMessageResult> {
  // Maneja detalles internos de la API (versionado, autenticación, formato)
  const response = await fetch(
    `${env.WHATSAPP_API_BASE_URL}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: params.to,
        type: "text",
        text: { body: params.message },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`WhatsApp API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Retorna estructura limpia y tipada
  return {
    success: true,
    messageId: data.messages[0].id,
  };
}
```

### ✅ GOOD: Client con Stripe

```typescript
import { env } from "@/env.mjs";
import Stripe from "stripe";

const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

interface ICreateSubscriptionParams {
  customerId: string;
  priceId: string;
}

export async function createSubscription(
  params: ICreateSubscriptionParams
): Promise<Stripe.Subscription> {
  const subscription = await stripe.subscriptions.create({
    customer: params.customerId,
    items: [{ price: params.priceId }],
    payment_behavior: "default_incomplete",
    payment_settings: { save_default_payment_method: "on_subscription" },
    expand: ["latest_invoice.payment_intent"],
  });

  return subscription;
}
```

### ❌ BAD: Client con lógica de negocio

```typescript
// ❌ BAD: Client con lógica de negocio
export async function sendMessage(params: ISendMessageParams) {
  // ❌ BAD: Lógica de negocio debe estar en service
  if (params.message.length > 1000) {
    throw new Error("Message too long");
  }
  
  // ...
}
```

### ✅ GOOD: Client es solo abstracción de API

```typescript
// ✅ GOOD: Client es solo abstracción de API
export async function sendMessage(params: ISendMessageParams): Promise<ISendMessageResult> {
  // Solo maneja detalles de la API externa
  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(params),
  });
  
  return {
    success: true,
    messageId: response.id,
  };
}
```

## Nomenclatura de archivos

### Sin prefijos redundantes

**Cuando un archivo está dentro de una carpeta que ya indica su dominio, el nombre del archivo NO debe repetir ese nombre de dominio.**

### Ejemplos de nomenclatura

```
clients/
  whatsapp/
    client.ts           # ✅ Ya está en carpeta whatsapp/
    index.ts            # ✅ Standard index file
  stripe/
    client.ts           # ✅ Ya está en carpeta stripe/
    subscriptions.ts    # ✅ Módulo específico sin prefijo
```

### ❌ BAD: Prefijos redundantes

```
clients/
  whatsapp/
    whatsapp-client.ts  # ❌ "whatsapp" es redundante
```

## Checklist antes de commitear

Antes de hacer commit, verifica:

- [ ] El client NO importa de `repositories/`
- [ ] El client NO importa de `services/`
- [ ] El client NO contiene lógica de negocio
- [ ] El client NO hace queries a base de datos
- [ ] El client abstrae detalles de la API externa
- [ ] El client retorna estructuras tipadas y limpias
- [ ] El client maneja errores de API apropiadamente
- [ ] Interfaces usan prefijo "I" (e.g., `ISendMessageParams`)
- [ ] El nombre del archivo no tiene prefijos redundantes si está en una carpeta

## Flujo de datos

```
Service llama a Client
  ↓
Client hace llamada a API externa
  ↓
Client maneja respuesta y errores
  ↓
Response fluye de vuelta: Client → Service
```

**Recuerda:** Los clients son solo abstracciones de APIs externas. NO deben tener lógica de negocio ni acceso a base de datos. Solo manejan integraciones con APIs externas.

