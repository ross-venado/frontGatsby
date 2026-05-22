# Modulo restaurante frontend

Primera interfaz para negocios de comida con menu QR, mesas y pedidos por mesa.

## Rutas agregadas

- `/dashboard/restaurant`
- `/dashboard/restaurant/tables`
- `/dashboard/restaurant/orders`
- `/r/[businessSlug]/mesa/[qrSlug]`

## Comportamiento

- El dashboard muestra el modulo restaurante como seccion comercial.
- Si el negocio tiene `restaurant` en `modules`, se habilitan mesas y pedidos.
- Mesas permite crear, editar, activar/desactivar, copiar link QR y ver QR visual.
- Pedidos permite listar, filtrar por estado, ver detalle, cambiar estado y eliminar.
- La ruta publica QR muestra productos activos y permite enviar pedido sin login.

## Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Notas

- El QR usa el link publico `/r/[businessSlug]/mesa/[qrSlug]`.
- La vista publica no guarda pagos ni delivery.
- El backend recalcula precios y valida que los productos pertenezcan al negocio.
