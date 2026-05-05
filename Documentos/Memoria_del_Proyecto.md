# MEMORIA TÉCNICA DEL PROYECTO: SISTEMA DE GESTIÓN VETERINARIA

## 1. Introducción y Objetivos del Proyecto

### 1.1 Contexto del desarrollo
Actualmente, numerosas clínicas veterinarias de pequeño y mediano tamaño continúan gestionando su flujo de trabajo mediante agendas físicas, hojas de cálculo locales o software de escritorio obsoleto. Este proyecto nace de la necesidad de modernizar y centralizar este ecosistema a través de una solución en la nube (Web), permitiendo el acceso concurrente a la información, evitando la pérdida de historiales médicos y optimizando los procesos administrativos.

### 1.2 Objetivos Generales
Desarrollar una Aplicación Web Integral (Full-Stack) orientada a servicios que permita automatizar las tareas principales de una clínica veterinaria: gestión de altas, reserva de citas médicas, seguimiento del historial clínico de los pacientes y mantenimiento del inventario médico.

### 1.3 Objetivos Específicos
* Implementar un sistema de roles diferenciados para separar la lógica de negocio administrativa del portal de clientes.
* Construir una API robusta que garantice la integridad y persistencia de datos.
* Diseñar una interfaz de usuario dinámica (SPA) e intuitiva que reduzca el tiempo requerido para ingresar información médica y administrativa.
* Conectar las consultas o tratamientos médicos con un inventario real de productos para mantener un control de stock automático.

---

## 2. Análisis de Requisitos

### 2.1 Identificación de Actores
* **Administrador / Veterinario (User):** Personal interno de la clínica. Tiene permisos totales sobre el sistema para gestionar clientes, modificar el stock, consultar el calendario general, escribir diagnósticos y generar facturas.
* **Cliente (Owner):** Dueño de mascotas. Dispone de un área de acceso limitado para consultar su información, revisar el estado de alta de sus animales y sus citas pendientes.

### 2.2 Requisitos Funcionales (RF)
* **RF01 - Gestión de Identidad:** El sistema debe permitir el inicio de sesión y autenticación segura mediante tokens de acceso.
* **RF02 - Módulo de Perfiles:** El sistema debe permitir crear, leer, actualizar y eliminar (CRUD) registros tanto de Clientes como de sus Mascotas.
* **RF03 - Agenda Médica:** El sistema debe proveer una vista de calendario interactivo para asignar y gestionar citas clínicas por paciente y fecha.
* **RF04 - Gestión de Inventario:** Debe existir un control de stock de productos y medicamentos de la clínica.
* **RF05 - Historial Clínico Integral:** El sistema debe registrar actos médicos (diagnósticos, síntomas, peso) vinculando dichas entradas con los medicamentos consumidos (inventario), alterando el stock correspondiente.
* **RF06 - Facturación:** El sistema debe permitir generar registros de cobro asociados a un Cliente concreto derivados de los servicios o tratamientos prestados.

### 2.3 Requisitos No Funcionales (RNF)
* **RNF01 - Usabilidad e Interfaz SPA:** Navegación en una única página mediante recarga dinámica asíncrona (sin refrescar el navegador).
* **RNF02 - Rendimiento y Optimización:** Minimizar las consultas redundantes a la base de datos (problemas N+1 queries solucionados con Eager Loading).
* **RNF03 - Arquitectura Desacoplada:** El Frontend y Backend deben estar aislados para facilitar futuros reemplazos técnicos o escalabilidad a aplicaciones móviles.
* **RNF04 - Seguridad REST:** La API debe estar protegida contra vulnerabilidades de inyección SQL y requerir credenciales (Bearer Token) para transacciones sensibles.

---

## 3. Arquitectura del Sistema y Stack Tecnológico

El proyecto se divide en dos grandes bloques comunicados mediante el protocolo HTTP enviando datos serializados en `JSON`.

### 3.1 Entorno Servidor (Backend API)
* **Framework:** Laravel (PHP). Escogido por su madurez técnica, su sofisticado mapeo objeto-relacional (Eloquent ORM) y su estandarización MVC (Modelo-Vista-Controlador).
* **Autenticación (API Security):** Laravel Sanctum, encargado de emitir y validar los tokens de acceso temporales por usuario.
* **Motor de Base de Datos:** MySQL (XAMPP local), diseñado bajo una estructura fuertemente relacional garantizando el uso de *Foreign Keys* y transacciones seguras (`DB::transaction`).

### 3.2 Entorno Cliente (Frontend SPA)
* **Librería Core:** React JS, usando Vite como empaquetador de módulos por su extraordinaria rapidez de compilación e inicio respecto a los estándares anteriores (Webpack).
* **Estilos e Interfaz (UI):** Tailwind CSS, que provee clases de utilidad que aseguran un diseño 100% Responsive enfocado en directrices Mobile-First y coherencia visual en todos los componentes.
* **Comunicación Asíncrona:** Axios, un cliente HTTP basado en promesas ideal para interceptar peticiones, adjuntar cabeceras de autorización y modularizar la interacción con los enpoints de Laravel.

