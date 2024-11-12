// tableUtils.ts

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
        } else if (column === "age") {
          value = calculateAge(item.createdAt);
        } else {
          value = item[column];
        }

        if (column === "age") {
          return selectedValues.some((selectedValue) => {
            const rowAgeInDays = calculateAgeInDays(item.createdAt);

            if (selectedValue === "Less than 1 day" && rowAgeInDays < 1) return true;
            if (selectedValue === "1-2 days" && rowAgeInDays >= 1 && rowAgeInDays <= 2) return true;
            if (selectedValue === "More than 2 days" && rowAgeInDays > 2) return true;
            return false;
          });
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

// Helper function to calculate age in days for easier comparison in filters
export const calculateAgeInDays = (createdAt: string) => {
  const createdDate = new Date(createdAt);
  const now = new Date();
  const diffInMilliseconds = now.getTime() - createdDate.getTime();
  const diffInDays = diffInMilliseconds / (1000 * 3600 * 24); // Convert milliseconds to days
  return diffInDays;
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

// Helper function to get distinct filter values for a given column
export const getDistinctValues = (columnId: string, data: any[]) => {
  if (columnId === "age") {
    return ["Less than 1 day", "1-2 days", "More than 2 days"];
  }
  const uniqueValues = new Set<string>();
  data.forEach((row) => {
    if (columnId === "labels" && row[columnId]) {
      row[columnId].forEach((label: string) => uniqueValues.add(label)); // Handle "labels" which is an array
    } else if (row[columnId]) {
      uniqueValues.add(row[columnId].toString()); // Handle other columns
    }
  });
  return Array.from(uniqueValues);
};

// Helper function to handle sorting
export const handleRequestSort = (property: string, orderBy: string, order: "asc" | "desc", setOrder: Function, setOrderBy: Function) => {
  const isAsc = orderBy === property && order === "asc";
  setOrder(isAsc ? "desc" : "asc");
  setOrderBy(property);
};

// Helper function to handle filter menu click
export const handleFilterMenuClick = (event: React.MouseEvent<HTMLElement>, column: string, setFilterColumn: Function, setFilterMenuAnchor: Function) => {
  setFilterColumn(column);
  setFilterMenuAnchor(event.currentTarget);
};

// Helper function to close the filter menu
export const closeFilterMenu = (setFilterMenuAnchor: Function) => setFilterMenuAnchor(null);

// Helper function to reset the filter for a given column
export const resetColumnFilter = (filterColumn: string, setSelectedFilters: Function) => {
  setSelectedFilters((prev: any) => {
    const updatedFilters = { ...prev };
    delete updatedFilters[filterColumn];
    return updatedFilters;
  });
};
