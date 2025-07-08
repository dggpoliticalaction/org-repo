import { createRequire } from 'node:module';
import { URL } from 'node:url';

import { type HttpService } from './index.js';
import {
  type LoginClusterResponse,
  type RegisterClusterRequest,
  type RegisterClusterResponse,
} from '../models/master-api/index.js';

const require = createRequire(import.meta.url);
const Config = require('../../config/config.json');

export class MasterApiService {
  private clusterId: string;

  constructor(private httpService: HttpService) {}

  public async register(): Promise<void> {
    const reqBody: RegisterClusterRequest = {
      shardCount: Config.clustering.shardCount,
      callback: {
        url: Config.clustering.callbackUrl,
        token: Config.api.secret,
      },
    };

    const res = await this.httpService.post(
      new URL('/clusters', Config.clustering.masterApi.url),
      Config.clustering.masterApi.token,
      reqBody,
    );

    if (!res.ok) {
      throw res;
    }

    const resBody = (await res.json()) as RegisterClusterResponse;
    this.clusterId = resBody.id;
  }

  public async login(): Promise<LoginClusterResponse> {
    const res = await this.httpService.put(
      new URL(`/clusters/${this.clusterId}/login`, Config.clustering.masterApi.url),
      Config.clustering.masterApi.token,
    );

    if (!res.ok) {
      throw res;
    }

    return (await res.json()) as LoginClusterResponse;
  }

  public async ready(): Promise<void> {
    const res = await this.httpService.put(
      new URL(`/clusters/${this.clusterId}/ready`, Config.clustering.masterApi.url),
      Config.clustering.masterApi.token,
    );

    if (!res.ok) {
      throw res;
    }
  }
}
