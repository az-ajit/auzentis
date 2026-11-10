// Shared age-band classification — mirrors the SQL compute_age_band() function
// in auzentis_institute_supabase_schema.sql. Used client-side only for instant
// UI feedback; the database trigger is the source of truth on write.

const AGE_BANDS = [
  { code: "A", label: "3-5", min: 3, max: 5 },
  { code: "B", label: "6-9", min: 6, max: 9 },
  { code: "C", label: "10-13", min: 10, max: 13 },
  { code: "D", label: "14-17", min: 14, max: 17 },
  { code: "E", label: "18-25", min: 18, max: 25 },
  { code: "F", label: "26-40", min: 26, max: 40 },
  { code: "G", label: "41-60", min: 41, max: 60 },
  { code: "H", label: "61-75", min: 61, max: 75 },
  { code: "I", label: "76-100", min: 76, max: 100 },
];

const PILOT_AGE_BAND_CODES = ["B", "C", "D", "E"];

function ageFromDob(dobStr) {
  const dob = new Date(dobStr);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const notYetBirthday =
    today.getMonth() < dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());
  if (notYetBirthday) age -= 1;
  return age;
}

function ageBandForDob(dobStr) {
  const age = ageFromDob(dobStr);
  const band = AGE_BANDS.find((b) => age >= b.min && age <= b.max);
  return band || null;
}
