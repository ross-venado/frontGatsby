# QA MVP Frontend

Este documento cierra la primera version funcional del frontend de Mercadito Chimalteco.

## Alcance validado

- Home publica.
- Listado de negocios.
- Pagina publica por negocio.
- Productos y servicios visibles para negocio aprobado.
- Boton de WhatsApp con `wa.me`.
- Boton de ubicacion con Google Maps.
- QR real generado como SVG.
- Registro publico sin selector de admin.
- Dashboard de negocio.
- CRUD de categorias internas.
- CRUD de productos y servicios usando categorias internas.
- Backoffice en `/cq-backoffice` con login admin.
- Menu de negocio no muestra backoffice a usuarios negocio.

## Problemas encontrados

- El QR estaba como placeholder; se reemplazo por `qrcode.react`.
- El backoffice mostro alta de admin; se cambio a login privado de admin.
- La cache `.next` puede quedar inconsistente si se corre `next build` mientras `next dev` esta activo. Solucion: detener dev server, borrar `.next` y levantar de nuevo.
