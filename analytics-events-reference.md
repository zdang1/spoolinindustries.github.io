# Analytics Events Reference - Spoolin Industries

Complete list of all possible analytics events for tracking user behavior, admin actions, and system interactions.

**Event Naming Convention**: `snake_case` (lowercase with underscores)
**Status Legend**: 
- ✅ = Currently Implemented
- 🚧 = Planned (from workflow diagrams)
- 📋 = Recommended (not yet in workflows)

---

## Public Website Events

### Homepage & Navigation
- ✅ `page_view` - Page load (auto-tracked by GA4)
- ✅ `call_click` - Phone number clicked
- ✅ `email_click` - Email address clicked
- ✅ `map_click` - Google Maps link clicked
- 📋 `navigation_click` - Navigation menu item clicked
  - Params: `menu_item`, `section`
- 📋 `scroll_depth` - User scrolls to certain depth
  - Params: `depth_percent` (25, 50, 75, 100)
- 📋 `section_view` - Specific section viewed
  - Params: `section_name` (hero, services, gallery, testimonials, etc.)

### Quote Request Form (index.html)
- ✅ `quote_request_submit` - Quote request form submitted
  - Params: `service_type`, `vehicle_make`, `vehicle_model`, `vehicle_year`, `budget_range`
- 📋 `quote_request_start` - User starts quote request wizard
- 📋 `quote_request_step_view` - User views a step in wizard
  - Params: `step_number` (1-4), `step_name`
- 📋 `quote_request_service_select` - Service type selected
  - Params: `service_type` (exhaust, suspension, turbo, body, engine, other)
- 📋 `quote_request_budget_change` - Budget slider adjusted
  - Params: `budget_amount`
- 📋 `quote_request_abandon` - User abandons form
  - Params: `step_abandoned`, `time_spent_seconds`

### Shop Page (shop.html)
- ✅ `product_view` - Product detail modal opened
  - Params: `product_id`, `product_name`, `product_category`, `product_price`
- ✅ `add_to_cart` - Product added to cart
  - Params: `product_id`, `product_name`, `product_price`, `quantity`
- ✅ `add_to_wishlist` - Product added to wishlist
  - Params: `product_id`, `product_name`
- ✅ `share_product` - Product shared
  - Params: `product_id`, `product_name`, `share_method` (native, copy_link)
- 📋 `shop_page_view` - Shop page loaded
- 📋 `product_search` - User searches products
  - Params: `search_query`, `results_count`
- 📋 `product_filter` - User filters products
  - Params: `filter_type` (category, price_range, status), `filter_value`
- 📋 `product_category_view` - Category page viewed
  - Params: `category_name`
- 📋 `cart_view` - Cart modal/page opened
  - Params: `cart_items_count`, `cart_total_value`
- 📋 `cart_item_remove` - Item removed from cart
  - Params: `product_id`, `product_name`
- 📋 `cart_item_update` - Cart item quantity changed
  - Params: `product_id`, `old_quantity`, `new_quantity`
- 📋 `wishlist_view` - Wishlist viewed
  - Params: `wishlist_items_count`
- 📋 `wishlist_item_remove` - Item removed from wishlist
  - Params: `product_id`
- 📋 `checkout_start` - User starts checkout process
  - Params: `cart_items_count`, `cart_total_value`
- 📋 `checkout_complete` - Order placed successfully
  - Params: `order_id`, `order_total`, `order_items_count`, `payment_method`

### User Authentication (Public)
- 📋 `user_register` - User creates account
  - Params: `registration_method` (email, google, facebook)
- 📋 `user_login` - User logs in
  - Params: `login_method` (email, google, facebook)
- 📋 `user_logout` - User logs out
- 📋 `password_reset_request` - Password reset requested
- 📋 `password_reset_complete` - Password reset completed

### Lead Generation
- ✅ `lead_submit` - Lead form submitted (if separate from quote request)
  - Params: `lead_source` (web, phone, social, walk_in), `lead_type`
- 📋 `contact_form_submit` - General contact form submitted
  - Params: `form_type`, `subject`
- 📋 `newsletter_signup` - Newsletter subscription
  - Params: `source` (homepage, shop, footer)

---

## Admin Panel Events

