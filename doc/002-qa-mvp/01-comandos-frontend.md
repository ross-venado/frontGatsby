# Comandos Frontend

## Variables

```bash
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Instalar y levantar

```bash
cd /Users/venado/Project/chimaltenango/frontend
npm install
npm run dev
```

La app abre en:

```text
http://localhost:3000
```

## Validaciones

```bash
npm run typecheck
npm run lint
npm run build
```

Si se corre `npm run build` mientras `npm run dev` esta activo, reiniciar limpio:

```bash
rm -rf .next
npm run dev
```
