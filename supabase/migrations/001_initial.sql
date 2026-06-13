-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    display_name TEXT,
    total_orders INTEGER DEFAULT 0,
    last_order_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    order_id UUID,
    wa_message_id TEXT UNIQUE,
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    body TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES customers(id),
    raw_message TEXT,
    items JSONB,
    delivery_date DATE,
    delivery_type TEXT DEFAULT 'pickup',
    total_amount NUMERIC,
    advance_paid NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'confirmed', 'in_progress', 'ready', 'delivered', 'cancelled')),
    confirmation_sent BOOLEAN DEFAULT FALSE,
    notes TEXT,
    is_price_query BOOLEAN DEFAULT FALSE,
    suggested_reply TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add order_id foreign key to messages
ALTER TABLE messages ADD CONSTRAINT messages_order_id_fkey 
FOREIGN KEY (order_id) REFERENCES orders(id);

-- Menu items table
CREATE TABLE menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    aliases TEXT[] DEFAULT '{}',
    base_price NUMERIC,
    unit TEXT DEFAULT 'piece',
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto update customer order count trigger
CREATE OR REPLACE FUNCTION update_customer_order_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE customers
  SET 
    total_orders = (
      SELECT COUNT(*) FROM orders WHERE customer_id = NEW.customer_id
    ),
    last_order_at = NOW()
  WHERE id = NEW.customer_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_order_insert
AFTER INSERT ON orders
FOR EACH ROW
EXECUTE FUNCTION update_customer_order_count();

-- RLS Policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on customers" ON customers FOR SELECT USING (true);
CREATE POLICY "Allow service role full access on customers" ON customers USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Allow update on orders" ON orders FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Allow service role full access on orders" ON orders USING (true) WITH CHECK (true);

CREATE POLICY "Allow public realtime on orders" ON orders FOR SELECT USING (true);

CREATE POLICY "Allow insert on messages" ON messages FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow service role full access on messages" ON messages USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read on menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Allow insert on menu_items" ON menu_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow update on menu_items" ON menu_items FOR UPDATE USING (true) WITH CHECK (true);