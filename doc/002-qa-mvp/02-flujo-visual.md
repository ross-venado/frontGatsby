# Flujo Visual MVP

## Negocio

1. Entrar a `http://localhost:3000/login`.
2. Cambiar a registro.
3. Crear usuario negocio.
4. Ir a `/dashboard`.
5. Guardar datos del negocio.
6. Ir a `/dashboard/categories`.
7. Crear una categoria interna.
8. Ir a `/dashboard/products`.
9. Crear producto usando categoria interna.
10. Ir a `/dashboard/services`.
11. Crear servicio usando categoria interna.

## Admin

1. Crear admin por API con `POST /auth/backoffice/register` y `ADMIN_SETUP_KEY`.
2. Entrar a `http://localhost:3000/cq-backoffice`.
3. Hacer login con usuario admin.
4. Aprobar negocio y asignar plan.

## Publico

1. Entrar a `http://localhost:3000/businesses`.
2. Abrir el negocio aprobado.
3. Confirmar productos.
4. Confirmar servicios.
5. Confirmar QR visible.
6. Confirmar boton WhatsApp.
7. Confirmar boton Ubicacion.

## Usuario de prueba generado por QA

El script backend `scripts/qa-mvp.sh` imprime:

- `businessEmail`
- `adminEmail`
- `frontendUrl`

Usar esos datos para revisar el flujo visual creado por la prueba.
