import { Application } from "../types/Application";

/**
 * Fetches the list of applications from the API.
 * @returns {Promise<Application[]>} A promise that resolves to an array of applications.
 */
export const fetchApplications = async (): Promise<Application[]> => {
  // Replace with actual API call
  return [
    { id: "1", name: "App 1", image: "httpd:latest" },
    { id: "2", name: "App 2", image: "httpd:latest" },
  ];
};
