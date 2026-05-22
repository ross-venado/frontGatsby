export type BusinessStatus = 'draft' | 'active' | 'suspended';
export type PlanCode = 'free' | 'basic' | 'plus' | 'pro';
export type ProductStatus = 'active' | 'inactive' | 'sold_out';
export type ServiceStatus = 'active' | 'inactive';
export type AdminRole = 'super_admin' | 'operations' | 'support' | 'billing';
export type BusinessRole = 'owner' | 'manager' | 'catalog_manager' | 'staff';
export type CatalogCategoryType = 'product' | 'service' | 'both';
export type BusinessModule =
  | 'marketplace'
  | 'restaurant'
  | 'automotive'
  | 'workshop'
  | 'quotes'
  | 'appointments';
export type RestaurantTableStatus =
  | 'free'
  | 'occupied'
  | 'waiting_payment'
  | 'inactive';
export type RestaurantOrderStatus =
  | 'new'
  | 'preparing'
  | 'ready'
  | 'delivered'
  | 'waiting_payment'
  | 'paid'
  | 'cancelled';

export type BusinessCategory = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  active: boolean;
};

export type BusinessCatalogCategory = {
  _id: string;
  businessId: string;
  name: string;
  slug: string;
  description?: string;
  type: CatalogCategoryType;
  active: boolean;
};

export type Business = {
  _id: string;
  ownerId?: string;
  name: string;
  slug: string;
  description?: string;
  categoryId?: BusinessCategory | string;
  phone?: string;
  whatsapp?: string;
  address?: string;
  location?: { lat: number; lng: number };
  logoUrl?: string;
  coverUrl?: string;
  status: BusinessStatus;
  plan: PlanCode;
  modules: BusinessModule[];
};

export type Product = {
  _id: string;
  businessId: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  images: string[];
  category?: string;
  stock?: number;
  status: ProductStatus;
  attributes?: Record<string, unknown>;
};

export type Service = {
  _id: string;
  businessId: string;
  name: string;
  slug: string;
  description?: string;
  priceFrom?: number;
  priceTo?: number;
  images: string[];
  category?: string;
  status: ServiceStatus;
  attributes?: Record<string, unknown>;
};

export type SubscriptionPlan = {
  _id: string;
  code: PlanCode;
  name: string;
  price: number;
  productLimit: number;
  features: string[];
  active: boolean;
};

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'business_owner';
  adminRole?: AdminRole;
  businessRole?: BusinessRole;
};

export type AuthResponse = {
  user: AuthUser;
  token: string;
};

export type RestaurantTable = {
  _id: string;
  businessId: string;
  name: string;
  code: string;
  qrSlug: string;
  status: RestaurantTableStatus;
  active: boolean;
};

export type RestaurantOrderItem = {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  subtotal: number;
};

export type RestaurantOrder = {
  _id: string;
  businessId: string;
  tableId: RestaurantTable | string;
  orderNumber: number;
  customerName?: string;
  customerPhone?: string;
  status: RestaurantOrderStatus;
  items: RestaurantOrderItem[];
  total: number;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicRestaurantTablePayload = {
  business: Business;
  table: RestaurantTable;
  products: Product[];
};
