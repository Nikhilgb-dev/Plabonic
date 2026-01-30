export type SalaryType = "Monthly" | "LPA" | "CTC";

export const formatIndianInput = (value: string) => {
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return new Intl.NumberFormat("en-IN").format(Number(digits));
};

export const parseIndianInput = (value: string) => {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : undefined;
};

export const formatIndianNumber = (value?: number) => {
  if (value === undefined || value === null) return "";
  return new Intl.NumberFormat("en-IN").format(value);
};

export const formatSalaryRange = (
  minSalary?: number,
  maxSalary?: number,
  salaryType?: string
) => {
  if (!minSalary && !maxSalary) return "";
  const prefix = salaryType ? `${salaryType} ` : "";
  if (minSalary && maxSalary) {
    return `${prefix}₹${formatIndianNumber(minSalary)} - ₹${formatIndianNumber(maxSalary)}`;
  }
  if (minSalary) {
    return `${prefix}From ₹${formatIndianNumber(minSalary)}`;
  }
  return `${prefix}Up to ₹${formatIndianNumber(maxSalary)}`;
};
