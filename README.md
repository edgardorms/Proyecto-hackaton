# Workflow de Desarrollo de BuildingDAO  

## 1. Planificación  
### Actividades Principales  
- Definición del alcance y los objetivos del proyecto: Crear una plataforma de gobernanza comunitaria basada en blockchain.  
- Identificación de los requisitos técnicos y funcionales:  
  - Gestión de propietarios y sus tokens representativos.  
  - Sistema de votación con reglas claras de quórum y mayorías.  
  - Interfaz web interactiva y fácil de usar.  
- Creación de un cronograma para organizar el desarrollo en los tres días disponibles.  
- Asignación de responsabilidades generales y establecimiento de puntos de revisión diarios.  

### Cronograma  
- **Día 1**:  
  - Configuración de herramientas y preparación del entorno de desarrollo.  
  - Inicio del desarrollo del contrato principal **BuildingDAO**.  
  - Diseño preliminar de la interfaz y definición de los flujos principales.  

- **Día 2**:  
  - Finalización y prueba de los contratos inteligentes.  
  - Desarrollo de funcionalidades clave en la interfaz, como la creación y visualización de propuestas.  
  - Integración inicial entre la interfaz y los contratos inteligentes.  

- **Día 3**:  
  - Pruebas exhaustivas del sistema completo.  
  - Ajustes basados en retroalimentación interna.  
  - Preparación para el despliegue y presentación.  

### Recursos Utilizados  
- **Herramientas**:  
  - Hardhat para el desarrollo y pruebas de contratos inteligentes.  
  - Scaffold-eth como plantilla para integrar los contratos con la interfaz.  
  - Next.js para desarrollar la aplicación web.  
  - Ethers.js para la interacción con la blockchain.  
- **Presupuesto**: Uso de recursos gratuitos proporcionados durante la hackaton.  


## 2 Diseño  
### UI/UX  
- Creación de wireframes para definir el flujo de usuario:  
  - Pantalla de inicio con el estado de las propuestas.  
  - Formularios para crear propuestas y votar.  
- Diseño de una interfaz intuitiva, con énfasis en claridad para usuarios no técnicos.  

### Revisión de Diseño  
- Validación interna de los wireframes y prototipos.  
- Ajustes basados en retroalimentación temprana para optimizar la usabilidad.  

---

## 3. Desarrollo  
### Backend (Contratos Inteligentes)  
- Implementación de **BuildingDAO**, **Vote**, y **VoteToken**:  
  - **BuildingDAO** gestiona propietarios, propuestas y votos delegados.  
  - **Vote** regula votaciones específicas, asegurando cumplimiento de quórum y mayorías.  
  - **VoteToken** implementa tokens ERC721 como representación de unidades habitables.  

### Frontend  
- Desarrollo de una interfaz que proporciona  **Next.js**:  
  - Formularios para la creación de propuestas.  
  - Tablas y gráficos para mostrar el estado y los resultados de las votaciones.  

### Integración  
- Conexión del frontend con los contratos inteligentes usando **ethers.js**.  
- Validación de datos dinámicos, como el quórum alcanzado y las mayorías necesarias.  

---

##  4 Pruebas  
### QA Testing  
- Pruebas unitarias en los contratos inteligentes utilizando Hardhat:  
  - Validación de las reglas de votación y transferencia de tokens.  
  - Comprobación de casos límite, como la creación de propuestas inválidas.  

### Pruebas de Usuario  
- Simulación de flujos completos desde la creación hasta la ejecución de propuestas.  
- Recolección de retroalimentación para ajustar la experiencia de usuario.  

---

## 5. Despliegue  
### Lanzamiento  
- Publicación del sistema en una red de prueba (Goerli).  
- Verificación del funcionamiento de la interfaz conectada a los contratos.  

### Configuración Final  
- Resolución de errores finales antes de la presentación.  
- Validación de la experiencia de usuario en el entorno de producción.  

---

## Resumen  
BuildingDAO fue desarrollado en **tres días**, logrando un sistema funcional que combina tecnología blockchain con un diseño enfocado en las necesidades de los usuarios. Este proyecto destaca cómo una buena planificación y ejecución en equipo pueden producir resultados innovadores en tiempo récord. 🚀  
