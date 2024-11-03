/**
 * JSON Schema for a Deployment in OpenShift.
 *
 * This schema defines the structure for a deployment object, including
 * metadata and specifications for replicas and containers.
 *
 * @typedef {Object} DeploymentSchema
 * @property {string} apiVersion - The API version of the deployment.
 * @property {string} kind - The kind of resource, must be "Deployment".
 * @property {Object} metadata - Metadata about the deployment.
 * @property {string} metadata.name - The name of the deployment.
 * @property {Object} metadata.labels - Labels associated with the deployment.
 * @property {Object} spec - Specifications for the deployment.
 * @property {number} spec.replicas - The desired number of replicas.
 * @property {Object} spec.selector - Selector for the deployment.
 * @property {Object} spec.template - Template for the deployment's pod.
 * @property {Object} spec.template.metadata - Metadata for the pod template.
 * @property {Object} spec.template.spec - Specification for the pod template.
 * @property {Array<Object>} spec.template.spec.containers - List of containers.
 * @property {string} spec.template.spec.containers[].name - The name of the container.
 * @property {string} spec.template.spec.containers[].image - The image for the container.
 *
 * @type {DeploymentSchema}
 */
const deploymentSchema = {
  type: "object",
  properties: {
    apiVersion: { type: "string" },
    kind: { type: "string", enum: ["Deployment"] },
    metadata: {
      type: "object",
      properties: {
        name: { type: "string" },
        labels: { type: "object" },
      },
      required: ["name"],
    },
    spec: {
      type: "object",
      properties: {
        replicas: { type: "integer" },
        selector: { type: "object" },
        template: {
          type: "object",
          properties: {
            metadata: { type: "object" },
            spec: {
              type: "object",
              properties: {
                containers: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      image: { type: "string" },
                    },
                    required: ["name", "image"],
                  },
                },
              },
            },
          },
          required: ["metadata", "spec"],
        },
      },
      required: ["replicas", "selector", "template"],
    },
  },
  required: ["apiVersion", "kind", "metadata", "spec"],
};

export default deploymentSchema;
