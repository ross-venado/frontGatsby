import type { Business, BusinessModule, PlanCode } from '@/types/mercadito';

export type ModuleDefinition = {
  code: BusinessModule;
  label: string;
  hint: string;
  href: string;
  categorySlugs: string[];
};

export const moduleDefinitions: ModuleDefinition[] = [
  {
    code: 'restaurant',
    label: 'Restaurante',
    hint: 'Mesas, pedidos y menu QR',
    href: '/dashboard/restaurant',
    categorySlugs: ['comida-y-restaurantes'],
  },
  {
    code: 'inventory',
    label: 'Inventario',
    hint: 'Stock, productos y control de tienda',
    href: '/dashboard/inventory',
    categorySlugs: ['tiendas', 'tecnologia', 'repuestos-y-accesorios'],
  },
  {
    code: 'quotes',
    label: 'Cotizaciones',
    hint: 'Solicitudes, precios y seguimiento',
    href: '/dashboard/quotes',
    categorySlugs: [
      'tiendas',
      'repuestos-y-accesorios',
      'pvc-vidrio-y-aluminio',
      'herreria',
      'servicios-profesionales',
      'tecnologia',
    ],
  },
  {
    code: 'appointments',
    label: 'Citas',
    hint: 'Agenda, horarios y servicios reservables',
    href: '/dashboard/appointments',
    categorySlugs: ['belleza-y-citas', 'servicios-profesionales'],
  },
  {
    code: 'automotive',
    label: 'Automotriz',
    hint: 'Vehiculos, prospectos y fichas',
    href: '/dashboard/automotive',
    categorySlugs: ['importadores-de-carros'],
  },
  {
    code: 'workshop',
    label: 'Taller',
    hint: 'Ordenes, servicios y seguimiento',
    href: '/dashboard/workshop',
    categorySlugs: ['talleres-mecanicos', 'polarizado-y-detailing'],
  },
  {
    code: 'live_sales',
    label: 'Venta en vivo',
    hint: 'Producto actual, historial y solicitudes por WhatsApp',
    href: '/dashboard/live',
    categorySlugs: [
      'comida-y-restaurantes',
      'tiendas',
      'tecnologia',
      'repuestos-y-accesorios',
      'importadores-de-carros',
      'talleres-mecanicos',
      'polarizado-y-detailing',
      'pvc-vidrio-y-aluminio',
      'herreria',
      'belleza-y-citas',
      'servicios-profesionales',
    ],
  },
];

export function businessCategorySlug(business: Business | null) {
  if (!business?.categoryId || typeof business.categoryId !== 'object') {
    return '';
  }

  return business.categoryId.slug;
}

export function planAllowsPremiumModules(plan: PlanCode) {
  return plan === 'plus' || plan === 'pro';
}

export function recommendedModulesForCategory(categorySlug: string) {
  return moduleDefinitions
    .filter((moduleDefinition) =>
      moduleDefinition.categorySlugs.includes(categorySlug),
    )
    .map((moduleDefinition) => moduleDefinition.code);
}

export function modulesForPlanAndCategory(
  plan: PlanCode,
  categorySlug: string,
  currentModules: BusinessModule[] = [],
) {
  const baseModules = new Set<BusinessModule>(['marketplace', ...currentModules]);

  if (!planAllowsPremiumModules(plan)) {
    return Array.from(baseModules);
  }

  for (const moduleCode of recommendedModulesForCategory(categorySlug)) {
    baseModules.add(moduleCode);
  }

  return Array.from(baseModules);
}

export function activeModuleLinks(business: Business | null) {
  if (!business) {
    return [];
  }

  const enabledModules = new Set<BusinessModule>(business.modules || []);

  return moduleDefinitions
    .filter((moduleDefinition) => enabledModules.has(moduleDefinition.code))
    .flatMap((moduleDefinition) => {
      if (moduleDefinition.code === 'restaurant') {
        return [
          { href: `/m/${business.slug}`, label: 'Menu QR' },
          { href: '/dashboard/restaurant', label: 'Restaurante' },
          { href: '/dashboard/restaurant/tables', label: 'Mesas' },
          { href: '/dashboard/restaurant/orders', label: 'Pedidos' },
        ];
      }

      return [{ href: moduleDefinition.href, label: moduleDefinition.label }];
    });
}
