// Sorting functions
export function descendingComparator<T extends Record<string, any>>(a: T, b: T, orderBy: string): number {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

export function getComparator<Order extends string>(order: "asc" | "desc", orderBy: Order) {
  return order === "desc"
    ? (a: any, b: any) => descendingComparator(a, b, orderBy)
    : (a: any, b: any) => -descendingComparator(a, b, orderBy);
}

// Filter function
export const applyFilter = (
  data: any[],
  selectedFilters: { [key: string]: string[] },
  convertLabelsToString: Function
) => {
  return data.filter((item) => {
    const matchesColumnFilters = Object.keys(selectedFilters).every((column) => {
      const selectedValues = selectedFilters[column];

      if (selectedValues && selectedValues.length > 0 && !selectedValues.includes("All")) {
        let value: any;

        if (column === "availability") {
          value = item.availableReplicas > 0 ? "Available" : "Not Available";
        } else if (column === "labels") {
          value = convertLabelsToString(item.labels).join(" ");
        } else {
          value = item[column];
        }

        if (Array.isArray(value)) {
          return selectedValues.some((selectedValue) =>
            value.some((subValue) => subValue.toLowerCase().includes(selectedValue.toLowerCase()))
          );
        }

        if (typeof value === "string") {
          return selectedValues.some((selectedValue) => value.toLowerCase().includes(selectedValue.toLowerCase()));
        } else if (typeof value === "number" || typeof value === "boolean") {
          return selectedValues.some((selectedValue) =>
            value.toString().toLowerCase().includes(selectedValue.toLowerCase())
          );
        }

        return false;
      }

      return true;
    });

    return matchesColumnFilters;
  });
};

// Calculate the age of the deployment
export const calculateAge = (createdAt: string) => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - createdDate.getTime()) / 1000);
  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(diffInSeconds / 3600);
  const days = Math.floor(diffInSeconds / 86400);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (minutes < 60) return `${minutes}m ${diffInSeconds % 60}s`;
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  return `${days}d ${hours % 24}h`;
};
