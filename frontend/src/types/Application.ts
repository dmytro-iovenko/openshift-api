import { Deployment } from "./Deployment";

/**
 * Represents an application entity.
 * @typedef {Object} Application
 * @property {string} _id - Unique identifier for the application.
 * @property {string} name - Name of the application.
 * @property {string} description - Description of the application.
 * @property {string} image - Docker image associated with the application.
 * @property {string} slug - Slug for the application.
 * @property {Deployment[]} deployments - List of deployments.
 * @property {string} createdAt - Timestamp of when the application was created.
 * @property {string} updatedAt - Timestamp of when the application was last updated.
 */
export interface Application {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  deployments: Deployment[];
  createdAt: string;
  updatedAt: string;
}