### Authentication
- ✅ `admin_login` - Admin user logs in
  - Params: `user_id`, `user_role`
- 📋 `admin_login_failed` - Failed login attempt
  - Params: `error_code`, `email` (hashed/anonymized)
- 📋 `admin_logout` - Admin user logs out
- 📋 `admin_session_timeout` - Session expired
- 📋 `admin_access_denied` - Access denied due to permissions
  - Params: `user_id`, `requested_page`, `required_role`

### Dashboard
- 📋 `admin_dashboard_view` - Dashboard page viewed
- 📋 `admin_quick_link_click` - Quick link clicked from dashboard
  - Params: `link_target`, `link_name`

### Products Management
- ✅ `create_product` - New product created
  - Params: `product_id`, `product_name`, `product_category`, `product_price`
- ✅ `update_product` - Product updated
  - Params: `product_id`, `product_name`, `fields_changed[]`
- ✅ `delete_product` - Product deleted
  - Params: `product_id`, `product_name`
- 📋 `product_image_upload` - Product image uploaded
  - Params: `product_id`, `image_count`, `total_images`
- 📋 `product_image_delete` - Product image deleted
  - Params: `product_id`, `image_url`
- 📋 `product_status_change` - Product status changed
  - Params: `product_id`, `old_status`, `new_status`
- 📋 `product_featured_toggle` - Featured flag toggled
  - Params: `product_id`, `is_featured`

### Leads Management (🚧 Planned)
- 🚧 `create_lead` - New lead created
  - Params: `lead_id`, `lead_source`, `lead_status`
- 🚧 `update_lead` - Lead updated
  - Params: `lead_id`, `fields_changed[]`
- 🚧 `lead_status_change` - Lead status changed
  - Params: `lead_id`, `old_status`, `new_status` (new, contacted, booked, won, lost)
- 🚧 `lead_convert_to_quote` - Lead converted to quote
  - Params: `lead_id`, `quote_id`
- 🚧 `lead_convert_to_customer` - Lead converted to customer
  - Params: `lead_id`, `customer_id`
- 🚧 `lead_note_add` - Note added to lead
  - Params: `lead_id`
- 🚧 `lead_attachment_upload` - Attachment uploaded
  - Params: `lead_id`, `file_type`, `file_size`

### Quotes Management (🚧 Planned)
- 🚧 `create_quote` - New quote created
  - Params: `quote_id`, `quote_number`, `customer_id`, `quote_total`
- 🚧 `update_quote` - Quote updated
  - Params: `quote_id`, `fields_changed[]`
- 🚧 `send_quote` - Quote sent to customer
  - Params: `quote_id`, `quote_number`, `customer_id`, `delivery_method` (email, pdf)
- 🚧 `quote_accepted` - Customer accepted quote
  - Params: `quote_id`, `quote_number`, `customer_id`
- 🚧 `quote_declined` - Customer declined quote
  - Params: `quote_id`, `quote_number`, `customer_id`, `reason`
- 🚧 `quote_expired` - Quote expired
  - Params: `quote_id`, `quote_number`
- 🚧 `quote_convert_to_job` - Quote converted to job
  - Params: `quote_id`, `job_id`
- 🚧 `quote_version_create` - New quote version created
  - Params: `quote_id`, `version_number`
- 🚧 `quote_approve` - Quote version approved
  - Params: `quote_id`, `version_number`, `approved_by`

### Invoices & Payments (🚧 Planned)
- 🚧 `create_invoice` - New invoice created
  - Params: `invoice_id`, `invoice_number`, `customer_id`, `invoice_total`, `source` (job, quote, manual)
- 🚧 `update_invoice` - Invoice updated
  - Params: `invoice_id`, `fields_changed[]`
- 🚧 `send_invoice` - Invoice sent to customer
  - Params: `invoice_id`, `invoice_number`, `customer_id`, `delivery_method`
- 🚧 `invoice_status_change` - Invoice status changed
  - Params: `invoice_id`, `old_status`, `new_status` (draft, sent, paid, partial, overdue)
- 🚧 `payment_recorded` - Payment recorded
  - Params: `payment_id`, `invoice_id`, `payment_amount`, `payment_method`, `payment_reference`
