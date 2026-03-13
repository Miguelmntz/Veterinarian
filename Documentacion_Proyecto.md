# Resumen de Seguimiento del Proyecto: Clínica Veterinaria

## 1. Breve explicación y justificación de la planificación
Tal y como planteé en el preproyecto, el objetivo de la aplicación es digitalizar la gestión diaria de una clínica veterinaria para dejar de lado las agendas físicas y centralizar la información. Con esto busco evitar la pérdida de historiales clínicos y mejorar el seguimiento de las mascotas.

Para llevarlo a cabo, sigo manteniendo la estructura planificada: una API en Laravel (PHP) para gestionar toda la lógica del servidor (Backend) de forma segura, comunicándose con React para el cliente (Frontend). Esto permite una experiencia de uso mucho más fluida. Además, usando Tailwind CSS para todo el diseño visual y hacerlo responsive.

## 2. Cambios respecto al preproyecto (si los ha habido)
En general, la hoja de ruta sigue siendo la misma, pero he tenido que adaptar algunas cosas al llevarlas a la práctica:
***Gestión de usuarios y clientes:** Inicialmente pensé en tener a los clientes y veterinarios juntos en la tabla de Usuarios diferenciados por rol. Al final, a nivel de base de datos me ha parecido más limpio y escalable separar a los administradores/veterinarios en la tabla `Users` y crear una tabla exclusiva de `Owners` (dueños) para gestionar mejor sus datos concretos de contacto y facturación.
*   **Prioridades de desarrollo:** En lugar de intentar abarcar todo a la vez, me estoy centrando primero en dejar perfecto el núcleo (la gestión de clientes, mascotas, calendario de citas y facturación) antes de meterme con el despliegue bien con Docker o AWS, esto lo haré en las últimas fases del proyecto.

## 3. Diseño inicial de la Base de Datos
He montado la base de datos en MySQL (a través de XAMPP) de manera relacional, ya que la integridad de la información médica es muy importante. La estructura principal de la base de datos es la siguiente:

*   **Usuarios (Users):** Aquí guardo a las personas que administran el sistema (veterinarios o personal de la clínica).
*   **Dueños (Owners):** Representa a los clientes que traen a sus animales. De ellos guardo su nombre, email, teléfono y dirección.
*   **Mascotas (Pets):** Son los pacientes. Cada mascota está vinculada directamente con su dueño (no puede existir una mascota sin dueño en el sistema). Guardo su nombre, especie, raza, peso y su fecha de nacimiento.
*   **Nota:** Actualmente estoy trabajando en integrar y relacionar las siguientes tablas que completarán el esquema planificado: Citas (para la agenda), Historial Médico y la gestión de Vacunas y Facturas.

## 4. Grado de desarrollo del proyecto
Calculo que el desarrollo está en torno a un 45% - 50%.
*   **Lo que ya tengo listo:** La conexión entre Front (React) y Back (Laravel) está consolidada. Ya funciona de manera operativa el registro, listado, edición y borrado (CRUD) tanto de los dueños como de las mascotas.
*   **En lo que estoy trabajando ahora:** Estoy ahora mismo con la vista del calendario interactivo para la gestión de eventos/citas y ajustando la generación de las facturas en PDF usando datos reales.
*   **Lo que me falta:** Terminar de afinar la pasarela de notificaciones por email para los recordatorios, completar las vistas del historial clínico en detalle para cada paciente, y realizar el despliegue final a producción.

## 5. Principales dificultades encontradas
Durante estas semanas me he topado con varias dificultades:
*   **Problemas de renderizado en React (Gestión de estado):** Me costó bastante aislar el estado de los componentes. Por ejemplo, al intentar abrir el formulario para añadir una mascota a un dueño en concreto, el sistema se liaba y me desplegaba visualmente las tarjetas de todos los dueños a la vez. Tuve que replantear el comportamiento usando ventanas modales independientes.
*   **Configuración del entorno XAMPP:** Preparar XAMPP como servidor local, configurar los puertos de la base de datos MySQL y lograr conectarlo todo correctamente con el entorno de Laravel sin que diera errores de conexión me llevó bastante tiempo para que empezara a funcionar correctamente.
*   **Problemas de CORS entre servidores:** Hacer que el servidor de desarrollo de React se comunicara fluidamente con el puerto del servidor local de la API de Laravel fue un dolor de cabeza al principio por las políticas restrictivas de seguridad de los navegadores.

## 6. Repositorios en GitHub del proyecto
El código del proyecto lo estoy guardando de forma segura en mi repositorio: `Miguelmntz/Veterinarian`.
Cabe destacar que **el repositorio lo tengo privado** por el momento para mantener seguro el código base y evitar filtraciones o usos indebidos mientras desarrollo. En caso de que necesite revisar el código fuente para evaluar el seguimiento, le puedo dar los permisos de acceso al proyecto sin ningún inconveniente.

## 7. Otros puntos a exponer
*   A pesar de las dificultades tecnológicas al integrar un stack separado (React por un lado y Laravel por otro), creo que el esfuerzo vale la pena porque es la forma en la que se construyen las aplicaciones profesionales hoy en día, asegurando una aplicación mucho más rápida, segura y escalable a largo plazo.
