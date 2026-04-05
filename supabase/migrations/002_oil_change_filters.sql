ALTER TABLE public.oil_change
  ADD COLUMN filter_oil boolean NOT NULL DEFAULT false,
  ADD COLUMN filter_air boolean NOT NULL DEFAULT false,
  ADD COLUMN filter_cabin boolean NOT NULL DEFAULT false,
  ADD COLUMN filter_fuel boolean NOT NULL DEFAULT false;