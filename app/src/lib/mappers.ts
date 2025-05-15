import {
  COMPANYSIZE,
  COMPANYTYPE,
} from "@/sdk";

type Config = { label: string; color: string };

const baseColors = {
  orange:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  yellow:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  purple:
    "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  slate: "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-300",
  sky: "bg-sky-100 text-sky-800 dark:bg-sky-900 dark:text-sky-300",
  indigo:
    "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  violet:
    "bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-300",
  pink: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  rose: "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300",
  emerald:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300",
  teal: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
};

export const companyTypeConfig: Record<
  COMPANYTYPE,
  Config
> = {
  [COMPANYTYPE.Educational]: {
    label: "Educational",
    color: baseColors.orange,
  },
  [COMPANYTYPE.GovernmentAgency]: {
    label: "Government",
    color: baseColors.red,
  },
  [COMPANYTYPE.NonProfit]: {
    label: "Non Profit",
    color: baseColors.green,
  },
  [COMPANYTYPE.Partnership]: {
    label: "Partnership",
    color: baseColors.yellow,
  },
  [COMPANYTYPE.PrivatelyHeld]: {
    label: "Private Company",
    color: baseColors.blue,
  },
  [COMPANYTYPE.PublicCompany]: {
    label: "Public Company",
    color: baseColors.purple,
  },
  [COMPANYTYPE.SelfEmployed]: {
    label: "Self Employed",
    color: baseColors.orange,
  },
  [COMPANYTYPE.SelfOwned]: {
    label: "Self Owned",
    color: baseColors.orange,
  },
};

export const companySizeConfig: Record<
  COMPANYSIZE,
  Config
> = {
  [COMPANYSIZE.NotSpecified]: {
    label: "Not specified",
    color: baseColors.slate,
  },
  [COMPANYSIZE._110Employees]: {
    label: "1-10 employees",
    color: baseColors.sky,
  },
  [COMPANYSIZE._1150Employees]: {
    label: "11-50 employees",
    color: baseColors.indigo,
  },
  [COMPANYSIZE._51200Employees]: {
    label: "51-200 employees",
    color: baseColors.violet,
  },
  [COMPANYSIZE._201500Employees]: {
    label: "201-500 employees",
    color: baseColors.pink,
  },
  [COMPANYSIZE._5011000Employees]: {
    label: "501-1000 employees",
    color: baseColors.rose,
  },
  [COMPANYSIZE._10015000Employees]: {
    label: "1,001-5,000 employees",
    color: baseColors.emerald,
  },
  [COMPANYSIZE._500110000Employees]: {
    label: "5,001-10,000 employees",
    color: baseColors.emerald,
  },
  [COMPANYSIZE._10001Employees]: {
    label: "10,001+ employees",
    color: baseColors.teal,
  },
};
