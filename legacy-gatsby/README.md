
## 🛍️ frontend/README.md - Catálogo de Productos (Gatsby)

Este es un sitio web básico hecho con **Gatsby (React)** que consume la API de productos que creamos con NestJS.

Muestra todos los productos y te permite crear nuevos desde un formulario.

---

### 🚀 ¿Qué hace este frontend?

* ✅ Lista productos desde el backend (`GET /products`)
* ✅ Permite crear productos (`POST /products`)
* ✅ Se ve bien en desktop y móvil
* ✅ Estilizado con CSS limpio y sin librerías externas

---

### 🛠️ Requisitos

* Node.js v18
* Backend de productos corriendo en `http://localhost:5001`

---

### 🧪 Cómo correrlo localmente

1. Clona o descarga este proyecto y entra a la carpeta:

```bash
cd gatsby-product-frontend
npm install
```

2. Inicia Gatsby:

```bash
gatsby develop
```

3. Abre en el navegador:

📍 [http://localhost:8000](http://localhost:8000)

Deberías ver los productos cargados desde tu API local.

---

### ✏️ Crear productos

Usá el formulario de la parte superior para agregar un producto con:

* Nombre
* Precio
* URL de imagen

---

### 🧠 ¿Y en producción?

Podés hacer build con:

```bash
gatsby build
```

Y servir el sitio con:

```bash
gatsby serve
```