---

## 4. Diseño Lógico de Datos (Modelo Entidad-Relación)

La información fluye bajo un modelo estructurado evitando la redundancia de datos. Las entidades cardinales de la base de datos son:

* **Users (Usuarios):** Almacena las credenciales de acceso de los trabajadores.
* **Owners (Dueños/Clientes):** Clientes de la clínica con sus datos de contacto para facturación.
* **Pets (Mascotas):** Tabla dependiente absolutamente de Owners `(1 : N)`. Registra campos fundamentales sanitarios (peso, especie, raza, etc).
* **Appointments (Citas):** Reserva de un paciente para una fecha y motivo concretos `(Mascotas 1 : N Citas)`.
* **Products (Inventario):** Catálogo de servicios y consumibles con su stock numérico.
* **Medical_Records (Historial Médico):** Tabla puente que engloba un tratamiento. Permite diagnosticar a una mascota en una fecha, y a la vez referenciar la clave foránea a Products para generar el consecuente gasto de inventario.
* **Invoices (Facturas):** Tabla económica final vinculada al Dueño (Owner) para mantener un control de caja de los servicios terminados.

---

## 5. Descripción de los Módulos Desarrollados del Sistema

**Módulo de Dashboard Inicial y Navegación:**
Un panel de control asíncrono con métricas principales y menús laterales desacoplados según el rol obtenido tras iniciar sesión, garantizando que un cliente no vea vistas administrativas.

**Módulo de Registros (Clientes y Mascotas):**
Implementado mediante un diseño de Tarjetas Dinámicas estructuradas (React Components). Para solucionar cuellos de botella en la Experiencia de Usuario (como colisiones al editar datos masivos), se aisló la creación y edición en Ventanas Modales superpuestas e independientes.

**Módulo de Citas y Calendario:**
Se ha estructurado visualmente la planificación clínica suprimiendo variables iniciales redundantes (como la obligación de establecer horas de fin estrictas) en favor de una organización de bloques simplificada y mucho más útil para la alta rotación veterinaria.

**Módulo de Historial Clínico e Inventario (Integración):**
El módulo de mayor carga lógica. La creación de una observación clínica no solo reporta un diagnóstico por escrito (Sintomatología y Tratamiento a seguir), sino que cruza información referencial para dar de baja consumibles del stock general automáticamente en el Backend (`ProductController`), asegurando que la realidad material del almacén sea fiable.

**Módulo de Facturación Base:**
Creación de estados contables que recopilan la intervención médica transformándola en un documento de valor o registro de pago finalizado, unificable por cliente.

---

## 6. Dificultades Técnicas Encontradas y Soluciones Aplicadas

1. **Gestión del Estado de los Componentes en React:**
   Durante la estructuración de colecciones mapeadas iteradas (listas de mascotas y pacientes) existían conflictos de renderizado que abrían todos los formularios al pinchar en un único botón. **Solución:** Abordar un rediseño de encapsulación de propiedades (Props), pasando funciones manejadoras padre a los hijos e implantando una política estricta de variables de control (`States`) en Modales aislados.

2. **Cruces de Peticiones y Puertos (CORS):**
   El servidor asíncrono de Vite corría en puertos distintos al servidor apache de la API (Laravel / XAMPP). Los primeros métodos `POST` y `PUT` fueron bloqueados por seguridad transversal por el navegador. **Solución:** Configuración estricta de las políticas de dominios de confianza configurando el fichero de CORS en Laravel permitiendo la comunicación local.

3. **Arquitectura Relacional Compleja (N+1 Problemas):**
   El Frontend sufría colapsos de red esperando resolver cientos de peticiones cuando se listaban los dueños con sus múltiples mascotas. **Solución:** Integración y optimización profunda del ORM enviando instrucciones `with('pets')` en los Controladores para empaquetar toda la carga jerárquica en una única consulta de base de datos eficiente.

---

## 7. Conclusiones

La elaboración del proyecto ha demostrado la viabilidad técnica de una clínica gestionada íntegramente de manera escalable y digital. El uso de Laravel garantizó una lógica predictiva y blindada, mientras que React ha habilitado una carga sin bloqueos ni transiciones molestas.

Durante este periodo también se ha comprobado la importancia del diseño ágil frente a la planificación en cascada: a medida que el software cobraba forma fue indispensable pivotar decisiones, tales como refinar fechas en la base de datos o replantear el comportamiento de las ventanas que el usuario percibe. 

La solución técnica aportada y consolidada a estas alturas no solo cumple funcionalmente, sino que emula con precisión los estándares exigibles a una herramienta propietaria comercial del sector.
