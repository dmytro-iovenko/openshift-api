/**
 * Represents an application entity.
 * @typedef {Object} Application
 * @property {string} id - Unique identifier for the application.
 * @property {string} name - Name of the application.
 * @property {string} image - Docker image associated with the application.
 */
export interface Application {
  id: string;
  name: string;
  image: string;
}
