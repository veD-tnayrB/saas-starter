**Asignación de Tarea: Optimización Crítica de Performance de la Aplicación**

**Para:** Agente de IA Avanzado (Modelo Gemini)
**De:** Senior Product Owner / Tech Lead
**Prioridad:** Máxima (Bloqueante para la Experiencia de Usuario)

### 1. Objetivo Principal (La Misión)

El objetivo de esta tarea es **mejorar drásticamente la performance percibida y real** de nuestra aplicación. La latencia actual en la carga de varias pantallas está degradando la experiencia del usuario, lo que impacta negativamente la retención y satisfacción. Tu misión es diagnosticar y solucionar estos cuellos de botella para asegurar que la aplicación sea rápida, fluida y escalable, cumpliendo con los estándares de un producto "production-ready".

### 2. Contexto del Problema

Hemos observado tiempos de carga inaceptables (varios segundos) en múltiples vistas de la aplicación. Nuestra hipótesis inicial apunta a dos causas principales:

1.  **Implementación Subóptima de Server Components:** Es probable que estemos realizando un uso ineficiente del fetching de datos, generando "waterfalls" de peticiones en cascada en el servidor o ejecutando cómputos pesados que bloquean el renderizado.
2.  **Sobrecarga y "Over-fetching":** Podemos estar enviando un volumen de datos excesivo a los componentes o renderizando árboles de componentes innecesariamente grandes y complejos en el servidor, lo que aumenta el TTFB (Time to First Byte).

Tu tarea es validar esta hipótesis, identificar las causas raíz exactas y refactorizar el código para solucionar los problemas de raíz.

### 3. Criterios de Aceptación (Definición de "Hecho")

La tarea se considerará completada cuando se cumplan los siguientes KPIs, medidos en un entorno de producción o similar (`pnpm build && pnpm start`):

*   **Largest Contentful Paint (LCP):** Debe ser **inferior a 1.8 segundos** para las páginas principales.
*   **Time to First Byte (TTFB):** Debe ser **inferior a 400ms** para todas las páginas críticas.
*   **Bundle Size de JavaScript del Cliente:** No debe haber regresiones. Se espera una reducción del JS enviado al cliente gracias a un uso más estricto de los Server Components.
*   **Pruebas End-to-End:** Todas las pruebas existentes deben pasar. No se debe introducir ninguna regresión funcional.

### 4. Plan de Acción Detallado

Te guiaré a través de un proceso estructurado. No empieces a codificar inmediatamente. Sigue estas fases:

**Fase 1: Análisis y Diagnóstico (Investigación)**

1.  **Identifica las rutas lentas:** Usa las herramientas de desarrollo y tu capacidad de análisis para navegar la aplicación e identificar las 3-5 rutas más lentas.
2.  **Delega la investigación inicial:** Para obtener un mapa claro de la arquitectura y las dependencias, utiliza al agente especializado.
    *   **Acción:** Invoca a `delegate_to_agent('codebase_investigator', objective='Analyze the application to identify the root causes of slow page loads, focusing on data fetching patterns, component rendering, and the usage of Next.js Server Components. Pinpoint specific files and components that are likely contributors to high LCP and TTFB.')`
3.  **Analiza los Data-Fetching Patterns:** Revisa cómo los Server Components están obteniendo datos. Busca:
    *   Peticiones en cascada (fetch-then-render-then-fetch).
    *   Falta de paralelización en la obtención de datos (ej. `Promise.all`).
    *   Ausencia de estrategias de caché (`unstable_cache`, `React.cache`).
4.  **Revisa el Árbol de Componentes:** Examina la estructura de las páginas lentas. ¿Hay componentes enormes haciendo todo el trabajo? ¿Se está pasando una cantidad excesiva de props?

**Fase 2: Estrategia de Optimización**

Basado en tu análisis, propón y ejecuta las siguientes optimizaciones:

1.  **Refactoriza el Data Fetching:**
    *   Paraleliza las llamadas a la base de datos o APIs siempre que sea posible.
    *   Implementa caching de datos agresivo para la información que no cambia con frecuencia.
    *   Asegúrate de que solo se pidan los datos estrictamente necesarios para el renderizado inicial.
2.  **Optimiza los Server Components:**
    *   Divide los componentes monolíticos en componentes más pequeños y enfocados.
    *   Mueve la lógica pesada y el fetching de datos a los componentes más bajos en el árbol que los necesiten.
3.  **Uso Correcto de `'use client'`:**
    *   Audita el uso de la directiva `'use client'`. Conviértela en una frontera lo más pequeña posible. Un componente cliente "envenena" a todos sus hijos, haciéndolos también componentes de cliente. Empuja los componentes de cliente hacia las hojas del árbol de componentes.
4.  **Implementa Carga Diferida (Lazy Loading) y Streaming con `Suspense`:**
    *   Envuelve las partes más lentas o menos críticas de la UI en componentes `<Suspense>`. Esto permitirá hacer streaming del HTML desde el servidor, mejorando drásticamente el tiempo de carga percibido.

**Fase 3: Implementación y Verificación**

1.  Aplica los cambios de forma incremental, un componente o una ruta a la vez.
2.  **Después de cada cambio significativo**, ejecuta las pruebas del proyecto (`pnpm test`) y vuelve a medir la performance (`Lighthouse`, `DevTools`) para validar la mejora y asegurar que no haya regresiones.
3.  Utiliza los comandos `pnpm dev` para desarrollo y `pnpm build && pnpm start` para una evaluación de performance precisa.

### 5. Mandato Final

Esta es la prioridad número uno del sprint actual. La calidad y la performance son innegociables. Procede con la Fase 1 de inmediato. Reporta tus hallazgos iniciales del análisis antes de proceder con las optimizaciones a gran escala. Confío en tu capacidad para llevar esta aplicación a los estándares de excelencia que nuestros usuarios merecen.