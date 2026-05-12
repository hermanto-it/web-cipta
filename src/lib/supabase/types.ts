export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableDef<Row, Insert, Update> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: [];
};

type SeoFields = {
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  canonical_url: string | null;
};

export type Database = {
  public: {
    Tables: {
      admin_users: TableDef<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>;
      brands: TableDef<
        {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        } & SeoFields,
        Partial<{
          id: string;
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          sort_order: number;
          is_active: boolean;
        } & SeoFields>,
        Partial<{
          name: string;
          slug: string;
          description: string | null;
          logo_url: string | null;
          sort_order: number;
          is_active: boolean;
        } & SeoFields>
      >;
      categories: TableDef<
        {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        } & SeoFields,
        Partial<{
          id: string;
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
        } & SeoFields>,
        Partial<{
          name: string;
          slug: string;
          description: string | null;
          sort_order: number;
          is_active: boolean;
        } & SeoFields>
      >;
      company_settings: TableDef<
        { id: string; key: string; value: Json; created_at: string; updated_at: string },
        Partial<{ id: string; key: string; value: Json }>,
        Partial<{ key: string; value: Json }>
      >;
      homepage_banners: TableDef<
        {
          id: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          image_url: string | null;
          cta_label: string | null;
          cta_href: string | null;
          placement:
            | "hero"
            | "side_promo"
            | "middle_promo"
            | "bottom_cta"
            | "benefit_free_delivery"
            | "benefit_support_247"
            | "benefit_payment"
            | "benefit_reliable"
            | "benefit_guarantee";
          badge: string | null;
          price_text: string | null;
          sort_order: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        } & SeoFields,
        Partial<{
          id: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          image_url: string | null;
          cta_label: string | null;
          cta_href: string | null;
          placement:
            | "hero"
            | "side_promo"
            | "middle_promo"
            | "bottom_cta"
            | "benefit_free_delivery"
            | "benefit_support_247"
            | "benefit_payment"
            | "benefit_reliable"
            | "benefit_guarantee";
          badge: string | null;
          price_text: string | null;
          sort_order: number;
          is_active: boolean;
        } & SeoFields>,
        Partial<{
          title: string;
          subtitle: string | null;
          description: string | null;
          image_url: string | null;
          cta_label: string | null;
          cta_href: string | null;
          placement:
            | "hero"
            | "side_promo"
            | "middle_promo"
            | "bottom_cta"
            | "benefit_free_delivery"
            | "benefit_support_247"
            | "benefit_payment"
            | "benefit_reliable"
            | "benefit_guarantee";
          badge: string | null;
          price_text: string | null;
          sort_order: number;
          is_active: boolean;
        } & SeoFields>
      >;
      homepage_sections: TableDef<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>;
      inquiries: TableDef<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>;
      product_images: TableDef<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>;
      product_taxonomy: TableDef<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>;
      products: TableDef<
        {
          id: string;
          brand_id: string;
          category_id: string;
          taxonomy_id: string | null;
          sku: string | null;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          price: number | null;
          compare_at_price: number | null;
          tax_rate: number | null;
          tax_amount: number | null;
          final_price: number | null;
          is_tax_included: boolean;
          currency: string;
          stock_quantity: number;
          is_featured: boolean;
          is_best_seller: boolean;
          is_promo: boolean;
          is_active: boolean;
          badge: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        } & SeoFields,
        Partial<{
          id: string;
          brand_id: string;
          category_id: string;
          taxonomy_id: string | null;
          sku: string | null;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          price: number | null;
          compare_at_price: number | null;
          tax_rate: number | null;
          tax_amount: number | null;
          final_price: number | null;
          is_tax_included: boolean;
          currency: string;
          stock_quantity: number;
          is_featured: boolean;
          is_best_seller: boolean;
          is_promo: boolean;
          is_active: boolean;
          badge: string | null;
          sort_order: number;
        } & SeoFields>,
        Partial<{
          brand_id: string;
          category_id: string;
          taxonomy_id: string | null;
          sku: string | null;
          name: string;
          slug: string;
          short_description: string | null;
          description: string | null;
          price: number | null;
          compare_at_price: number | null;
          tax_rate: number | null;
          tax_amount: number | null;
          final_price: number | null;
          is_tax_included: boolean;
          currency: string;
          stock_quantity: number;
          is_featured: boolean;
          is_best_seller: boolean;
          is_promo: boolean;
          is_active: boolean;
          badge: string | null;
          sort_order: number;
        } & SeoFields>
      >;
      [tableName: string]: TableDef<Record<string, unknown>, Record<string, unknown>, Record<string, unknown>>;
    };
    Views: {
      [viewName: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
        Relationships: [];
      };
    };
    Functions: {
      [fnName: string]: {
        Args: Record<string, unknown> | never;
        Returns: unknown;
      };
    };
  };
};
