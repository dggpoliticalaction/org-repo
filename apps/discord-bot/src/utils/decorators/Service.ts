import { singleton } from 'tsyringe';
import { type constructor } from 'tsyringe/dist/typings/types';

export const keptInstances = new Set<constructor<any>>();

interface ServiceOptions {
  keepInstanceAfterHmr?: boolean
}

export function Service<T>(options: ServiceOptions = {}) {
  return function (target: constructor<T>) {
    if (options.keepInstanceAfterHmr) keptInstances.add(target);

    return singleton()(target);
  };
}
