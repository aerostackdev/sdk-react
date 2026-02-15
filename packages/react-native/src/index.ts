import { DatabaseService } from './services/DatabaseService';
import { AuthenticationService } from './services/AuthenticationService';
import { CacheService } from './services/CacheService';
import { QueueService } from './services/QueueService';
import { StorageService } from './services/StorageService';
import { AIService } from './services/AIService';
import { ServicesInvocationService } from './services/ServicesInvocationService';

export class Aerostack {
  apiKey: string;
  baseUrl: string;

  database: DatabaseService;
  authentication: AuthenticationService;
  cache: CacheService;
  queue: QueueService;
  storage: StorageService;
  ai: AIService;
  servicesInvocation: ServicesInvocationService;

  constructor(apiKey: string, baseUrl = 'https://api.aerostack.ai/v1') {
    if (!apiKey.startsWith('ac_secret_')) {
      throw new Error('Invalid API key provided for Aerostack. Please make sure you are using a valid key.');
    }

    this.apiKey = apiKey;
    this.baseUrl = baseUrl;

    this.database = new DatabaseService(this.apiKey, this.baseUrl);
    this.authentication = new AuthenticationService(this.apiKey, this.baseUrl);
    this.cache = new CacheService(this.apiKey, this.baseUrl);
    this.queue = new QueueService(this.apiKey, this.baseUrl);
    this.storage = new StorageService(this.apiKey, this.baseUrl);
    this.ai = new AIService(this.apiKey, this.baseUrl);
    this.servicesInvocation = new ServicesInvocationService(this.apiKey, this.baseUrl);
  }
}