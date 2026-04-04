const MAX_PRICE = 99999999.99;

type T = (key: string, values?: Record<string, string | number>) => string;
type Errors = Record<string, string>;

export function validateRequired(value: string, field: string, errs: Errors, t: T) {
  if (!value.trim()) errs[field] = t("common.required");
}

export function validateMaxLength(value: string, field: string, max: number, errs: Errors, t: T) {
  if (value.length > max) errs[field] = t("common.tooLong", { max });
}

export function validateDate(value: string, field: string, errs: Errors, t: T) {
  if (!value) errs[field] = t("common.required");
}

export function validateDateRange(
  startDate: string,
  endDate: string,
  errs: Errors,
  t: T
) {
  if (!startDate) errs.start_date = t("common.required");
  if (!endDate) errs.end_date = t("common.required");
  if (startDate && endDate && startDate > endDate) {
    errs.end_date = t("common.endBeforeStart");
  }
}

export function validatePrice(
  raw: FormDataEntryValue | null,
  errs: Errors,
  t: T
): number {
  const price = Number(raw);
  if (!raw || isNaN(price)) {
    errs.price = t("common.required");
    return 0;
  }
  if (price < 0) errs.price = t("common.priceNegative");
  else if (price > MAX_PRICE) errs.price = t("common.priceTooLarge");
  return price;
}

export function validateKm(
  rawCurrent: FormDataEntryValue | null,
  rawNext: FormDataEntryValue | null,
  errs: Errors,
  t: T
): { currentKm: number; nextChangeKm: number } {
  const currentKm = Number(rawCurrent);
  const nextChangeKm = Number(rawNext);

  if (!rawCurrent || isNaN(currentKm)) errs.current_km = t("common.required");
  else if (currentKm < 0) errs.current_km = t("common.kmNegative");

  if (!rawNext || isNaN(nextChangeKm)) errs.next_change_km = t("common.required");
  else if (nextChangeKm < 0) errs.next_change_km = t("common.kmNegative");

  if (
    !errs.current_km &&
    !errs.next_change_km &&
    nextChangeKm <= currentKm
  ) {
    errs.next_change_km = t("common.nextKmBeforeCurrent");
  }

  return { currentKm, nextChangeKm };
}

export function validateYear(
  raw: string,
  errs: Errors,
  t: T,
  { field = "year", min = 1900, max = 2099, required = false } = {}
): number | null {
  if (!raw) {
    if (required) errs[field] = t("common.required");
    return null;
  }
  const year = Number(raw);
  if (isNaN(year) || year < min || year > max) {
    errs[field] = t("common.invalidDate");
  }
  return year;
}

export function hasErrors(errs: Errors): boolean {
  return Object.keys(errs).length > 0;
}