- 🚧 `invoice_mark_paid` - Invoice marked as fully paid
  - Params: `invoice_id`, `invoice_number`, `total_paid`
- 🚧 `create_credit_note` - Credit note created
  - Params: `credit_note_id`, `invoice_id`, `credit_amount`, `reason`
- 🚧 `invoice_overdue` - Invoice marked as overdue
  - Params: `invoice_id`, `invoice_number`, `days_overdue`

### Jobs Management (🚧 Planned)
- 🚧 `create_job` - New job created
  - Params: `job_id`, `job_number`, `customer_id`, `vehicle_id`, `source` (quote, lead, manual)
- 🚧 `update_job` - Job updated
  - Params: `job_id`, `fields_changed[]`
- 🚧 `job_stage_change` - Job stage changed
  - Params: `job_id`, `old_stage`, `new_stage` (booked, fab, qa, complete)
- 🚧 `job_assign_tech` - Technician assigned to job
  - Params: `job_id`, `technician_id`, `technician_name`
- 🚧 `job_due_date_set` - Due date set/changed
  - Params: `job_id`, `due_date`
- 🚧 `job_note_add` - Note added to job
  - Params: `job_id`
- 🚧 `job_photo_upload` - Photo uploaded to job
  - Params: `job_id`, `photo_count`
- 🚧 `job_parts_reserve` - Parts reserved for job
  - Params: `job_id`, `parts_count`, `parts_total_value`
- 🚧 `job_parts_use` - Parts used from job
  - Params: `job_id`, `parts_count`, `parts_total_value`
- 🚧 `job_complete` - Job marked as complete
  - Params: `job_id`, `job_number`, `completion_date`

### Schedule Management (🚧 Planned)
- 🚧 `schedule_event_create` - Schedule event created
  - Params: `event_id`, `event_type` (job, dropoff, pickup, other), `resource_type` (bay, technician), `resource_id`
- 🚧 `schedule_event_update` - Schedule event updated
  - Params: `event_id`, `fields_changed[]`
- 🚧 `schedule_event_delete` - Schedule event deleted
  - Params: `event_id`
- 🚧 `schedule_event_move` - Event moved (drag & drop)
  - Params: `event_id`, `old_time`, `new_time`, `old_resource`, `new_resource`
- 🚧 `schedule_conflict_detected` - Scheduling conflict detected
  - Params: `event_id`, `conflict_type`, `conflicting_event_id`
- 🚧 `schedule_capacity_warning` - Capacity warning shown
  - Params: `resource_id`, `resource_type`, `utilization_percent`

### Time Tracking (🚧 Planned)
- 🚧 `time_entry_create` - Time entry created
  - Params: `entry_id`, `job_id`, `technician_id`, `duration_hours`, `is_billable`
- 🚧 `time_entry_update` - Time entry updated
  - Params: `entry_id`, `fields_changed[]`
- 🚧 `time_entry_delete` - Time entry deleted
  - Params: `entry_id`
- 🚧 `time_entry_mark_billable` - Time entry marked as billable
  - Params: `entry_id`, `billable_rate`
- 🚧 `time_entry_mark_rework` - Time entry marked as rework
  - Params: `entry_id`, `rework_reason`
- 🚧 `timesheet_export` - Timesheet exported
  - Params: `technician_id`, `date_range`, `export_format` (csv, pdf)

### QA & Checklists (🚧 Planned)
- 🚧 `qa_checklist_create` - QA checklist created
  - Params: `qa_id`, `job_id`, `checklist_type`, `template_id`
- 🚧 `qa_checklist_item_complete` - Checklist item completed
  - Params: `qa_id`, `item_id`, `photo_required`, `photo_uploaded`
- 🚧 `qa_checklist_sign_off` - Checklist signed off
  - Params: `qa_id`, `signed_by`, `sign_off_date`
- 🚧 `qa_defect_add` - Defect recorded
  - Params: `qa_id`, `defect_id`, `defect_severity`, `defect_location`
- 🚧 `qa_defect_resolve` - Defect resolved
  - Params: `qa_id`, `defect_id`, `resolution_method`
- 🚧 `qa_photo_upload` - QA photo uploaded
  - Params: `qa_id`, `photo_type` (checklist, defect)

