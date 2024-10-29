
/**
 * Represents an application with an id, name, and image.
 */
export interface Application {
    id: number;
    name: string;
    image: string;
}

/**
 * A list of dummy applications used for testing purposes.
 * Each application has an id, name, and image.
 */
export const dummyApplications: Application[] = [
    { id: 1, name: 'App 1', image: 'httpd:2.4' },
    { id: 2, name: 'App 2', image: 'nginx:latest' },
    { id: 3, name: 'App 3', image: 'alpine:latest' },
];
  