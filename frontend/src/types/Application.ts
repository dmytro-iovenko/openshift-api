/**
 * Represents an application entity.
 * @typedef {Object} Application
 * @property {string} _id - Unique identifier for the application.
 * @property {string} name - Name of the application.
 * @property {string} description - Description of the application.
 * @property {string} image - Docker image associated with the application.
 * @property {string} deploymentName - Name of the deployment in OpenShift.
 * @property {string} createdAt - Timestamp of when the application was created.
 * @property {string} updatedAt - Timestamp of when the application was last updated.
 */
export interface Application {
  _id: string;
  name: string;
  description?: string;
  image: string;
  deploymentName: string;
  createdAt: string;
  updatedAt: string;
}