### Warranty Claims (🚧 Planned)
- 🚧 `warranty_claim_create` - Warranty claim created
  - Params: `warranty_id`, `claim_number`, `job_id`, `customer_id`, `issue_description`
- 🚧 `warranty_claim_update` - Warranty claim updated
  - Params: `warranty_id`, `fields_changed[]`
- 🚧 `warranty_status_change` - Warranty status changed
  - Params: `warranty_id`, `old_status`, `new_status` (open, investigating, fixed, resolved, denied)
- 🚧 `warranty_root_cause_record` - Root cause recorded
  - Params: `warranty_id`, `root_cause_category`
- 🚧 `warranty_fix_record` - Fix recorded
  - Params: `warranty_id`, `fix_cost`, `fix_time_hours`, `parts_used`
- 🚧 `warranty_outcome_record` - Customer outcome recorded
  - Params: `warranty_id`, `customer_satisfaction`, `resolution_status`

### Customers Management (🚧 Planned)
- 🚧 `create_customer` - New customer created
  - Params: `customer_id`, `customer_name`, `source` (manual, lead, import)
- 🚧 `update_customer` - Customer updated
  - Params: `customer_id`, `fields_changed[]`
- 🚧 `customer_note_add` - Note added to customer
  - Params: `customer_id`
- 🚧 `customer_merge` - Customers merged
  - Params: `source_customer_id`, `target_customer_id`
- 🚧 `customer_duplicate_detected` - Duplicate customer detected
  - Params: `customer_id`, `duplicate_match_type` (email, phone)

### Vehicles Management (🚧 Planned)
- 🚧 `create_vehicle` - New vehicle created
  - Params: `vehicle_id`, `customer_id`, `make`, `model`, `year`
- 🚧 `update_vehicle` - Vehicle updated
  - Params: `vehicle_id`, `fields_changed[]`
- 🚧 `vehicle_fitment_note_add` - Fitment note added
  - Params: `vehicle_id`, `part_fitted`
- 🚧 `vehicle_attachment_upload` - Attachment uploaded
  - Params: `vehicle_id`, `file_type`

### Inventory Management (🚧 Planned)
- 🚧 `inventory_item_create` - Inventory item created
  - Params: `item_id`, `product_id`, `sku`, `stock_on_hand`
- 🚧 `inventory_item_update` - Inventory item updated
  - Params: `item_id`, `fields_changed[]`
- 🚧 `inventory_stock_adjust` - Stock adjusted
  - Params: `item_id`, `adjustment_type` (add, remove, correction), `quantity`, `reason`
- 🚧 `inventory_reorder_point_set` - Reorder point set
  - Params: `item_id`, `reorder_point`
- 🚧 `inventory_low_stock_alert` - Low stock alert triggered
  - Params: `item_id`, `current_stock`, `reorder_point`
- 🚧 `inventory_stock_reserve` - Stock reserved
  - Params: `item_id`, `reservation_id`, `quantity`, `job_id`
- 🚧 `inventory_stock_use` - Stock used
  - Params: `item_id`, `reservation_id`, `quantity`, `job_id`
- 🚧 `inventory_stock_release` - Stock reservation released
  - Params: `item_id`, `reservation_id`

### Categories Management (🚧 Planned)
- 🚧 `category_create` - Category created
  - Params: `category_id`, `category_name`, `display_order`
- 🚧 `category_update` - Category updated
  - Params: `category_id`, `fields_changed[]`
- 🚧 `category_delete` - Category deleted
  - Params: `category_id`, `products_reassigned_count`
- 🚧 `category_reorder` - Category display order changed
  - Params: `category_id`, `old_order`, `new_order`

### Suppliers Management (🚧 Planned)
- 🚧 `supplier_create` - Supplier created
  - Params: `supplier_id`, `supplier_name`
- 🚧 `supplier_update` - Supplier updated
  - Params: `supplier_id`, `fields_changed[]`
- 🚧 `supplier_set_preferred` - Supplier set as preferred for category
  - Params: `supplier_id`, `category_id`

### Purchase Orders (🚧 Planned)
- 🚧 `po_create` - Purchase order created
  - Params: `po_id`, `po_number`, `supplier_id`, `po_total`, `source` (low_stock, manual)
