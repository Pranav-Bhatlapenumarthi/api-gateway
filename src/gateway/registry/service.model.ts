// this file only defines the shape of the service model
// it is independent of the actual service implementation

export interface Service {
  name: string;
  prefix: string;
  target: string;
  enabled: boolean;
}