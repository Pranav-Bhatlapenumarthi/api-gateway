import { type Service } from './service.model.js';

export class ServiceRegistry {
  private readonly services = new Map<string, Service>();

  // to register a new service in the registry
  register(service: Service): void {
    if (this.services.has(service.name)) {
      throw new Error(
        `Service with name ${service.name} already exists.`
      );
    }

    // to check any existing prefixes with same service name
    for (const existingService of this.services.values()) {
      if (existingService.prefix === service.prefix) {
        throw new Error(
          `Service with prefix ${service.prefix} already exists.`
        );
      }
    }

    this.services.set(service.name, service);
  }

  // to find the service using prefix
  findPrefix(prefix: string): Service | undefined {
    for (const service of this.services.values()) {
      if (service.prefix === prefix && service.enabled) {
        return service;
      }
    }

    return undefined
  }

  // to find the service using name
  get(name: string): Service | undefined {
    for (const service of this.services.values()) {
      if (service.name === name && service.enabled) {
        return service;
      }
    }
    return undefined
  }
  
  // to get list of all existing services
  getAll(): Service[] {
    return Array.from(this.services.values());
  }

  // to remove a service from the registry
  remove(name: string): void {
    const flag = this.services.delete(name);
    if (flag) {
      console.log(`Service ${name} removed successfully`);
    }
  }
}