- 🚧 `po_update` - Purchase order updated
  - Params: `po_id`, `fields_changed[]`
- 🚧 `po_send` - Purchase order sent to supplier
  - Params: `po_id`, `po_number`, `supplier_id`, `delivery_method`
- 🚧 `po_status_change` - PO status changed
  - Params: `po_id`, `old_status`, `new_status` (draft, sent, received, reconciled, cancelled)
- 🚧 `po_receive` - Purchase order received
  - Params: `po_id`, `po_number`, `items_received_count`, `discrepancies_count`
- 🚧 `po_reconcile` - Purchase order reconciled
  - Params: `po_id`, `po_number`
- 🚧 `po_eta_overdue` - PO ETA overdue
  - Params: `po_id`, `po_number`, `days_overdue`

### Orders Management (🚧 Planned)
- 🚧 `order_create` - Customer order created (from shop)
  - Params: `order_id`, `order_number`, `customer_id`, `order_total`, `order_items_count`
- 🚧 `order_status_change` - Order status changed
  - Params: `order_id`, `old_status`, `new_status` (pending, processing, shipped, delivered, cancelled)
- 🚧 `order_process` - Order processed
  - Params: `order_id`, `order_number`
- 🚧 `order_cancel` - Order cancelled
  - Params: `order_id`, `order_number`, `cancellation_reason`
- 🚧 `order_ship` - Order shipped
  - Params: `order_id`, `order_number`, `tracking_number`

### Reports & Analytics (🚧 Planned)
- 🚧 `report_generate` - Report generated
  - Params: `report_type` (sales, cycle_time, margin, lead_source), `date_range`, `filters`
- 🚧 `report_export` - Report exported
  - Params: `report_type`, `export_format` (pdf, csv, excel)
- 🚧 `funnel_view` - Funnel analysis viewed
  - Params: `funnel_type` (lead_to_quote, quote_to_job, job_to_invoice)

### Events Explorer (🚧 Planned)
- 🚧 `event_filter` - Events filtered
  - Params: `filter_type`, `filter_value`
- 🚧 `event_export` - Events exported
  - Params: `export_format` (csv, json), `event_count`

### System Health (🚧 Planned)
- 🚧 `health_check` - Health check performed
  - Params: `services_checked[]`, `errors_found`
- 🚧 `error_log_view` - Error log viewed
  - Params: `error_type`, `date_range`
- 🚧 `performance_metric_view` - Performance metrics viewed
  - Params: `metric_type` (page_load, api_response, query_time)

### Users & Roles (🚧 Planned)
- 🚧 `user_invite` - User invited
  - Params: `user_email`, `user_role`
- 🚧 `user_create` - User account created
  - Params: `user_id`, `user_email`, `user_role`
- 🚧 `user_update` - User updated
  - Params: `user_id`, `fields_changed[]`
- 🚧 `user_remove` - User removed
  - Params: `user_id`
- 🚧 `user_role_change` - User role changed
  - Params: `user_id`, `old_role`, `new_role`
- 🚧 `permissions_view` - Permissions matrix viewed

### Templates Management (🚧 Planned)
- 🚧 `template_create` - Template created
  - Params: `template_id`, `template_type` (quote, checklist, email, sms, service_package)
- 🚧 `template_update` - Template updated
  - Params: `template_id`, `fields_changed[]`
- 🚧 `template_delete` - Template deleted
  - Params: `template_id`
- 🚧 `template_use` - Template used
  - Params: `template_id`, `template_type`, `context` (quote, job, email)

### Integrations Management (🚧 Planned)
- 🚧 `integration_configure` - Integration configured
  - Params: `integration_type` (ga4, payment, email, webhook), `integration_name`
- 🚧 `integration_test` - Integration tested
  - Params: `integration_type`, `test_result` (success, failed)
- 🚧 `webhook_create` - Webhook created
  - Params: `webhook_id`, `webhook_url`, `events[]`
- 🚧 `api_key_create` - API key created
  - Params: `key_id`, `key_name`, `permissions[]`
- 🚧 `api_key_revoke` - API key revoked
  - Params: `key_id`

### Audit Log (🚧 Planned)
- 🚧 `audit_log_view` - Audit log viewed
  - Params: `filters_applied[]`
