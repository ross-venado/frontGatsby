# Flujo visual restaurante

## Preparacion

1. Levantar backend en `http://localhost:5001`.
2. Levantar frontend en `http://localhost:3000`.
3. Crear o usar un negocio con productos activos.
4. Activar `restaurant` en el negocio desde `/cq-backoffice`.

## Flujo negocio

1. Entrar a `/login` con usuario negocio.
2. Abrir `/dashboard/restaurant`.
3. Entrar a `Mesas`.
4. Crear una mesa, por ejemplo `Mesa 1`.
5. Copiar el link QR o escanear el QR visual.
6. Entrar a `Pedidos` y dejar abierto para validar entradas.

## Flujo cliente QR

1. Abrir `/r/[businessSlug]/mesa/[qrSlug]`.
2. Ver nombre del negocio y mesa.
3. Agregar productos activos al pedido.
4. Agregar notas por producto si aplica.
5. Ingresar nombre o telefono opcional.
6. Enviar pedido.
7. Confirmar mensaje con numero de pedido.

## Validacion operativa

1. Volver a `/dashboard/restaurant/orders`.
2. Confirmar que aparece el pedido.
3. Abrir detalle y revisar items, notas y total.
4. Cambiar estado a `preparing`, `ready`, `delivered`, `waiting_payment`, `paid` o `cancelled`.
5. Confirmar que el filtro por estado devuelve el pedido correcto.

## Caso sin modulo activo

Si el negocio no tiene `restaurant` en `modules`, `/dashboard/restaurant` muestra el mensaje:

`Activa el modulo restaurante para manejar mesas, pedidos y menu QR.`
