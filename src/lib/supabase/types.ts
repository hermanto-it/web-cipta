type GenericTable = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

type GenericView = {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: [];
};

type GenericFunction = {
  Args: Record<string, unknown> | never;
  Returns: unknown;
};

export type Database = {
  public: {
    Tables: {
      admin_users: GenericTable;
      brands: GenericTable;
      categories: GenericTable;
      company_settings: GenericTable;
      homepage_banners: GenericTable;
      homepage_sections: GenericTable;
      inquiries: GenericTable;
      product_images: GenericTable;
      product_taxonomy: GenericTable;
      products: GenericTable;
      [tableName: string]: GenericTable;
    };
    Views: {
      [viewName: string]: GenericView;
    };
    Functions: {
      [fnName: string]: GenericFunction;
    };
  };
};
