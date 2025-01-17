import { Application } from "./Application";

/**
 * Represents details of an OpenShift deployment.
 */
export interface OpenShiftDetails {
  kind: string; // Type of resource, e.g., "Deployment"
  apiVersion: string; // API version, e.g., "apps/v1"
  metadata: {
    name: string; // Name of the deployment
    namespace: string; // Namespace in which the deployment exists
    uid: string; // Unique identifier
    resourceVersion: string; // Resource version
    creationTimestamp: string; // Timestamp of creation
    labels: Record<string, string>; // Labels for the deployment
    annotations: Record<string, string>; // Annotations for the deployment
  };
  spec: {
    replicas: number; // Desired number of replicas
    selector: {
      matchLabels: Record<string, string>; // Selector for the pods
    };
    template: {
      metadata: {
        labels: Record<string, string>; // Labels for the pod template
      };
      spec: {
        containers: Array<{
          name: string; // Name of the container
          image: string; // Image used for the container
          ports: Array<{
            containerPort: number; // Port exposed by the container
            protocol: string; // Protocol used
          }>;
          resources?: {}; // Resource requirements (optional)
          terminationMessagePath?: string; // Path for termination messages (optional)
          terminationMessagePolicy?: string; // Termination message policy (optional)
          imagePullPolicy?: string; // Image pull policy (optional)
        }>;
        restartPolicy: string; // Restart policy for the pods
      };
    };
    strategy: {
      type: string; // Update strategy type
      rollingUpdate?: {
        maxUnavailable: string; // Maximum unavailable pods during update
        maxSurge: string; // Maximum number of pods that can be created over desired replicas
      };
    };
    revisionHistoryLimit: number; // Number of old replica sets to retain
    progressDeadlineSeconds: number; // Time to wait for a deployment to progress
  };
  status: {
    observedGeneration: number; // Last observed generation
    replicas: number; // Current number of replicas
    updatedReplicas: number; // Number of updated replicas
    unavailableReplicas: number; // Number of unavailable replicas
    conditions: Array<{
      type: string; // Type of condition, e.g., "Available"
      status: string; // Status of the condition, e.g., "True"
      lastUpdateTime: string; // Last time the condition was updated
      reason: string; // Reason for the condition
      message: string; // Human-readable message indicating details about the condition
    }>;
  };
}

/**
 * Represents a deployment with associated metadata and status.
 */
export interface Deployment {
  _id: string; // Unique identifier from MongoDB
  name: string; // Name of the deployment
  status: string; // Current status of the deployment (e.g., Running, Failed)
  image: string; // Image used for the deployment
  createdAt: string; // Creation timestamp
  updatedAt: string; // Last updated timestamp
  applicationId: string; // ID of the application this deployment belongs to
  application: Application; // ID of the application this deployment belongs to
  replicas: number; // Total desired replicas
  availableReplicas: number; // Available replicas
  unavailableReplicas: number; // Unavailable replicas
  updatedReplicas: number; // Updated replicas
  conditions: Array<{
    type: string; // Type of condition (e.g., "Available", "Progressing")
    status: string; // Status of the condition (e.g., "True", "False")
    lastTransitionTime: string; // Last time the condition was updated
    reason: string; // Reason for the condition
    message: string; // Human-readable message indicating details about the condition
  }>; // Conditions for the deployment
  labels: Record<string, string>[]; // Labels for the deployment
  selector: Record<string, string>; // Pod selector for the deployment
  age: string; // Age of the deployment, typically calculated as time since created
  envVars: Record<string, string>[]; // Environment variables for the deployment
  paused: boolean; // Whether the deployment is paused
  strategy: string; // Update strategy for the deployment
  maxSurge: string; // Maximum number of pods that can be created over desired replicas
  maxUnavailable: string; // Maximum number of unavailable pods during update
}
