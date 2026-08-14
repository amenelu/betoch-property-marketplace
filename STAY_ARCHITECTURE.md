# Stay marketplace decisions

- Betoch supports sale, long-term rent, medium-term rent, and short-stay listings. Pricing supports fixed nightly, weekly, monthly, sale, cleaning-fee, and deposit entries.
- Availability is host-managed and date-range based. There is no Airbnb or Booking.com synchronization.
- A booking is a request, not a paid reservation. Only the guest may cancel; only the host may approve, reject, or mark an approved stay complete.
- Reviews require a completed booking, are limited to one per booking, and are enforced by the API and PostgreSQL RLS.
- Verification flags are independent manual checks for host, location, photos, and amenities. They are never presented as legal ownership guarantees.
- Property images remain public; verification and identity documents remain in the private bucket and admin-only read policy.
- The MVP intentionally has no payments, escrow, payouts, dynamic pricing, insurance, legal contracts, or complex cancellation engine.
