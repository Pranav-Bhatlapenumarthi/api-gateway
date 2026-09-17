import { ServiceRegistry } from "../registry/serviceRegistry.js";
import { type Service } from "../registry/service.model.js";

export class RouteResolver {
  serviceReg: ServiceRegistry;
  constructor(serviceReg: ServiceRegistry) {
    this.serviceReg = serviceReg;
  }

  resolve(path: string): Service | undefined {
    const serviceList = this.serviceReg.getAll();
    let bestMatch: Service | undefined = undefined;

    for (const serv of serviceList) {      
      if (!serv.enabled) { // Ignore disabled services 
        continue;
      }

      // Check whether the service prefix matches the path
      const matches = path === serv.prefix || path.startsWith(serv.prefix + "/");

      if (!matches) {
        continue;
      }

      // Keep the longest matching prefix
      if (bestMatch === undefined || serv.prefix.length > bestMatch.prefix.length){
        bestMatch = serv;
      }
    }

    return bestMatch;
  }
}