- 🚧 `audit_log_export` - Audit log exported
  - Params: `export_format` (csv, pdf, json), `log_count`
- 🚧 `audit_log_filter` - Audit log filtered
  - Params: `filter_type`, `filter_value`
- 🚧 `suspicious_activity_flag` - Suspicious activity flagged
  - Params: `log_id`, `flag_reason`, `auto_flagged` (true/false)

### Services Management (🚧 Planned)
- 🚧 `service_create` - Service created
  - Params: `service_id`, `service_name`, `service_price`, `service_duration`
- 🚧 `service_update` - Service updated
  - Params: `service_id`, `fields_changed[]`
- 🚧 `service_delete` - Service deleted
  - Params: `service_id`

---

## System & Error Events

### Performance Events
- 📋 `page_load_slow` - Page load exceeds threshold
  - Params: `page_url`, `load_time_ms`, `threshold_ms`
- 📋 `api_request_slow` - API request slow
  - Params: `endpoint`, `response_time_ms`, `threshold_ms`
- 📋 `firestore_query_slow` - Firestore query slow
  - Params: `collection`, `query_time_ms`, `threshold_ms`

### Error Events
- 📋 `error_occurred` - Error caught and logged
  - Params: `error_type`, `error_message`, `error_stack`, `page_url`, `user_id`
- 📋 `firestore_error` - Firestore operation failed
  - Params: `error_code`, `operation_type`, `collection`, `error_message`
- 📋 `storage_error` - Storage operation failed
  - Params: `error_code`, `operation_type`, `file_path`, `error_message`
- 📋 `auth_error` - Authentication error
  - Params: `error_code`, `error_message`, `operation_type`

### Security Events
- 📋 `unauthorized_access_attempt` - Unauthorized access attempted
  - Params: `user_id`, `requested_resource`, `required_permission`
- 📋 `suspicious_activity_detected` - Suspicious pattern detected
  - Params: `activity_type`, `pattern_type`, `severity`
- 📋 `rate_limit_exceeded` - Rate limit exceeded
  - Params: `endpoint`, `limit_type`, `user_id`

---

## E-commerce Funnel Events

### Purchase Funnel
- 📋 `view_product` → `add_to_cart` → `cart_view` → `checkout_start` → `checkout_complete`
- 📋 `view_product` → `add_to_wishlist` → `wishlist_view` → `add_to_cart` → `checkout_complete`

### Lead Funnel
- 📋 `page_view` → `quote_request_start` → `quote_request_submit` → `lead_created`
- 📋 `page_view` → `call_click` / `email_click` → `lead_created`

---

## Event Parameters Best Practices

### Always Include (when available)
- `user_id` - User identifier (hashed if PII concern)
- `timestamp` - Event timestamp (usually auto-added)
- `page_url` - Current page URL
- `session_id` - Session identifier

### Never Include (PII)
- ❌ Full names
- ❌ Email addresses (use hashed or anonymized)
- ❌ Phone numbers
- ❌ Physical addresses
- ❌ Credit card information
- ❌ Passwords or tokens

### Recommended Parameters
- `value` - Monetary value (for revenue tracking)
- `currency` - Currency code (default: AUD)
- `category` - Item category
- `item_id` - Item identifier
- `item_name` - Item name (non-PII)
- `quantity` - Quantity (for cart/order events)

---

## Implementation Status Summary

- **✅ Implemented**: 8 events (admin_login, create_product, update_product, delete_product, product_view, add_to_cart, add_to_wishlist, share_product, call_click, email_click, map_click, quote_request_submit, lead_submit)
- **🚧 Planned**: ~150+ events (from workflow diagrams)
- **📋 Recommended**: ~30+ events (additional tracking opportunities)

---

## Notes

1. **Event Naming**: All events use `snake_case` convention
2. **Parameter Naming**: Use `snake_case` for parameters as well
3. **Value Tracking**: Include `value` parameter for revenue-related events
4. **Privacy**: Never log PII (personally identifiable information)
5. **Consistency**: Use consistent parameter names across similar events
6. **Documentation**: Update this file when adding new events

---

**Last Updated**: January 2025
**Total Events**: ~190+ possible events
**Implemented**: 13 events
**Planned**: ~150 events
**Recommended**: ~30 events






