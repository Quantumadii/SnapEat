CREATE TABLE IF NOT EXISTS branches (
    id BIGSERIAL PRIMARY KEY,
    restaurant_id BIGINT NOT NULL,
    branch_name VARCHAR(255) NOT NULL,
    address TEXT,
    area VARCHAR(255) NOT NULL,
    city VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(255),
    opening_hours VARCHAR(255),
    delivery_coverage TEXT,
    image_url VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

DO $$
BEGIN
    IF to_regclass('public.restaurants') IS NOT NULL AND NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints tc
        WHERE tc.table_name = 'branches'
          AND tc.constraint_name = 'fk_branches_restaurant'
    ) THEN
        ALTER TABLE branches
            ADD CONSTRAINT fk_branches_restaurant
            FOREIGN KEY (restaurant_id) REFERENCES restaurants(id);
    END IF;
END $$;

DO $$
BEGIN
    IF to_regclass('public.menu_items') IS NOT NULL THEN
        ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS branch_id BIGINT;
        IF to_regclass('public.branches') IS NOT NULL AND NOT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            WHERE tc.table_name = 'menu_items'
              AND tc.constraint_name = 'fk_menu_items_branch'
        ) THEN
            ALTER TABLE menu_items
                ADD CONSTRAINT fk_menu_items_branch
                FOREIGN KEY (branch_id) REFERENCES branches(id);
        END IF;
    END IF;
END $$;

DO $$
BEGIN
    IF to_regclass('public.orders') IS NOT NULL THEN
        ALTER TABLE orders ADD COLUMN IF NOT EXISTS branch_id BIGINT;
        IF to_regclass('public.branches') IS NOT NULL AND NOT EXISTS (
            SELECT 1
            FROM information_schema.table_constraints tc
            WHERE tc.table_name = 'orders'
              AND tc.constraint_name = 'fk_orders_branch'
        ) THEN
            ALTER TABLE orders
                ADD CONSTRAINT fk_orders_branch
                FOREIGN KEY (branch_id) REFERENCES branches(id);
        END IF;
    END IF;
END $$;
